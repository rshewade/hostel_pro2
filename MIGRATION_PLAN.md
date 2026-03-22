# Migration Plan: Hostel Pro — Node/Supabase → Bun/PostgreSQL

## Context

The existing hostel management system (`/home/ubuntu/projects/hostel_old/repo/`) is a monorepo with a NestJS backend + Next.js 16 frontend, using Supabase for database, auth, and file storage. The goal is to modernize the stack by:
- Switching runtime from **Node.js → Bun**
- Switching database access from **Supabase JS client → Drizzle ORM + direct PostgreSQL**
- Switching auth from **Supabase Auth → Better Auth**
- Switching storage from **Supabase Storage → Local filesystem**
- Merging the **NestJS backend into Next.js** (single app)

Target directory: `/mnt/data/projects/devbox/hostel_pro2`

---

## Phase 0: Project Setup

**Create the Bun-powered Next.js project with all foundational config.**

Files to create:
- `package.json` — Bun manifest, `"type": "module"`, scripts for dev/build/test/migrate
- `bunfig.toml` — Bun config
- `tsconfig.json` — TypeScript 5.9, strict, ESM paths
- `next.config.ts` — App Router, standalone output, sharp external
- `drizzle.config.ts` — Drizzle pointing to `DATABASE_URL`
- `postcss.config.mjs` — Tailwind 4
- `.env.example` — All env vars (see below)
- `.gitignore`
- `src/lib/db/index.ts` — Drizzle client init with `postgres` driver
- `src/i18n/config.ts` — Supported locales (`en`, `hi`), default locale
- `src/i18n/request.ts` — `getRequestConfig` that reads `locale` cookie
- `next.config.ts` must wrap with `createNextIntlPlugin()`

Key dependencies to **add**: `next`, `react`, `react-dom`, `drizzle-orm`, `postgres`, `drizzle-kit`, `better-auth`, `razorpay`, `sharp`, `pdf-lib`, `archiver`, `lucide-react`, `tailwindcss`, `zod`, `vitest`, `next-intl`

Dependencies to **drop**: `@supabase/supabase-js`, all `@nestjs/*`, `passport*`, `jsonwebtoken`, `class-validator`, `class-transformer`, `pdfkit`, `swagger-ui-express`

Env vars:
```
DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, ENCRYPTION_KEY, HASH_SALT,
RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET,
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER,
MSG91_AUTH_KEY, MSG91_TEMPLATE_ID, UPLOAD_DIR=./uploads, SIGNED_URL_SECRET, CRON_SECRET,
SMS_MODE=mock, RAZORPAY_MODE=mock, NOTIFICATION_MODE=mock,
EMAIL_PROVIDER=console, EMAIL_FROM=noreply@hostelpro.local,
RESEND_API_KEY, SENDGRID_API_KEY, WHATSAPP_MODE=mock
```

**Mock mode env vars** (allow development without 3rd party keys):
- `SMS_MODE=mock|live` — When `mock`, OTP is always `123456`, no SMS sent. Default: `mock`
- `RAZORPAY_MODE=mock|live` — When `mock`, uses fake order/payment IDs. Default: `mock`
- `NOTIFICATION_MODE=mock|live` — When `mock`, all notifications log to console. Default: `mock`
- `EMAIL_PROVIDER=console|resend|sendgrid|ses` — Email delivery backend. `console` logs only. Default: `console`
- `WHATSAPP_MODE=mock|live` — When `mock`, WhatsApp messages log to console. Default: `mock`
- When `mock`, the corresponding 3rd party keys (`TWILIO_*`, `MSG91_*`, `RAZORPAY_*`, `RESEND_*`, `SENDGRID_*`) are not required

**Verify:** `bun install` succeeds, `bun run dev` starts Next.js, `import postgres from 'postgres'` works, `import { createCipheriv } from 'crypto'` works.

---

## Phase 1: Database Schema (Drizzle)

**Convert 11 Supabase SQL migrations (~3910 lines) into Drizzle schema files.**

Files to create under `src/lib/db/schema/`:
| File | Tables |
|------|--------|
| `enums.ts` | All 14 pgEnum definitions (user_role, application_status, etc.) |
| `users.ts` | users |
| `applications.ts` | applications |
| `documents.ts` | documents |
| `rooms.ts` | rooms, room_allocations |
| `fees.ts` | fees, payments |
| `leaves.ts` | leave_requests |
| `audit.ts` | audit_logs |
| `devices.ts` | device_sessions |
| `compliance.ts` | consent_logs, applications_archive, audit_reports |
| `gateway.ts` | gateway_payments, reconciliation_logs |
| `notifications.ts` | notifications, notification_rules |
| `config.ts` | leave_types, blackout_dates |
| `index.ts` | Re-export all |
| `relations.ts` | Drizzle relations |

**Triggers** (not managed by Drizzle): Create `drizzle/custom/triggers.sql` with:
- `update_updated_at_column()` — auto-update timestamps
- `validate_application_status_transition()` — status transition rules
- `manage_room_occupancy()` — occupancy count management
- Audit triggers

**Key note:** `users.auth_user_id` changes from Supabase auth FK to Better Auth user FK.

**Verify:** `bunx drizzle-kit generate` + `bunx drizzle-kit push` creates all tables. `bunx drizzle-kit studio` shows correct structure.

Source: `/home/ubuntu/projects/hostel_old/repo/backend/migrations/000_create_database_schema.sql` through `010_seed_students_table.sql`

---

## Phase 2: Auth (Better Auth)

**Replace Supabase Auth with Better Auth + custom OTP plugin.**

Files to create:
- `src/lib/auth/index.ts` — Better Auth server config (Drizzle adapter, phone plugin, session config)
- `src/lib/auth/client.ts` — Better Auth React client hooks
- `src/lib/auth/otp-provider.ts` — SMS provider interface + live (Twilio/MSG91) and mock implementations
- `src/lib/auth/rbac.ts` — Role-based access control (replaces Supabase RLS)
- `src/app/api/auth/[...all]/route.ts` — Better Auth catch-all handler
- `src/middleware.ts` — Session checking middleware

**Auth flow migration:**
- Old: `supabase.auth.signInWithOtp()` → `supabase.auth.verifyOtp()` → Supabase JWT
- New: `POST /api/auth/otp/send` (sends SMS, stores OTP hash) → `POST /api/auth/otp/verify` (verifies, creates Better Auth session cookie)

**Architecture:** Keep existing `users` table for app data, link to Better Auth's user table via `users.auth_user_id`. Better Auth manages auth tables; our `users` table stores roles, verticals, profiles.

**RLS replacement:** All access control becomes middleware + service-layer `requireRole()` checks.

### SMS Mock Strategy (`SMS_MODE=mock`)

The OTP provider uses a common interface with swappable implementations:

```typescript
// src/lib/auth/otp-provider.ts
interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}

// Chosen by SMS_MODE env var
function getSmsProvider(): SmsProvider {
  if (process.env.SMS_MODE === 'live') {
    return new TwilioProvider();  // or MSG91Provider
  }
  return new MockSmsProvider();
}
```

**Mock behavior:**
- `sendOtp()` — logs to console, does NOT send real SMS
- OTP verification always accepts `123456` as valid code
- All auth flows (login, verify, session) work identically
- Tests use mock mode by default — no Twilio/MSG91 keys needed
- Console output: `[MOCK SMS] OTP 123456 sent to +919876543210`

**Switch to live:** Set `SMS_MODE=live` + provide `TWILIO_*` or `MSG91_*` keys in `.env`

Source: `/home/ubuntu/projects/hostel_old/repo/backend/src/auth/auth.service.ts`, `jwt.strategy.ts`, `roles.guard.ts`

**Verify:** OTP send/verify works in mock mode, password login works, sessions persist, role-based guards block unauthorized access.

---

## Phase 3: Core Services Migration

**Migrate 18+ NestJS services into `src/lib/services/` as plain TypeScript modules.**

| Old NestJS Service | New File | Key Change |
|---|---|---|
| `users.service.ts` | `src/lib/services/users.ts` | `supabase.from()` → Drizzle queries |
| `applications.service.ts` | `src/lib/services/applications.ts` | Same |
| `payments.service.ts` | `src/lib/services/payments.ts` | Same |
| `razorpay.service.ts` | `src/lib/services/razorpay.ts` | Interface + mock/live swap via `RAZORPAY_MODE` |
| `documents.service.ts` | `src/lib/services/documents.ts` | **Major rewrite** — local FS |
| `document-processor.service.ts` | `src/lib/services/document-processor.ts` | Storage calls change |
| `bulk-download.service.ts` | `src/lib/services/bulk-download.ts` | Local file ops |
| `crypto.service.ts` | `src/lib/services/crypto.ts` | Remove NestJS decorators |
| `consent.service.ts` | `src/lib/services/consent.ts` | Drizzle queries |
| `data-retention.service.ts` | `src/lib/services/data-retention.ts` | API endpoint cron |
| `audit.service.ts` | `src/lib/services/audit.ts` | Drizzle insert |
| `leaves.service.ts` | `src/lib/services/leaves.ts` | Drizzle queries |
| `rooms.service.ts` | `src/lib/services/rooms.ts` | Drizzle queries |
| `device-sessions.service.ts` | `src/lib/services/device-sessions.ts` | Drizzle queries |
| `receipt.service.ts` | `src/lib/services/receipt.ts` | Keep PDF generation |
| `reconciliation.service.ts` | `src/lib/services/reconciliation.ts` | Drizzle queries |
| *(new)* | `src/lib/services/notifications.ts` | **New** — notification dispatch service |
| *(new)* | `src/lib/notifications/index.ts` | **New** — channel providers (SMS, Email, WhatsApp, In-App) |
| *(new)* | `src/lib/notifications/channels/sms.ts` | **New** — SMS channel (Twilio/MSG91 + mock) |
| *(new)* | `src/lib/notifications/channels/email.ts` | **New** — Email channel (Resend/SendGrid/SES + console mock) |
| *(new)* | `src/lib/notifications/channels/whatsapp.ts` | **New** — WhatsApp channel (Twilio WhatsApp + mock) |
| *(new)* | `src/lib/notifications/channels/in-app.ts` | **New** — In-app notifications (DB insert) |
| *(new)* | `src/lib/notifications/template.ts` | **New** — Template renderer with `{{variable}}` substitution |

**Pattern changes:**
- `@Injectable()` classes → plain exported functions/classes
- `@Inject(SUPABASE_CLIENT)` → imported `db` from `@/lib/db`
- `ConfigService.get()` → `process.env.*`
- `{ data, error }` return → try/catch (Drizzle throws on error)
- `@Cron()` → API endpoint triggered by external cron

Also create:
- `src/lib/errors.ts` — Error class hierarchy (see `CLAUDE.md > Error Handling` for full spec):
  - `AppError` (base) → `NotFoundError` (404), `ForbiddenError` (403), `UnauthorizedError` (401), `ValidationError` (400), `ConflictError` (409), `RateLimitError` (429)
  - Services throw these errors; API routes catch and transform to JSON `{ error: { code, message, status, details? } }`
- `src/lib/logger.ts` — Simple logger utility
- `src/lib/api/error-handler.ts` — Shared API error response helper that catches AppError/ZodError and returns standardized JSON

### Razorpay Mock Strategy (`RAZORPAY_MODE=mock`)

The Razorpay service uses a common interface with swappable implementations:

```typescript
// src/lib/services/razorpay.ts
interface PaymentGateway {
  createOrder(amount: number, currency: string, receipt: string): Promise<Order>;
  verifyPayment(orderId: string, paymentId: string, signature: string): boolean;
  fetchPayment(paymentId: string): Promise<Payment>;
}

function getPaymentGateway(): PaymentGateway {
  if (process.env.RAZORPAY_MODE === 'live') {
    return new RazorpayLive();  // uses real Razorpay SDK
  }
  return new RazorpayMock();
}
```

**Mock behavior:**
- `createOrder()` — returns fake order ID (`order_mock_<timestamp>`)
- `verifyPayment()` — always returns `true` (signature check passes)
- `fetchPayment()` — returns realistic payment object with status `captured`
- Webhook simulation: mock generates valid-looking webhook payloads
- Receipt generation works identically (uses mock payment data)
- Console output: `[MOCK RAZORPAY] Order order_mock_1234 created for ₹5000`

**Switch to live:** Set `RAZORPAY_MODE=live` + provide `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` in `.env`

**Tests:** All payment tests use mock mode by default — zero external dependencies

### Notification Service Strategy (`NOTIFICATION_MODE=mock`)

**The old project had notification infrastructure (DB schema, rules, templates) but never implemented actual delivery.** We build it properly with the same mock/live pattern.

#### Architecture

```
src/lib/notifications/
├── index.ts              ← Main dispatch: notify(event, context) → routes to channels
├── template.ts           ← Renders {{variable}} templates from notification_rules table
└── channels/
    ├── sms.ts            ← SMS_MODE=mock|live (reuses Twilio/MSG91 from auth)
    ├── email.ts          ← EMAIL_PROVIDER=console|resend|sendgrid|ses
    ├── whatsapp.ts       ← WHATSAPP_MODE=mock|live (Twilio WhatsApp API)
    └── in-app.ts         ← Always live — inserts into notifications table

src/lib/services/
└── notifications.ts      ← Business logic: which events trigger which channels
```

#### How it works

```typescript
// src/lib/notifications/index.ts
interface NotificationChannel {
  send(to: string, message: string, metadata?: Record<string, unknown>): Promise<void>;
}

// Dispatches to all enabled channels based on notification_rules
async function notify(event: NotificationEvent, context: Record<string, string>) {
  const rules = await getActiveRules(event);
  for (const rule of rules) {
    const message = renderTemplate(rule.template, context);
    if (rule.channels.sms) await getSmsChannel().send(phone, message);
    if (rule.channels.email) await getEmailChannel().send(email, message);
    if (rule.channels.whatsapp) await getWhatsAppChannel().send(phone, message);
    // In-app always fires
    await getInAppChannel().send(userId, message, { event, rule });
  }
}
```

#### Notification Events (from old DB schema)

| Event | Triggered By | Recipients | Channels |
|-------|-------------|-----------|----------|
| `LEAVE_APPLICATION` | Student submits leave | Parent | SMS, WhatsApp, In-App |
| `LEAVE_APPROVAL` | Superintendent approves | Parent, Student | SMS, WhatsApp, Email, In-App |
| `LEAVE_REJECTION` | Superintendent rejects | Parent, Student | SMS, WhatsApp, Email, In-App |
| `EMERGENCY` | Superintendent flags | Parent | SMS, WhatsApp (immediate) |
| `ARRIVAL` | Student checks in | Parent | SMS, In-App |
| `DEPARTURE` | Student checks out | Parent | SMS, In-App |
| `PAYMENT_RECEIVED` | Payment confirmed | Student, Parent | Email, SMS, In-App |
| `PAYMENT_DUE` | Fee approaching deadline | Student, Parent | Email, SMS, In-App |
| `ROOM_ALLOCATED` | Room assigned | Student | Email, In-App |
| `APPLICATION_STATUS` | Status changes | Student | Email, SMS, In-App |
| `AUDIT_REPORT` | Monthly report generated | Trustees | Email, In-App |

#### Channel implementations

**SMS (`sms.ts`):**
- `SMS_MODE=mock`: logs `[MOCK SMS] To: +91xxx Message: ...` to console
- `SMS_MODE=live`: uses Twilio (primary) or MSG91 (fallback) — same providers as OTP auth

**Email (`email.ts`):**
- `EMAIL_PROVIDER=console`: logs `[MOCK EMAIL] To: x@y.com Subject: ... Body: ...` to console
- `EMAIL_PROVIDER=resend`: uses Resend API
- `EMAIL_PROVIDER=sendgrid`: uses SendGrid API
- `EMAIL_PROVIDER=ses`: uses AWS SES
- All share same interface: `send(to, subject, html, text)`

**WhatsApp (`whatsapp.ts`):**
- `WHATSAPP_MODE=mock`: logs `[MOCK WHATSAPP] To: +91xxx Message: ...` to console
- `WHATSAPP_MODE=live`: uses Twilio WhatsApp API (same Twilio credentials as SMS)

**In-App (`in-app.ts`):**
- Always live — inserts into `notifications` table in database
- No mock needed — it's just a DB insert
- Frontend reads from `GET /api/notifications` endpoint
- Bell icon shows unread count

#### Database tables (Phase 1 schema)

```
notifications table:
  id, user_id, event_type, title, message, channel,
  read (boolean), read_at, metadata (jsonb),
  created_at, updated_at

notification_rules table (from old schema):
  id, event_type, timing, channels (jsonb),
  verticals (jsonb), template, is_active,
  created_at, updated_at
```

#### Templates

Templates use `{{variable}}` substitution from the `notification_rules.template` column:
```
"Your child {{student_name}} has applied for leave from {{start_date}} to {{end_date}}."
"Payment of ₹{{amount}} received. Receipt: {{receipt_number}}"
"Room {{room_number}} has been allocated to {{student_name}}."
```

#### API Routes (Phase 5)

- `GET /api/notifications` — List user's notifications (paginated)
- `PATCH /api/notifications/[id]/read` — Mark as read
- `PATCH /api/notifications/read-all` — Mark all as read
- `GET /api/notifications/unread-count` — For bell icon badge
- `GET /api/config/notification-rules` — List rules (admin)
- `POST /api/config/notification-rules` — Create rule (admin)
- `PUT /api/config/notification-rules` — Update rule (admin)
- `DELETE /api/config/notification-rules` — Delete rule (admin)

**Tests:** All notification tests use mock mode — zero external dependencies. Test that events trigger correct channels, templates render correctly, in-app notifications persist.

Source: `/home/ubuntu/projects/hostel_old/repo/backend/src/` (all service files)

---

## Phase 4: Storage Migration

**Replace Supabase Storage with local filesystem + HMAC signed URLs.**

Files to create:
- `src/lib/storage/index.ts` — upload, download, delete, list (using `Bun.write()` / `Bun.file()`)
- `src/lib/storage/signed-urls.ts` — HMAC-SHA256 signed URL generation & verification
- `src/app/api/storage/[...path]/route.ts` — Serve files via signed URLs
- `uploads/.gitkeep` — Upload directory (gitignored)

Directory structure:
```
uploads/
  applications-documents/{userId}/{appId}/{timestamp}_{filename}
  student-documents/{userId}/...
  undertakings/{userId}/...
  system-generated/bulk-downloads/...
```

**Translation map:**
- `supabase.storage.from(bucket).upload()` → `Bun.write(path, buffer)`
- `supabase.storage.from(bucket).download()` → `Bun.file(path).arrayBuffer()`
- `supabase.storage.from(bucket).remove()` → `fs.unlink(path)`
- `supabase.storage.from(bucket).createSignedUrl()` → HMAC token with expiry

Source: `/home/ubuntu/projects/hostel_old/repo/backend/src/documents/documents.service.ts`

---

## Phase 5: API Routes

**Consolidate old NestJS endpoints + old frontend API routes into unified Next.js API routes.**

~40 route files under `src/app/api/`:
- `auth/[...all]/`, `auth/otp/send/`, `auth/otp/verify/`, `auth/first-time-setup/`
- `users/`, `users/profile/`
- `applications/`, `applications/[id]/`, `applications/[id]/status/`
- `documents/`, `documents/upload/`, `documents/[id]/`, `documents/[id]/url/`, `documents/bulk-download/`
- `storage/[...path]/`
- `fees/`, `payments/`, `payments/verify/`, `payments/webhook/`
- `rooms/`, `rooms/allocate/`
- `leaves/`, `leaves/[id]/`
- `renewals/`
- `interviews/`, `interviews/[id]/complete/`
- `dashboard/student/`, `dashboard/superintendent/`, `dashboard/trustee/`, `dashboard/accounts/`, `dashboard/parent/`
- `config/leave-types/`, `config/blackout-dates/`
- `compliance/consents/`, `compliance/audit/`
- `student/exit-request/`
- `parent/student/`, `parent/fees/`, `parent/leave/`
- `admin/cron/data-retention/`
- `health/`

Each route calls service functions from Phase 3, with auth/RBAC checks from Phase 2.

---

## Phase 6: Frontend Components

**Move 280 TS/TSX files, updating data fetching and auth.**

- Copy `src/app/` pages, `src/components/`, `src/types/` from old frontend
- Replace all `@supabase/supabase-js` imports with:
  - API `fetch()` calls (client components)
  - Direct service calls (server components)
- Replace Supabase auth context with Better Auth client hooks
- Create `src/components/providers/auth-provider.tsx`
- Evaluate removing `react-router-dom` dependency (unusual in Next.js)
- **All user-facing text must use `next-intl` translation keys** (see Phase 6A below)

Source: `/home/ubuntu/projects/hostel_old/repo/frontend/src/`

---

## Phase 6A: Internationalization (i18n)

**Add Hindi language support using `next-intl` with cookie-based locale switching.**

### Architecture Decisions
- **Library**: `next-intl` — best App Router support, type-safe, works with both server and client components
- **Locale strategy**: Cookie-based (`locale` cookie), **no URL prefix** — avoids `/en/dashboard` vs `/hi/dashboard` complexity
- **Default locale**: `en` (English), falls back when no cookie set
- **Supported locales**: `en` (English), `hi` (Hindi / हिन्दी)

### Files to create

**i18n infrastructure:**
- `src/i18n/config.ts` — Locale list, default locale, locale display names
- `src/i18n/request.ts` — `getRequestConfig()` that reads `locale` cookie and loads messages
- `next.config.ts` — Wrap existing config with `createNextIntlPlugin()`
- `src/app/layout.tsx` — Wrap with `<NextIntlClientProvider>`

**Translation message files:**
```
messages/
├── en/
│   ├── common.json         ← Nav, buttons, errors, footer, generic labels
│   ├── auth.json           ← Login, OTP, verify, first-time setup
│   ├── dashboard.json      ← Dashboard titles/labels per role
│   ├── applications.json   ← Application form, status labels, tracking
│   ├── rooms.json          ← Room allocation, capacity, occupancy
│   ├── fees.json           ← Fee types, payment labels, receipts
│   ├── leaves.json         ← Leave request, approval, calendar
│   ├── documents.json      ← Upload, download, document types
│   └── settings.json       ← Profile, preferences
└── hi/
    └── (same structure, Hindi translations)
```

**Language toggle component:**
- `src/components/language-toggle.tsx` — Toggle/dropdown on landing page and app header
  - Sets `locale` cookie via `document.cookie` or server action
  - Triggers page reload/revalidation to apply new locale
  - Shows current language with flag or label (EN / हिन्दी)

### How components use translations

**Server components:**
```tsx
import { getTranslations } from 'next-intl/server';
export default async function DashboardPage() {
  const t = await getTranslations('Dashboard');
  return <h1>{t('title')}</h1>;
}
```

**Client components:**
```tsx
'use client';
import { useTranslations } from 'next-intl';
export function StatusBadge({ status }) {
  const t = useTranslations('Applications');
  return <span>{t(`status.${status}`)}</span>;
}
```

**With variables:**
```json
{ "welcome": "Welcome, {name}!" }
{ "welcome": "स्वागत है, {name}!" }
```
```tsx
t('welcome', { name: user.fullName })
```

### Translation organization rules
- **One JSON file per feature domain** — matches the app's module structure
- **Namespaced keys** — `useTranslations('Applications')` scopes to `applications.json`
- **Flat-ish keys with dot notation** — `status.pending`, `form.fullName`, `error.notFound`
- **English is the source of truth** — write `en/` first, then translate to `hi/`
- **No hardcoded user-facing strings** in components — every visible string goes through `t()`
- **Keep translations simple** — avoid complex ICU nesting; use variables for dynamic values
- **Shared strings go in `common.json`** — buttons ("Save", "Cancel"), errors, nav items

### Migration approach for existing components
When migrating a component in Phase 6:
1. Identify all hardcoded English strings in the component
2. Create corresponding keys in the relevant `en/*.json` file
3. Replace strings with `t('key')` calls
4. Add Hindi translations to `hi/*.json`
5. The language toggle component goes on:
   - **Landing page** — prominent toggle for unauthenticated users
   - **App header/navbar** — accessible toggle for authenticated users

### What NOT to translate
- Database field names and enum values
- API response keys
- Log messages and developer-facing errors
- Code comments
- URLs and route paths

### Verify
- Landing page renders correctly in both `en` and `hi`
- Language toggle switches locale and page re-renders in new language
- All dashboard pages show correct translations per role
- Forms are fully translated (labels, placeholders, validation messages, buttons)
- Date/number formatting respects locale (`next-intl` built-in formatters)

Source: New feature — no old codebase equivalent.

---

## Phase 7: Crypto & Compliance

**Verify Bun compatibility for all crypto operations.**

Bun supports all Node.js `crypto` APIs used:
- `createCipheriv('aes-256-gcm')` / `createDecipheriv`
- `createHmac('sha256')` / `createHash('sha256')`
- `randomBytes()`, `getAuthTag()`, `setAuthTag()`

**No code changes needed** — just remove NestJS decorators and use `process.env` for keys.

Replace `@nestjs/schedule` cron with `POST /api/admin/cron/data-retention/` endpoint protected by `CRON_SECRET` header, triggered externally.

Source: `/home/ubuntu/projects/hostel_old/repo/backend/src/compliance/crypto.service.ts`

---

## Phase 8: Testing

**Full strategy defined in `TESTING_STRATEGY.md`** — 4-layer testing pyramid.

### Layer 1 — Unit Tests (Vitest)
- `vitest.config.ts` — jsdom environment for components, node for services
- `src/lib/services/__tests__/*.unit.test.ts` — Service logic tests
- `src/components/__tests__/*.test.tsx` — Component render + interaction tests
- `src/types/__tests__/*.unit.test.ts` — Zod schema validation tests

### Layer 2 — Integration Tests (Vitest + real PostgreSQL)
- `vitest.integration.config.ts` — Separate config, sequential execution
- `src/lib/services/__tests__/*.integration.test.ts` — Service → DB tests
- `src/app/api/__tests__/*.api.test.ts` — Full API route tests (auth + RBAC + happy path)
- Test database: `hostel_pro2_test` (dedicated, truncated between tests)
- Test fixtures: `src/test/fixtures.ts` — Factory functions for test data

### Layer 3 — E2E Tests (Playwright Test)
- `playwright.config.ts` — 4 browser projects (Chromium, Firefox, WebKit, Mobile)
- `e2e/tests/*.e2e.test.ts` — 10 critical user flows
- `e2e/pages/*.page.ts` — Page Object Model
- `e2e/fixtures/` — Auth helpers, data seeding

### Layer 4 — Visual Testing (Playwright CLI)
- Managed by `/visual-test` skill and `visual-tester` agent
- `.visual-tests/baselines/` — Approved reference screenshots (committed)
- Per-page baselines at 3 breakpoints: desktop, tablet, mobile

### Test-per-phase rule
Every phase must include its tests before being considered complete. See `TESTING_STRATEGY.md` for the phase-by-phase breakdown.

---

## Phase 9: Docker & Deployment

**Update for Bun runtime + self-hosted PostgreSQL.**

- `Dockerfile` — Multi-stage build with `oven/bun:1.2-alpine`, `apk add vips-dev` for Sharp
- `docker-compose.yml` — PostgreSQL 18 service + app service with `uploads` volume
- `docker-compose.prod.yml` — Production variant

Key changes: `oven/bun:1.2-alpine (was node:20.9.0-alpine)` → `oven/bun:1.2-alpine`, add PG service, add uploads volume mount.

---

## Execution Order

```
Phase 0 (Setup — includes next-intl config)
    ↓
Phase 1 (Schema) ──→ Phase 2 (Auth)
    ↓                    ↓
Phase 3 (Services) ←────┘
    ↓
Phase 4 (Storage) ──→ Phase 5 (API Routes)
    ↓                    ↓
Phase 7 (Crypto)    Phase 6 (Frontend) → Phase 6A (i18n — en + hi translations)
    ↓                                        ↓
Phase 8 (Testing) ──────────────────────→ Phase 9 (Docker)
```

**Note:** Phase 6A runs after Phase 6 because components must exist before extracting strings into translation files. However, the i18n infrastructure (`src/i18n/`, `next-intl` plugin) is set up in Phase 0 so components can use `t()` from the start.

## File Reuse Strategy

Source: `/home/ubuntu/projects/hostel_old/repo/`

### Category A — Direct copy (100% reusable, ~12 files)
| Source File | Target | Notes |
|---|---|---|
| `backend/src/applications/applications.types.ts` | `src/types/applications.ts` | Pure types, no deps |
| `backend/src/payments/payments.types.ts` | `src/types/payments.ts` | Pure types |
| `backend/src/rooms/rooms.types.ts` | `src/types/rooms.ts` | Pure types |
| `backend/src/leaves/leaves.types.ts` | `src/types/leaves.ts` | Pure types |
| `backend/src/documents/documents.types.ts` | `src/types/documents.ts` | Pure types |
| `backend/src/devices/device.types.ts` | `src/types/devices.ts` | Pure types |
| `backend/src/audit/audit.types.ts` | `src/types/audit.ts` | Pure types |
| `frontend/src/types/api.ts` | `src/types/api.ts` | 781 lines of interfaces/enums |
| `frontend/src/lib/api/index.ts` | `src/lib/api/index.ts` | apiRequest(), buildUrl() helpers |
| `frontend/src/lib/responsive.tsx` | `src/lib/responsive.tsx` | React context/hooks, no framework coupling |

### Category B — Light adaptation (70-95% reusable, ~15 files)
Strip `@Injectable()`, replace `ConfigService.get()` → `process.env`, replace `new Logger()` → custom logger. Core business logic stays identical.

| Source Service | Reuse % | What stays | What changes |
|---|---|---|---|
| `compliance/crypto.service.ts` | 99% | All encrypt/decrypt/HMAC logic | Remove decorator |
| `devices/device-sessions.service.ts` | 80% | Device fingerprinting, IP extraction | Remove decorator, Drizzle queries |
| `payments/razorpay/razorpay.service.ts` | 80% | Razorpay API calls, HMAC signature verification | Remove decorator |
| `payments/receipt.service.ts` | 70% | PDF generation logic | Remove decorator |
| `documents/document-processor.service.ts` | 80% | Sharp image processing, watermark logic | Storage calls change |
| `documents/bulk-download.service.ts` | 70% | ZIP/PDF merge logic (archiver, pdf-lib) | Storage calls change |
| `payments/reconciliation.service.ts` | 75% | Reconciliation math | Drizzle queries |
| All `dto/*.dto.ts` files | 80% | Validation rules | Replace class-validator → Zod schemas |

### Category C — Moderate rewrite (80-90% logic reusable, ~10 files)
Business logic around queries stays identical. Only `supabase.from().select().eq()` → Drizzle `db.select().from().where()`.

| Source Service | Reuse % | What stays | What changes |
|---|---|---|---|
| `applications/applications.service.ts` | 85% | Tracking number gen, status transitions, pagination | Query syntax |
| `users/users.service.ts` | 90% | Role/vertical extraction, user validation | Query syntax |
| `documents/documents.service.ts` | 85% | File validation, permission checks, path generation | Queries + storage API |
| `payments/payments.service.ts` | 85% | Receipt numbering, fee calculation, payment validation | Query syntax |
| `rooms/rooms.service.ts` | 85% | Capacity validation, occupancy calculations | Query syntax |
| `leaves/leaves.service.ts` | 85% | Date overlap checking, status transitions | Query syntax |
| `audit/audit.service.ts` | 70% | Log formatting, metadata structure | Query syntax |
| `compliance/consent.service.ts` | 70% | Consent validation, version checking | Query syntax |
| `compliance/data-retention.service.ts` | 70% | Retention calculation, export/deletion logic | Query syntax + cron |

### Category D — Discard / Major rewrite
| Source Files | Action |
|---|---|
| All `*.module.ts` (NestJS DI config) | Discard |
| All `*.controller.ts` (NestJS controllers) | Rewrite as Next.js route handlers (keep HTTP method/param definitions as reference) |
| `auth/auth.service.ts` | Rewrite around Better Auth (keep OTP flow logic as reference) |
| `auth/jwt.strategy.ts`, `jwt-auth.guard.ts`, `roles.guard.ts` | Replace with Better Auth middleware + RBAC |
| `frontend/src/lib/supabase/client.ts`, `server.ts` | Replace with Better Auth + Drizzle |
| `migration/*.ts` | Discard (Drizzle handles migrations) |
| `common/filters/`, `common/interceptors/` | Rewrite as Next.js middleware |

### Frontend Components (~280 files)
- **Pure UI components** (buttons, cards, modals) — 90%+ reusable, copy directly
- **Dashboard/page layouts** — 40-60% reusable, keep layout, replace data fetching
- **Form components with Supabase calls** — 30-50% reusable, extract form logic

---

## Estimated Scope

- ~15 schema files (Drizzle — new, includes notifications)
- ~12 type files (copied from old project)
- ~22 service files (15 adapted from old, 7 new including notifications)
- ~7 notification files (dispatcher, template renderer, 4 channel providers, service)
- ~45 API route files (new, using old controllers as reference, includes notification routes)
- ~280 frontend files (copied + updated imports)
- ~5 auth files (Better Auth — new)
- ~3 storage files (local FS — new)
- ~3 Docker/config files (new)
- ~2 i18n config files (new)
- ~18 translation JSON files (9 per locale × 2 locales: en, hi)
- ~1 language toggle component (new)
