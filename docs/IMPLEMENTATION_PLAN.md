# Implementation Plan — Hostel Pro Rebuild

## Context

The previous build attempt produced 21 bugs and a critical audit report revealing systemic quality failures: tautological mocks, near-zero integration tests (2/22 services), mocked RBAC that verified nothing, missing Zod validation, no CI pipeline, and connection pool exhaustion. This rebuild incorporates every lesson learned as **enforceable gates**, not aspirational prose.

**Old codebase (reference)**: `/home/ubuntu/projects/hostel_old/repo/` (NestJS backend + Next.js 16 frontend + Supabase)
**Previous build (design reference only)**: `/home/ubuntu/projects/hostel_pro2/` — frontend components copied to `design/` folder for visual reference, NOT used as source code
**Target**: `/mnt/data/projects/devbox/hostel_pro2_new/` (Bun + Next.js App Router + Drizzle + Better Auth)
**Git repo**: `https://github.com/rshewade/hostel_pro22.git`
**Dev server port**: `3005` (all configs, tests, and scripts use this port)

### Design Reference

Frontend design reference files from the previous build are stored in `design/` (115 files). These are read-only reference for UI patterns, component structure, and layout — NOT copied as source code. All source code is written fresh.

---

## Gaps Addressed From Previous Build (Not In Original MIGRATION_PLAN.md)

These items were discovered during the previous build and are now baked into the plan:

1. **Shared types directory** (`src/types/`) — Old project had 781 lines of interfaces/enums in `types/api.ts`. Must be created with Drizzle-inferred types + shared API response types.
2. **Standardized API response format** — Previous build had inconsistent list responses (`{data, total}` vs `{data}`). All list endpoints return `{ data, pagination: { total, page, limit, totalPages } }`.
3. **Test factories with full detail** — Previous integration tests failed because factories were incomplete. Must create factories for ALL entities from Phase 1.
4. **Auth test helpers** — `createTestSession(role)` must create real Better Auth sessions, not mock objects. This is the linchpin of the anti-mocked-auth testing strategy.
5. **Env validation at startup** — Previous build had runtime crashes from missing env vars. `src/lib/env.ts` validates all required vars at import time.
6. **Better Auth trusted origins** — BUG-006: Must configure all dev ports (3000, 3001) + external IP from day one.
7. **Seed script for dev accounts** — Need 5 test accounts (one per role) for manual testing and E2E tests.
8. **Automated enforcement scripts** — Phase gate must programmatically verify integration test coverage, not rely on manual `ls | wc` checks.
9. **Frontend API client** — `src/lib/api/client.ts` wrapping `fetch()` with auth headers, error handling, typed responses.
10. **Track page error handling** — BUG-005: Invalid tracking number must show "not found" message, not infinite spinner.
11. **File upload handling** — Next.js App Router uses `req.formData()` not multer. Document upload routes need this pattern.
12. **Drizzle test config** — `drizzle.test.config.ts` pointing to `hostel_pro22_test` for schema push.

---

## Phase 0: Project Setup & Infrastructure

### Goal
Scaffold the project with ALL tooling, CI, and enforcement infrastructure before any application code. Nothing ships without automated gates.

### Files to Create

```
package.json                          # Bun manifest, scripts, dependencies
bunfig.toml                           # Bun config
tsconfig.json                         # TypeScript 5.9, strict, path aliases
next.config.ts                        # App Router, standalone, next-intl plugin
drizzle.config.ts                     # Drizzle -> DATABASE_URL
postcss.config.mjs                    # Tailwind CSS 4
.env.example                          # All env vars with defaults (mock modes)
.env.test                             # Test database URL
.eslintrc.json                        # ESLint config
.gitignore
scripts/
  phase-gate.sh                       # Executable gate: typecheck -> lint -> unit -> integration -> build
.github/
  workflows/
    ci.yml                            # CI pipeline (runs on every push/PR)
src/
  app/
    layout.tsx                        # Root layout with NextIntlClientProvider
    page.tsx                          # Landing page placeholder
    globals.css                       # @import "tailwindcss" + @theme block
  lib/
    db/
      index.ts                        # Drizzle client with globalThis caching
    errors.ts                         # AppError hierarchy (6 error classes)
    logger.ts                         # Structured logger (never logs PII)
    auth/
      resolve-user.ts                 # resolveUserId(session) -> app user ID
  i18n/
    config.ts                         # { locales: ['en', 'hi'], defaultLocale: 'en' }
    request.ts                        # getRequestConfig (reads locale cookie, dynamic import)
  middleware.ts                       # PUBLIC_PATHS constant + auth/locale middleware
  test/
    vitest.setup.ts                   # Global test setup
    integration.setup.ts              # testDb connection, cleanDb(), closeDb()
    factories.ts                      # Test data factory functions (skeleton)
    auth-helpers.ts                   # Create real test sessions (not mocked)
messages/
  en/common.json                      # Shared English strings
  hi/common.json                      # Shared Hindi strings
vitest.config.ts                      # Unit tests: *.unit.test.ts, *.test.tsx
vitest.integration.config.ts          # Integration: *.integration.test.ts, *.api.test.ts
drizzle.test.config.ts                # Drizzle config pointing to hostel_pro22_test
playwright.config.ts                  # E2E config
drizzle/
  custom/triggers.sql                 # Placeholder
uploads/.gitkeep                      # Local storage dir
e2e/.gitkeep                          # E2E test dir
src/
  types/
    index.ts                          # Re-export all types
    api.ts                            # Shared API response types (ApiResponse, PaginatedResponse)
    auth.ts                           # Session, AuthUser types
    enums.ts                          # TypeScript enums mirroring DB pgEnums (for frontend use)
  lib/
    env.ts                            # Environment variable validation (fail-fast on missing required vars)
    api/
      client.ts                       # Frontend fetch wrapper with auth headers + typed responses
      error-handler.ts                # Shared API route error handler
      response.ts                     # Standardized response helpers (paginated, success, error)
scripts/
  phase-gate.sh                       # Main gate script
  verify-test-coverage.sh             # Automated check: every service has integration test
  seed-dev-accounts.ts                # Creates 5 test accounts (one per role)
```

### Critical Implementation Details

**`src/lib/db/index.ts`** — Single globalThis-cached connection pool (prevents BUG-009):
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

function createDb() {
  const client = postgres(process.env.DATABASE_URL!, { max: 10 });
  return drizzle(client, { schema });
}

const globalForDb = globalThis as unknown as { db: ReturnType<typeof createDb> };
export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== 'production') globalForDb.db = db;
```

**`src/lib/auth/resolve-user.ts`** — Auth ID to App ID mapper (prevents BUG-018/019/020):
```typescript
export async function resolveUserId(session: Session): Promise<string> {
  const [user] = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.betterAuthUserId, session.user.id));
  if (!user) throw new NotFoundError('User profile not found for auth session');
  return user.id;
}
```

**`src/middleware.ts`** — Single source of truth for public paths (prevents BUG-001/015/016):
```typescript
export const PUBLIC_PATHS = [
  '/api/auth', '/api/otp', '/api/health',
  '/api/applications',     // POST only (public submission)
  '/apply', '/track', '/login',
  '/', '/about', '/contact', '/faq', '/facilities',
  '/gallery', '/news', '/trustees', '/donations', '/dpdp-policy',
] as const;

// RULE: If a path is in PUBLIC_PATHS, the route handler MUST NOT call requireAuth()
```

**`package.json` scripts**:
```json
{
  "dev": "bun --bun next dev --turbopack -p 3005",
  "build": "next build",
  "start": "bun --bun next start",
  "typecheck": "tsc --noEmit",
  "lint": "eslint src/ --ext .ts,.tsx",
  "test:unit": "vitest run --config vitest.config.ts",
  "test:integration": "vitest run --config vitest.integration.config.ts",
  "test:e2e": "playwright test",
  "test:all": "bun run test:unit && bun run test:integration && bun run test:e2e",
  "test:coverage": "vitest run --coverage",
  "phase:gate": "bash scripts/phase-gate.sh",
  "hooks:install": "cp scripts/pre-commit.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit"
}
```

**`vitest.config.ts`** — Coverage thresholds enforced (prevents Audit: no coverage):
```typescript
coverage: {
  provider: 'v8',
  thresholds: { statements: 70, branches: 60, functions: 70, lines: 70 },
}
```

**`.github/workflows/ci.yml`** (prevents Audit: no CI):
```yaml
name: CI
on: [push, pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env: { POSTGRES_DB: hostel_pro22_test, POSTGRES_USER: db_user1, POSTGRES_PASSWORD: testpass }
        ports: ['5432:5432']
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run test:unit
      - run: bun run test:integration
      - run: bun run build
```

**`src/lib/env.ts`** — Fail-fast environment validation (prevents runtime crashes from missing vars):
```typescript
function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}
function optional(key: string, fallback: string): string {
  return process.env[key] || fallback;
}

export const env = {
  DATABASE_URL: required('DATABASE_URL'),
  BETTER_AUTH_SECRET: required('BETTER_AUTH_SECRET'),
  BETTER_AUTH_URL: required('BETTER_AUTH_URL'),
  ENCRYPTION_KEY: optional('ENCRYPTION_KEY', ''),  // Optional in dev
  SIGNED_URL_SECRET: required('SIGNED_URL_SECRET'),
  SMS_MODE: optional('SMS_MODE', 'mock'),
  RAZORPAY_MODE: optional('RAZORPAY_MODE', 'mock'),
  NOTIFICATION_MODE: optional('NOTIFICATION_MODE', 'mock'),
  EMAIL_PROVIDER: optional('EMAIL_PROVIDER', 'console'),
  WHATSAPP_MODE: optional('WHATSAPP_MODE', 'mock'),
  UPLOAD_DIR: optional('UPLOAD_DIR', './uploads'),
  CRON_SECRET: optional('CRON_SECRET', 'dev-cron-secret'),
  // ... all other vars
};
```

**`src/types/api.ts`** — Standardized API response types (prevents Audit: inconsistent responses):
```typescript
export interface ApiResponse<T> {
  data: T;
}
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    status: number;
    details?: Array<{ field: string; message: string }>;
  };
}
```

**`src/lib/api/response.ts`** — Standardized response helpers:
```typescript
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return NextResponse.json({
    data,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}
```

**`src/test/factories.ts`** — Test data factories (critical for integration tests):
```typescript
// Every entity that can be created in integration tests needs a factory
export async function createTestUser(db, overrides?: Partial<typeof users.$inferInsert>) { ... }
export async function createTestApplication(db, userId: string, overrides?: Partial<...>) { ... }
export async function createTestRoom(db, overrides?: Partial<...>) { ... }
export async function createTestFee(db, studentId: string, overrides?: Partial<...>) { ... }
export async function createTestPayment(db, feeId: string, studentId: string, overrides?: Partial<...>) { ... }
export async function createTestLeave(db, studentId: string, overrides?: Partial<...>) { ... }
export async function createTestDocument(db, overrides?: Partial<...>) { ... }
export async function createTestInterview(db, applicationId: string, overrides?: Partial<...>) { ... }
export async function createTestNotification(db, userId: string, overrides?: Partial<...>) { ... }
export async function createTestConsent(db, userId: string, overrides?: Partial<...>) { ... }
// Each factory: inserts with sensible defaults, returns the created record with all fields
// Each factory: accepts overrides for any field to customize test data
```

**`src/test/auth-helpers.ts`** — Real auth session creation (THE anti-mocked-auth strategy):
```typescript
// Creates a REAL Better Auth session for a given role — NOT a mock
// This is used in every API integration test
export async function createTestSession(role: UserRole): Promise<{ cookie: string; userId: string }> {
  // 1. Create a Better Auth user via the auth API
  // 2. Create an app user profile in the users table with the given role
  // 3. Sign in to get a real session cookie
  // 4. Return the cookie string + app user ID
}
export async function getAuthCookie(role: UserRole): Promise<string> {
  // Convenience wrapper that just returns the cookie
}
```

**`scripts/verify-test-coverage.sh`** — Automated enforcement (not manual `ls | wc`):
```bash
#!/bin/bash
set -euo pipefail
SERVICES=$(find src/lib/services -maxdepth 1 -name '*.ts' ! -name 'index.ts' ! -name 'types.ts' | wc -l)
INTEGRATION_TESTS=$(find src/lib/services/__tests__ -name '*.integration.test.ts' | wc -l)
echo "Services: $SERVICES, Integration tests: $INTEGRATION_TESTS"
if [ "$INTEGRATION_TESTS" -lt "$SERVICES" ]; then
  echo "FAIL: Missing integration tests for $(($SERVICES - $INTEGRATION_TESTS)) services"
  # List which services are missing
  for svc in src/lib/services/*.ts; do
    name=$(basename "$svc" .ts)
    [[ "$name" == "index" || "$name" == "types" ]] && continue
    if [ ! -f "src/lib/services/__tests__/${name}.integration.test.ts" ]; then
      echo "  MISSING: $name"
    fi
  done
  exit 1
fi
echo "PASS: All services have integration tests"
```

**`scripts/phase-gate.sh`** — Enhanced with automated enforcement:
```bash
#!/bin/bash
set -euo pipefail
echo "=== Phase Gate ==="
echo "Step 1: Type check"
bun run typecheck
echo "Step 2: Lint"
bun run lint
echo "Step 3: Unit tests"
bun run test:unit
echo "Step 4: Integration tests"
bun run test:integration
echo "Step 5: Build"
bun run build
echo "Step 6: Verify integration test coverage"
bash scripts/verify-test-coverage.sh
echo "=== ALL GATES PASSED ==="
```

**`src/lib/auth/index.ts`** — Better Auth trusted origins (prevents BUG-006):
```typescript
export const auth = betterAuth({
  // ...
  trustedOrigins: [
    'http://localhost:3005',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://51.68.196.242:3005',
    process.env.BETTER_AUTH_URL,
  ].filter(Boolean),
  // ...
});
```

**`scripts/seed-dev-accounts.ts`** — Creates 5 test accounts for dev/E2E:
```typescript
// Creates one user per role with known credentials:
// student@test.com / Test1234! (STUDENT, BOYS vertical)
// super@test.com / Test1234! (SUPERINTENDENT, BOYS vertical)
// trustee@test.com / Test1234! (TRUSTEE)
// accounts@test.com / Test1234! (ACCOUNTS)
// parent@test.com / Test1234! (PARENT)
// Idempotent: skips if users already exist
```

### Phase 0 Gate
```bash
bun install                    # Dependencies resolve
bun run typecheck              # TypeScript compiles
bun run lint                   # ESLint passes
bun run build                  # Next.js builds
bun run dev                    # Dev server starts on :3000
```

---

## Phase 1: Database Schema

### Goal
Define all 22 Drizzle schema files + relations + business triggers matching the old Supabase schema exactly.

### Files to Create

```
src/lib/db/schema/
  enums.ts                     # 20+ pgEnum definitions
  users.ts                     # users table (with betterAuthUserId column)
  applications.ts              # applications table
  documents.ts                 # documents table
  rooms.ts                     # rooms, room_allocations
  fees.ts                      # fees table
  payments.ts                  # payments table
  leave-requests.ts            # leave_requests table
  renewals.ts                  # renewals table
  audit-logs.ts                # audit_logs table (immutable)
  device-sessions.ts           # device_sessions table
  gateway-payments.ts          # gateway_payments table
  reconciliation-logs.ts       # reconciliation_logs table
  consent-logs.ts              # consent_logs table
  applications-archive.ts      # applications_archive table
  audit-reports.ts             # audit_reports table
  interviews.ts                # interviews table
  notifications.ts             # notifications + notification_rules tables
  communications.ts            # communications table
  config.ts                    # leave_types, blackout_dates tables
  relations.ts                 # All Drizzle relations
  index.ts                     # Re-export everything
drizzle/custom/triggers.sql    # All business triggers
```

### Schema Rules
- Every table: `id` (UUID defaultRandom), `createdAt`, `updatedAt`
- All FKs indexed
- `users.betterAuthUserId` — UUID linking to Better Auth's user table
- All status/role fields use `pgEnum`
- `applications.currentStatus` defaults to `'SUBMITTED'` (not DRAFT — prevents CHANGE-6)
- `applications.applicantEmail` is `text().notNull()` (prevents CHANGE-3)

### Triggers in `drizzle/custom/triggers.sql`
1. `update_updated_at_column()` — auto-update timestamps on all tables
2. `validate_application_status_transition()` — enforce: DRAFT→SUBMITTED→REVIEW→INTERVIEW→APPROVED/REJECTED→ARCHIVED
3. `update_room_occupancy()` — auto-update rooms.occupied_count and status
4. `validate_leave_status_transition()` — enforce: PENDING→APPROVED/REJECTED/CANCELLED, APPROVED→COMPLETED
5. `update_fee_on_payment()` — mark fee PAID when payment recorded
6. `generate_tracking_number()` — auto-gen BH-YYYY-NNNNNN on insert
7. `prevent_audit_log_modification()` — make audit_logs immutable

### Test Scripts

**`src/lib/db/schema/__tests__/schema.unit.test.ts`**:
```
- Every table export has id, createdAt, updatedAt columns
- All enums have expected values matching old schema
- All FK references exist
- applications.applicantEmail is notNull
- No plaintext password columns exist
```

**`src/lib/db/schema/__tests__/schema.integration.test.ts`** (real DB):
```
- Push schema to test DB succeeds
- All tables are created (SELECT from pg_tables)
- All triggers are installed
- Application status transition trigger works (valid transition succeeds, invalid blocked)
- Room occupancy trigger fires (allocate room -> occupied_count increments)
- Tracking number auto-generates on application insert
- updated_at auto-updates on row modification
- Audit logs cannot be UPDATE'd or DELETE'd
```

### Phase 1 Gate
```bash
bun run phase:gate
bunx drizzle-kit push                                    # Main DB
DATABASE_URL=$TEST_DB_URL bunx drizzle-kit push          # Test DB
docker exec $CONTAINER psql -U db_user1 -d hostel_pro2 -f drizzle/custom/triggers.sql
docker exec $CONTAINER psql -U db_user1 -d hostel_pro22_test -f drizzle/custom/triggers.sql
```

---

## Phase 2: Authentication

### Goal
Better Auth with OTP plugin, RBAC middleware, rate limiting, session management.

### Files to Create

```
src/lib/auth/
  index.ts                     # Better Auth server instance (Drizzle adapter, globalThis-cached pg.Pool)
  client.ts                    # Better Auth React client hooks
  otp-plugin.ts                # Custom OTP plugin with mock/live SMS
  middleware.ts                # requireAuth(), requireRole() functions
  rate-limiter.ts              # In-memory rate limiter (5 OTP per phone per 10 min)
  resolve-user.ts              # Already created in Phase 0, fleshed out here
  types.ts                     # Session, AuthUser, JwtPayload types
src/lib/sms/
  index.ts                     # SmsProvider interface
  mock.ts                      # MockSmsProvider (OTP=123456, logs to console)
  twilio.ts                    # TwilioSmsProvider (live)
src/app/api/auth/
  [...all]/route.ts            # Better Auth catch-all
src/app/api/otp/
  send/route.ts                # POST — rate-limited, sends OTP
  verify/route.ts              # POST — verifies OTP, creates session
```

### Critical Design Decisions

**Better Auth must share the same connection pool** (prevents BUG-009):
```typescript
// src/lib/auth/index.ts
const globalForPool = globalThis as unknown as { authPool: Pool };
const pool = globalForPool.authPool ?? new Pool({ connectionString, max: 5 });
if (process.env.NODE_ENV !== 'production') globalForPool.authPool = pool;
```

**Rate limiter** (prevents Audit: no OTP rate limiting):
```typescript
// In-memory sliding window: max 5 OTP requests per phone per 10 minutes
export function checkOtpRateLimit(phone: string): void {
  // Throws RateLimitError if exceeded
}
```

**requireAuth/requireRole** (used by every protected route):
```typescript
export async function requireAuth(req: NextRequest): Promise<Session> {
  const session = await getSession(req);
  if (!session) throw new UnauthorizedError('Authentication required');
  return session;
}
export function requireRole(session: Session, roles: UserRole[]): void {
  if (!roles.includes(session.user.role as UserRole))
    throw new ForbiddenError(`Role '${session.user.role}' not authorized`);
}
```

### Test Scripts

**`src/lib/auth/__tests__/auth.integration.test.ts`** (real DB):
```
- Create user -> send OTP (mock) -> verify OTP -> session created
- Session cookie is set and valid
- Invalid OTP -> 401
- Expired OTP -> 401
- resolveUserId returns correct app user ID for auth session
- resolveUserId throws NotFoundError for unknown auth ID
```

**`src/lib/auth/__tests__/rbac.integration.test.ts`** (real DB, real auth):
```
- Student session -> requireRole(['student']) -> passes
- Student session -> requireRole(['superintendent']) -> throws ForbiddenError
- No session -> requireAuth() -> throws UnauthorizedError
- Each of the 5 roles tested against correct and incorrect role checks
```

**`src/lib/auth/__tests__/rate-limiter.unit.test.ts`**:
```
- 5 requests in 10 min window -> all succeed
- 6th request in same window -> throws RateLimitError
- Request after window expires -> succeeds
- Different phone numbers have independent limits
```

**`src/lib/auth/__tests__/resolve-user.integration.test.ts`** (real DB):
```
- Create Better Auth user + app user -> resolveUserId returns app user ID
- Auth user with no app profile -> throws NotFoundError
- Multiple calls for same session -> returns consistent ID
```

### Phase 2 Gate
```bash
bun run phase:gate
# Manual verify: OTP send/verify works in mock mode (OTP=123456)
# Manual verify: Login -> session cookie set -> dashboard loads
```

---

## Phase 3: Services

### Goal
Migrate all 18 services to plain TypeScript. EVERY service gets both unit AND integration tests against real DB.

### Files to Create

```
src/lib/services/
  users.ts                      # User CRUD, profile management
  applications.ts               # Application lifecycle (SUBMITTED default, email required, auto-account on approval)
  rooms.ts                      # Room CRUD, allocation, transfer, availability
  leaves.ts                     # Leave requests, approval, checkout/return
  payments.ts                   # Fee management, payment recording, receipt numbers
  documents.ts                  # Document metadata CRUD
  document-processor.ts         # Image processing (Sharp)
  bulk-download.ts              # ZIP/PDF merge for bulk document download
  audit.ts                      # Audit log writing + querying (BOTH entityType AND entityId)
  consent.ts                    # DPDP consent management
  crypto.ts                     # AES-256-GCM encrypt/decrypt (throws on plaintext)
  device-sessions.ts            # Device session tracking
  razorpay.ts                   # Payment gateway (mock/live interface)
  reconciliation.ts             # Payment reconciliation
  receipt.ts                    # PDF receipt generation (pdf-lib)
  data-retention.ts             # Archival, PII stripping, DPDP deletion
  notifications.ts              # In-app notification CRUD + dispatch
  interviews.ts                 # Interview scheduling
  dashboard.ts                  # Dashboard aggregation queries (5 roles)
  config.ts                     # Leave types, blackout dates, notification rules CRUD
src/lib/validations/
  applications.ts               # createApplicationSchema (email REQUIRED), updateStatusSchema
  users.ts                      # updateProfileSchema
  rooms.ts                      # createRoomSchema, allocateRoomSchema
  leaves.ts                     # createLeaveSchema, approveLeaveSchema
  payments.ts                   # createFeeSchema, recordPaymentSchema
  documents.ts                  # uploadDocumentSchema
  auth.ts                       # otpSendSchema, otpVerifySchema, loginSchema
  interviews.ts                 # scheduleInterviewSchema
  config.ts                     # leaveTypeSchema, blackoutDateSchema, notificationRuleSchema
  common.ts                     # paginationSchema, uuidSchema
src/lib/notifications/
  index.ts                      # notify(event, context) dispatcher
  template.ts                   # {{variable}} template renderer
  channels/
    sms.ts                      # SMS channel (mock/live)
    email.ts                    # Email channel (console/resend/sendgrid)
    whatsapp.ts                 # WhatsApp channel (mock/live)
    in-app.ts                   # In-app (DB insert, always live)
src/lib/api/
  error-handler.ts              # Shared catch block for API routes
```

### Service-Specific Safeguards

**`applications.ts`**:
- `createApplication()` — sets status to `SUBMITTED` with `submittedAt = now()` (prevents CHANGE-6)
- `createApplication()` — Zod schema requires `applicantEmail: z.string().email()` (prevents CHANGE-3)
- `createApplication()` — calls `checkDuplicateEmail()` before insert (prevents CHANGE-4)
- `updateApplicationStatus('APPROVED')` — auto-calls `createStudentAccount()` (CHANGE-1)
- `createStudentAccount()` — temp password: `HP<last4tracking>#<DDMM_DOB>` (CHANGE-2)
- All queries use app user ID from `resolveUserId()`, never auth session ID

**`audit.ts`** (prevents Audit: entityType ignored):
```typescript
export async function getAuditLogsByEntity(entityType: string, entityId: string) {
  return db.select().from(auditLogs)
    .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
    .orderBy(desc(auditLogs.createdAt));
}
```

**`crypto.ts`** (prevents Audit: plaintext passthrough):
```typescript
export function decrypt(encrypted: string): string {
  if (!process.env.ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured');
  if (!isEncrypted(encrypted)) throw new Error('Cannot decrypt: value is not encrypted');
  // ... actual AES-256-GCM decryption
}
```

**`dashboard.ts`**:
- Every dashboard function takes `appUserId: string` (already resolved via `resolveUserId()`)
- Student dashboard: own fees, leaves, room, documents
- Parent dashboard: linked children's data (handles empty state gracefully — prevents BUG-004)
- Fee summary returns `{ totalDue: 0, totalPaid: 0 }` for users with no fees (prevents BUG-018)

### Test Files — EVERY Service

```
src/lib/services/__tests__/
  users.unit.test.ts
  users.integration.test.ts
  applications.unit.test.ts
  applications.integration.test.ts
  rooms.unit.test.ts
  rooms.integration.test.ts
  leaves.unit.test.ts
  leaves.integration.test.ts
  payments.unit.test.ts
  payments.integration.test.ts
  documents.unit.test.ts
  documents.integration.test.ts
  audit.unit.test.ts
  audit.integration.test.ts
  consent.unit.test.ts
  consent.integration.test.ts
  crypto.unit.test.ts
  crypto.integration.test.ts
  device-sessions.unit.test.ts
  device-sessions.integration.test.ts
  razorpay.unit.test.ts
  notifications.unit.test.ts
  notifications.integration.test.ts
  interviews.unit.test.ts
  interviews.integration.test.ts
  dashboard.unit.test.ts
  dashboard.integration.test.ts
  config.unit.test.ts
  config.integration.test.ts
  receipt.unit.test.ts
  data-retention.integration.test.ts
  reconciliation.integration.test.ts
  bulk-download.unit.test.ts
```

### Anti-Tautological-Mock Rules (ENFORCED)

**Unit tests MAY mock DB only for**:
- Testing error handling branches (mock DB to throw, verify service throws typed error)
- Testing pure business logic (string formatting, date calculations)

**Unit tests MUST NOT**:
- Mock `db.select()` to return a value, then assert that exact value was returned
- This pattern: `vi.mocked(db.select).mockResolvedValue([{id: 'x'}]); expect(result.id).toBe('x');` — tests nothing

**Integration tests MUST**:
- Import `testDb` from `@/test/integration.setup`
- Monkey-patch: `Object.defineProperty(dbModule, 'db', { value: testDb })`
- Use factories from `@/test/factories.ts`
- Call `cleanDb()` in `beforeEach`
- Test at minimum: one create, one read, one error case, one edge case

### Required Integration Test Cases Per Service

| Service | Must Test |
|---------|----------|
| **users** | Create user, find by ID, find by auth ID (resolveUserId), update profile, NotFoundError for missing |
| **applications** | Create with SUBMITTED status, duplicate email rejection, status transitions (valid + invalid), tracking number auto-gen, auto student account on approval, temp password format |
| **rooms** | Create room, allocate (occupancy increments), transfer, end allocation (occupancy decrements), capacity overflow rejected |
| **leaves** | Create leave, approve, reject, checkout, return, cancel, date overlap detection |
| **payments** | Create fee, record payment, fee status auto-updates, receipt number generation, payment summary for user with no fees returns zeros |
| **documents** | Create document record, list by application, list by user, verify, delete |
| **audit** | Create log, query by entity (BOTH entityType AND entityId used), query by actor |
| **consent** | Record consent, revoke, check renewal, expiry calculation |
| **crypto** | Encrypt/decrypt roundtrip, decrypt throws on plaintext, decrypt throws on tampered data, isEncrypted helper |
| **notifications** | Create notification, list by user, mark read, unread count, dispatch to channels |
| **interviews** | Schedule, complete, cancel, reschedule |
| **dashboard** | Student dashboard returns correct aggregation, parent with no children returns empty (not error) |
| **config** | CRUD leave types, CRUD blackout dates, CRUD notification rules |

### Service Migration Order
```
Batch 1: errors.ts, logger.ts, users.ts, applications.ts (foundational)
Batch 2: rooms.ts, leaves.ts, payments.ts (core operations)
Batch 3: documents.ts, audit.ts, consent.ts, device-sessions.ts (supporting)
Batch 4: crypto.ts, razorpay.ts, receipt.ts, reconciliation.ts (specialized)
Batch 5: notifications.ts, interviews.ts, dashboard.ts, config.ts, data-retention.ts (dependent)
```

### Phase 3 Gate
```bash
bun run phase:gate
# Verify: ls src/lib/services/__tests__/*.integration.test.ts | wc -l >= 18
# Verify: bun run test:coverage shows >= 70% on services
```

---

## Phase 4: Storage

### Goal
Replace Supabase Storage with local filesystem + HMAC signed URLs.

### Files to Create

```
src/lib/storage/
  index.ts                     # upload(), download(), delete(), list()
  signed-urls.ts               # signUrl(), verifySignedUrl() — HMAC-SHA256
  file-validator.ts            # Allowlist MIME types, max 10MB, path traversal prevention
  types.ts                     # UploadResult, StorageConfig types
src/app/api/storage/
  [token]/route.ts             # GET — verify signed URL, serve file
```

### Key Rules
- File type validation uses ALLOWLIST: `['image/jpeg', 'image/png', 'image/webp', 'application/pdf']`
- Path traversal prevention: reject paths containing `..`, absolute paths, null bytes
- Signed URLs expire after 1 hour by default
- Upload path: `uploads/{category}/{userId}/{timestamp}_{filename}`

### Test Scripts

**`src/lib/storage/__tests__/signed-urls.unit.test.ts`**:
```
- Sign URL -> verify -> returns valid with correct filePath
- Verify expired URL -> returns invalid
- Verify tampered URL (modified path) -> returns invalid
- Verify tampered URL (modified signature) -> returns invalid
```

**`src/lib/storage/__tests__/file-validator.unit.test.ts`**:
```
- PDF -> passes
- JPEG/PNG -> passes
- EXE/JS/SH -> rejected
- File > 10MB -> rejected
- Path with ".." -> rejected
- Path with null byte -> rejected
```

**`src/lib/storage/__tests__/storage.integration.test.ts`** (real filesystem):
```
- Upload file -> exists on disk at correct path
- Upload -> signUrl -> serve via API -> correct content
- Delete -> file removed from disk
- Upload with path traversal attempt -> rejected
```

### Phase 4 Gate
```bash
bun run phase:gate
# Architect reviews: src/lib/storage/signed-urls.ts
```

---

## Phase 5: API Routes

### Goal
Create all ~45 API route handlers. Every mutation has Zod validation. Every protected route has auth + RBAC. Public routes do NOT call requireAuth.

### Route Files

```
src/app/api/
  health/route.ts                                # GET (public)

  # Applications (POST is PUBLIC — prevents BUG-001)
  applications/route.ts                          # GET (auth+staff), POST (PUBLIC)
  applications/[id]/route.ts                     # GET, PATCH (auth)
  applications/[id]/status/route.ts              # PATCH (staff)
  applications/[id]/interview/route.ts           # PATCH (staff)
  applications/track/[trackingNumber]/route.ts   # GET (public)
  applications/stats/route.ts                    # GET (staff)

  # Documents
  documents/route.ts                             # GET (auth)
  documents/upload/route.ts                      # POST (auth, Zod validated)
  documents/[id]/route.ts                        # GET, DELETE (auth)
  documents/[id]/url/route.ts                    # GET (auth)
  documents/bulk-download/route.ts               # POST (staff)

  # Users
  users/route.ts                                 # GET (staff)
  users/profile/route.ts                         # GET, PATCH (auth, Zod validated)

  # Rooms & Allocations
  rooms/route.ts                                 # GET (auth), POST (staff, Zod validated)
  rooms/[id]/route.ts                            # GET, PATCH (staff)
  rooms/allocate/route.ts                        # POST (staff, Zod validated)
  rooms/allocations/[id]/route.ts                # PATCH (staff — end/transfer)
  rooms/availability/route.ts                    # GET (auth)
  rooms/student/[userId]/route.ts                # GET (auth)

  # Fees & Payments
  fees/route.ts                                  # GET (auth), POST (staff, Zod validated)
  fees/[id]/route.ts                             # GET, PATCH (auth)
  payments/route.ts                              # GET, POST (auth, Zod validated)
  payments/[id]/route.ts                         # GET (auth)
  payments/verify/route.ts                       # POST (auth, Zod validated)
  payments/webhook/route.ts                      # POST (Razorpay webhook, HMAC verified)

  # Leaves
  leaves/route.ts                                # GET, POST (auth, Zod validated)
  leaves/[id]/route.ts                           # GET, DELETE (auth)
  leaves/[id]/status/route.ts                    # PATCH (staff)
  leaves/[id]/checkout/route.ts                  # PATCH (staff)
  leaves/[id]/return/route.ts                    # PATCH (staff)

  # Interviews
  interviews/route.ts                            # GET, POST (staff, Zod validated)
  interviews/[id]/complete/route.ts              # PATCH (staff)

  # Notifications
  notifications/route.ts                         # GET (auth)
  notifications/[id]/read/route.ts               # PATCH (auth)
  notifications/read-all/route.ts                # PATCH (auth)
  notifications/unread-count/route.ts            # GET (auth)

  # Dashboards
  dashboard/student/route.ts                     # GET (student)
  dashboard/superintendent/route.ts              # GET (superintendent)
  dashboard/trustee/route.ts                     # GET (trustee)
  dashboard/accounts/route.ts                    # GET (accounts)
  dashboard/parent/route.ts                      # GET (parent)

  # Parent-specific
  parent/student/route.ts                        # GET (parent)
  parent/fees/route.ts                           # GET (parent)
  parent/leave/route.ts                          # GET (parent)

  # Config (staff)
  config/leave-types/route.ts                    # GET, POST, PUT, DELETE (prevents CHANGE-5)
  config/blackout-dates/route.ts                 # GET, POST, PUT, DELETE (prevents CHANGE-5)
  config/notification-rules/route.ts             # GET, POST, PUT, DELETE

  # Compliance
  compliance/consents/route.ts                   # GET, POST (auth)
  compliance/audit/route.ts                      # GET (staff)

  # Student
  student/exit-request/route.ts                  # GET, POST (student, Zod validated)

  # Renewals
  renewals/route.ts                              # GET, POST (auth)

  # Admin/Cron (prevents BUG-013: cron 404)
  admin/cron/data-retention/route.ts             # POST (CRON_SECRET header auth)
  admin/cron/reconciliation/route.ts             # POST (CRON_SECRET header auth)
  admin/cron/overdue-fees/route.ts               # POST (CRON_SECRET header auth)
  admin/seed-auth-users/route.ts                 # POST (dev only)
```

### Route Handler Patterns (ALL routes follow one of these)

**Standard mutation (auth + Zod)**:
```typescript
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    requireRole(session, ['superintendent']);
    const userId = await resolveUserId(session);     // ALWAYS resolve
    const body = createFooSchema.parse(await req.json());  // ALWAYS validate mutations
    const result = await createFoo({ ...body, createdBy: userId });
    return successResponse(result, 201);             // Standardized response
  } catch (err) {
    return handleApiError(err);  // Shared error handler
  }
}
```

**Standard list (auth + pagination)**:
```typescript
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = await resolveUserId(session);
    const { page, limit } = paginationSchema.parse(Object.fromEntries(req.nextUrl.searchParams));
    const { data, total } = await listFoos({ userId, page, limit });
    return paginatedResponse(data, total, page, limit);  // ALWAYS use standardized pagination
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Public endpoint (no auth)**:
```typescript
// POST /api/applications — PUBLIC form submission
export async function POST(req: NextRequest) {
  try {
    // NO requireAuth() — this is a public endpoint
    const body = createApplicationSchema.parse(await req.json());  // Still validate!
    const result = await createApplication(body);
    return successResponse(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**File upload (formData)**:
```typescript
// POST /api/documents/upload
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const userId = await resolveUserId(session);
    const formData = await req.formData();            // Next.js App Router pattern
    const file = formData.get('file') as File | null;
    if (!file) throw new ValidationError('File is required');
    validateFile(file);                                // Type allowlist + size check
    const metadata = uploadDocumentSchema.parse({
      documentType: formData.get('documentType'),
      applicationId: formData.get('applicationId'),
    });
    const result = await uploadDocument(file, metadata, userId);
    return successResponse(result, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
```

**Cron endpoint (API key auth)**:
```typescript
// POST /api/admin/cron/data-retention
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-cron-secret');
    if (secret !== env.CRON_SECRET) throw new UnauthorizedError('Invalid cron secret');
    const result = await runDataRetention();
    return successResponse(result);
  } catch (err) {
    return handleApiError(err);
  }
}
```

### Shared Error Handler (`src/lib/api/error-handler.ts`)
```typescript
export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ZodError) return json({ error: { code: 'VALIDATION_ERROR', ... } }, 400);
  if (err instanceof AppError) return json({ error: { code: err.code, ... } }, err.status);
  logger.error('Unhandled', err);
  return json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' } }, 500);
}
```

### Test Scripts

**`src/app/api/__tests__/auth-rbac.api.test.ts`** — CROSS-ROUTE RBAC MATRIX (prevents Audit: mocked auth):
```
Uses REAL auth middleware (not mocked requireAuth/requireRole).
Creates real test users with each role.
Tests for EVERY route group:
  - No auth token -> 401
  - Valid auth, wrong role -> 403
  - Valid auth, correct role -> 200/201

Specific critical cases:
  - POST /api/applications WITHOUT auth -> 201 (public form, prevents BUG-001)
  - GET /api/applications WITH auth (student) -> 200
  - GET /api/dashboard/student WITH superintendent token -> 403
  - POST /api/rooms WITH student token -> 403
  - GET /api/fees?summary=true WITH student token -> 200 (prevents BUG-018)
  - POST /api/leaves WITH student token -> 201 (prevents BUG-019)
  - GET /api/notifications WITH student token -> 200 (prevents BUG-020)
```

**`src/app/api/__tests__/applications.api.test.ts`**:
```
- POST without auth -> 201 (public)
- POST with missing email -> 400 VALIDATION_ERROR
- POST with duplicate email -> 409 CONFLICT
- GET with auth -> returns user's applications
- PATCH status with wrong role -> 403
- PATCH status SUBMITTED->REVIEW -> 200
- PATCH status SUBMITTED->APPROVED -> 400 (invalid transition)
```

**Per-route test files** for: rooms, leaves, payments, documents, dashboard, config, cron, interviews, users, notifications

**`src/app/api/__tests__/public-paths.api.test.ts`** (prevents BUG-015/016):
```
For every path in PUBLIC_PATHS constant:
  - Request without auth -> does NOT return 401 or 307
For every path NOT in PUBLIC_PATHS:
  - Request without auth -> returns 401 or 307
```

**`src/app/api/__tests__/zod-validation.api.test.ts`** (prevents Audit: missing validation):
```
For every POST/PUT/PATCH route:
  - Request with empty body -> 400 VALIDATION_ERROR
  - Request with invalid types -> 400 with field-level details
  - Request with valid data -> succeeds
```

### Phase 5 Gate
```bash
bun run phase:gate
# Verify: grep -rL 'schema.parse\|safeParse' src/app/api/**/route.ts for POST/PATCH routes = 0 results
# Verify: auth-rbac.api.test.ts passes
```

---

## Phase 6: Frontend

### Goal
Migrate all pages and components. All user-facing text uses next-intl `t()` calls.

### Page Structure (prevents BUG-003: wrong URL prefix)

```
src/app/
  layout.tsx                            # Root: NextIntlClientProvider, globals.css
  page.tsx                              # Landing page
  (public)/                             # Public pages
    about/page.tsx
    contact/page.tsx
    faq/page.tsx
    facilities/page.tsx
    gallery/page.tsx
    news/page.tsx
    trustees/page.tsx
    donations/page.tsx
    dpdp-policy/page.tsx
  apply/
    page.tsx                            # Vertical selection
    [vertical]/
      contact/page.tsx                  # OTP + email (REQUIRED)
      form/page.tsx                     # Multi-step form
      success/page.tsx                  # Success with tracking number
  track/
    page.tsx                            # Tracking form + result
  login/
    page.tsx                            # Phone/email login
    first-time-setup/page.tsx           # Password change
  (dashboard)/
    layout.tsx                          # Sidebar + server-side role check (prevents BUG-002)
    student/
      layout.tsx                        # requireRole(['STUDENT'])
      page.tsx
      fees/page.tsx
      leave/page.tsx
      room/page.tsx
      documents/page.tsx
      exit/page.tsx
      renewal/page.tsx
    superintendent/
      layout.tsx                        # requireRole(['SUPERINTENDENT'])
      page.tsx
      rooms/page.tsx
      leaves/page.tsx
      audit/page.tsx
      config/page.tsx                   # Leave types + blackout dates (PUT/DELETE work — prevents CHANGE-5)
      clearance/page.tsx
    trustee/
      layout.tsx                        # requireRole(['TRUSTEE'])
      page.tsx
      applications/page.tsx
      interviews/page.tsx
      allocations/page.tsx
      reports/page.tsx
    accounts/
      layout.tsx                        # requireRole(['ACCOUNTS'])
      page.tsx
    parent/
      layout.tsx                        # requireRole(['PARENT'])
      page.tsx
      leave/page.tsx
```

### Component Structure

```
src/components/
  providers/
    auth-provider.tsx                   # Better Auth client context
  layout/
    Sidebar.tsx                         # Links use /student/..., NOT /dashboard/student/...
    Header.tsx                          # Includes LanguageToggle
    DashboardShell.tsx                  # Sidebar + header + content
  ui/
    Button.tsx, Card.tsx, Input.tsx, Select.tsx, Modal.tsx,
    Table.tsx, Tabs.tsx, Badge.tsx, Spinner.tsx, Skeleton.tsx,
    Toast.tsx, Tooltip.tsx, Alert.tsx, EmptyState.tsx
  forms/
    FormWizard.tsx, OtpInput.tsx, FileUpload.tsx,
    SearchField.tsx, DatePicker.tsx
  application/
    ApplicationForm.tsx                 # Email field always visible and required
    ApplicationStatusBadge.tsx
    ApplicationReview.tsx
  tracking/
    TrackingForm.tsx
    TrackingResult.tsx
  documents/
    DocumentUploadCard.tsx, DocumentPreviewModal.tsx, DocumentsList.tsx
  fees/
    PaymentFlowModal.tsx, PaymentReceipt.tsx, FeeCard.tsx
  exit/
    ExitRequestForm.tsx, ClearanceChecklist.tsx, ExitStatusBadge.tsx
  renewal/
    RenewalCard.tsx, RenewalStatusTracker.tsx
  communication/
    SendMessagePanel.tsx, MessageLog.tsx
  print/
    PrintContainer.tsx, Receipt.tsx
  LanguageToggle.tsx                    # Cookie-based locale switch
```

### Dashboard Layout — Server-Side Role Enforcement (prevents BUG-002)

```typescript
// src/app/(dashboard)/student/layout.tsx
export default async function StudentLayout({ children }) {
  const session = await requireAuth(/* from cookies */);
  if (session.user.role !== 'STUDENT') redirect('/login?error=forbidden');
  return <>{children}</>;
}
```

Each role directory has its own `layout.tsx` that enforces the role server-side.

### Sidebar Links (prevents BUG-003)

All links use the route group paths WITHOUT `/dashboard/` prefix:
- `/student`, `/student/fees`, `/student/leave` (correct)
- NOT `/dashboard/student/fees` (wrong — BUG-003)

### Application Form — Email Required (prevents CHANGE-3)

The contact step in `apply/[vertical]/contact/page.tsx` renders email input as always visible and required, saving to localStorage and passing to form submission.

### Frontend API Client (`src/lib/api/client.ts`)

```typescript
// Typed fetch wrapper for all frontend -> API communication
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: 'include' });
  if (!res.ok) {
    const error = await res.json();
    throw new ApiClientError(error.error.message, error.error.code, res.status);
  }
  return res.json();
}
export async function apiPost<T>(path: string, body: unknown): Promise<T> { ... }
export async function apiPatch<T>(path: string, body: unknown): Promise<T> { ... }
export async function apiDelete(path: string): Promise<void> { ... }
// All methods: include credentials (cookies), handle error responses consistently
```

### Track Page — Error Handling (prevents BUG-005)

The track page (`src/app/track/page.tsx`) must handle all states:
- **Loading**: Show spinner while API call is in flight
- **Not found**: If API returns 404, show "Application not found. Please check your tracking number."
- **Network error**: Show "Unable to connect. Please try again." with retry button
- **Success**: Show application status and details
- **NEVER**: Show infinite "Processing..." — always set a timeout and handle errors

```typescript
// Pattern for track page:
const [state, setState] = useState<'idle' | 'loading' | 'found' | 'not-found' | 'error'>('idle');
try {
  setState('loading');
  const result = await apiGet(`/api/applications/track/${trackingNumber}`);
  setState('found');
} catch (err) {
  setState(err.status === 404 ? 'not-found' : 'error');
}
```

### Empty States (prevents BUG-004, BUG-011)

- Parent dashboard with no linked students: shows "No students linked" message, NOT an error
- Student room page with no allocation: shows "Pending Allocation" status, NOT an error
- Student fees with no fees: shows "No fees" message with zero totals, NOT an error

### Test Scripts

**`src/components/__tests__/Sidebar.test.tsx`**:
```
- Student role: renders /student, /student/fees, /student/leave links
- Superintendent role: renders /superintendent, /superintendent/rooms links
- NO link contains /dashboard/ prefix
```

**`src/app/(dashboard)/__tests__/role-enforcement.test.tsx`**:
```
- Student accessing /superintendent -> redirect to login
- Superintendent accessing /student -> redirect to login
- Each role layout returns children for correct role
```

**`src/components/__tests__/ApplicationForm.test.tsx`**:
```
- Email input is rendered and required
- Form submission includes applicantEmail
```

### Phase 6 Gate
```bash
bun run phase:gate
# Visual baselines: /visual-test responsive for each dashboard page
# Verify: grep -rn hardcoded English strings in components (should be 0)
```

---

## Phase 6A: Internationalization

### Goal
All user-facing text through next-intl. English source, Hindi translations. Cookie-based locale switching.

### Files to Create

```
messages/
  en/
    common.json, auth.json, applications.json, dashboard.json,
    fees.json, leaves.json, rooms.json, documents.json, settings.json
  hi/
    common.json, auth.json, applications.json, dashboard.json,
    fees.json, leaves.json, rooms.json, documents.json, settings.json
src/components/
  LanguageToggle.tsx              # Sets locale cookie + router.refresh()
```

### Locale Switching (prevents BUG-012: stale translation cache)

```typescript
// src/components/LanguageToggle.tsx
'use client';
import { useRouter } from 'next/navigation';

export function LanguageToggle() {
  const router = useRouter();
  const switchLocale = (locale: string) => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    router.refresh();  // Forces server re-render with new locale
  };
  // ...
}
```

**`src/i18n/request.ts`** — Dynamic import, no static cache:
```typescript
export default getRequestConfig(async () => {
  const locale = cookies().get('locale')?.value || 'en';
  return {
    locale,
    messages: (await import(`../../messages/${locale}`)).default,
  };
});
```

### Test Scripts

**`src/i18n/__tests__/translation-parity.unit.test.ts`**:
```
For each JSON file in messages/en/:
  - Corresponding hi/ file exists
  - All keys in en/ exist in hi/ (deep comparison)
  - All keys in hi/ exist in en/ (no extra keys)
  - No translation value contains HTML tags or script elements
```

**`src/i18n/__tests__/locale-switch.integration.test.ts`**:
```
- Default locale (no cookie) -> English content
- Set locale=hi cookie -> Hindi content
- Switch back to en -> English content
```

### Phase 6A Gate
```bash
bun run phase:gate
# Verify: translation key parity script passes
# Verify: no hardcoded strings in components (grep scan)
# Visual baselines in both locales
```

---

## Phase 7: Crypto & Compliance

### Goal
Verify crypto implementation, key management, DPDP compliance utilities.

### Key Rules (prevents Audit: crypto plaintext passthrough)

```typescript
// src/lib/services/crypto.ts
export function decrypt(encrypted: string): string {
  if (!process.env.ENCRYPTION_KEY)
    throw new Error('ENCRYPTION_KEY not configured');
  if (!isEncrypted(encrypted))
    throw new Error('Cannot decrypt: value is not in encrypted format');
  // ... AES-256-GCM decryption
}
```

### Test Scripts

Already created in Phase 3. Architect reviews `crypto.ts` in this phase.

### Phase 7 Gate
```bash
bun run phase:gate
# Architect security review of: src/lib/services/crypto.ts
# Verify: decrypt('hello') throws Error (not returns 'hello')
```

---

## Phase 8: Testing & Quality

### Goal
Full E2E suite, coverage analysis, cross-browser visual baselines, test quality audit.

### E2E Test Files

```
e2e/tests/
  auth-flow.e2e.test.ts                # Login -> OTP -> dashboard -> logout
  application-submit.e2e.test.ts       # Public form -> submit -> tracking number
  application-review.e2e.test.ts       # Superintendent reviews -> approves -> student account created
  student-dashboard.e2e.test.ts        # Student: fees, leave, room, documents
  superintendent-dashboard.e2e.test.ts # Rooms, leaves, config, audit
  trustee-dashboard.e2e.test.ts        # Applications, interviews, reports
  payment-flow.e2e.test.ts            # Fee -> Razorpay mock -> receipt
  leave-flow.e2e.test.ts              # Apply -> approve -> checkout -> return
  room-allocation.e2e.test.ts          # Allocate -> transfer -> vacate
  parent-dashboard.e2e.test.ts         # Parent views child data
e2e/pages/
  login.page.ts, dashboard.page.ts, applications.page.ts,
  rooms.page.ts, fees.page.ts, leaves.page.ts
e2e/fixtures/
  auth.fixture.ts, data.fixture.ts
```

### Test Quality Audit Checklist

Run `/audit-tests` to verify:
- 0 tautological mocks (DB mocked + same value asserted)
- 0 mocked auth in RBAC tests
- Every service has integration test file
- Every API route has RBAC test coverage
- Coverage >= 70% statements

### Phase 8 Gate
```bash
bun run test:all              # Unit + Integration + E2E
bun run test:coverage         # Thresholds met (70/60/70/70)
# Visual baselines at 3 breakpoints for all pages
# /audit-tests returns 0 critical findings
```

---

## Phase 9: Docker & Deployment

### Files to Create

```
Dockerfile                    # Multi-stage: oven/bun:1.2-alpine, non-root user
docker-compose.yml            # App + PostgreSQL 18 + uploads volume
docker-compose.prod.yml       # Production overrides
.dockerignore                 # node_modules, .git, uploads, .visual-tests
```

### Key Rules
- Non-root user (`nextjs:nodejs`)
- No secrets in Dockerfile (use .env)
- Health check: `GET /api/health`
- Uploads volume mount
- PostgreSQL 18 with health check

### Phase 9 Gate
```bash
docker compose build                    # Image builds
docker compose up -d                    # Services start
curl http://localhost:3005/api/health   # Returns 200
docker compose down
```

---

## Bug Prevention Matrix

| ID | Bug/Finding | Phase | Safeguard | Test File |
|----|------------|-------|-----------|-----------|
| BUG-001 | Public endpoint required auth | P2,P5 | `PUBLIC_PATHS` constant; POST /api/applications has no requireAuth | `public-paths.api.test.ts` |
| BUG-002 | No server-side role enforcement | P6 | Role-specific `layout.tsx` with `requireRole()` | `role-enforcement.test.tsx` |
| BUG-003 | Wrong URL prefix `/dashboard/` | P6 | `(dashboard)` route group; links use `/student/...` | `Sidebar.test.tsx` |
| BUG-004 | Parent empty state shows error | P3,P6 | Dashboard returns empty data, not error | `dashboard.integration.test.ts` |
| BUG-005 | Track page infinite spinner | P6 | State machine: idle/loading/found/not-found/error | `TrackingForm.test.tsx` |
| BUG-006 | Better Auth trusted origins | P2 | Configure all dev ports + external IP from day one | `auth.integration.test.ts` |
| BUG-009 | DB connection pool exhaustion | P0 | `globalThis`-cached single pool | `db.unit.test.ts` |
| BUG-012 | Stale translation cache | P6A | Dynamic import in request.ts, router.refresh() | `locale-switch.integration.test.ts` |
| BUG-013 | Cron endpoint 404 | P5 | Explicit cron route files exist | `cron.api.test.ts` |
| BUG-015/016 | Middleware vs handler auth sync | P2 | `PUBLIC_PATHS` single source of truth | `public-paths.api.test.ts` |
| BUG-018/019/020 | Auth ID vs App ID mismatch | P0,P2 | `resolveUserId()` everywhere | `resolve-user.integration.test.ts` |
| Audit | Tautological mocks | P3 | Rules: never assert mock return values in service tests | `/audit-tests` skill |
| Audit | Mocked auth RBAC tests | P5 | `auth-rbac.api.test.ts` uses real auth | `auth-rbac.api.test.ts` |
| Audit | 2/22 integration tests | P3 | EVERY service has `.integration.test.ts` | Phase gate verifies count |
| Audit | Missing Zod validation | P5 | Every POST/PATCH calls `schema.parse()` | `zod-validation.api.test.ts` |
| Audit | No OTP rate limiting | P2 | `rate-limiter.ts` | `rate-limiter.unit.test.ts` |
| Audit | Crypto plaintext passthrough | P3,P7 | `decrypt()` throws on non-encrypted | `crypto.unit.test.ts` |
| Audit | No CI/hooks/coverage | P0 | CI pipeline, pre-commit, coverage thresholds | `.github/workflows/ci.yml` |
| Audit | Audit entityType ignored | P3 | Uses `and()` with both params | `audit.integration.test.ts` |
| CHANGE-1/2 | Auto student account on approval | P3 | Built into `updateApplicationStatus()` | `applications.integration.test.ts` |
| CHANGE-3 | Email required on application | P3 | Zod schema: `applicantEmail: z.string().email()` | `applications.api.test.ts` |
| CHANGE-4 | Duplicate email check | P3 | `checkDuplicateEmail()` before insert | `applications.integration.test.ts` |
| CHANGE-5 | Missing PUT/DELETE on config routes | P5 | Config routes have GET/POST/PUT/DELETE | `config.api.test.ts` |
| CHANGE-6 | Default status SUBMITTED | P1,P3 | Schema default + service logic | `applications.integration.test.ts` |
| CHANGE-8 | DB connection leak on hot reload | P0 | `globalThis` caching from day 1 | `db.unit.test.ts` |
| CHANGE-9 | Slow dev server | P0 | `bun --bun next dev --turbopack` | Manual verify |
| Audit | Inconsistent list API response format | P0,P5 | `paginatedResponse()` helper, all lists use it | `zod-validation.api.test.ts` |
| Audit | No env validation | P0 | `src/lib/env.ts` fails fast on missing vars | Startup test |
| Audit | Route existence = file existence | P5,P8 | Real HTTP tests, not fs.existsSync | `auth-rbac.api.test.ts` |

---

## Slack Notification Triggers (Per Phase)

All notifications go to Slack DM channel `D08FLCTGSQP` via `mcp__claude_ai_slack__slack_send_message`.

### Phase 0: Project Setup
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 0 — Project Setup* started` |
| `bun install` succeeds | `✅ Dependencies installed — {N} packages` |
| `bun run build` first succeeds | `✅ *Phase 0 — Project Setup* completed — scaffold builds, CI pipeline created` |
| `bun install` fails | `❌ *Phase 0* — dependency install failed: {error}` |
| Missing env var blocks progress | `⏳ *ACTION NEEDED* — provide {VAR_NAME} in .env` |

### Phase 1: Database Schema
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 1 — Schema* started — {N} tables, {N} enums, {N} triggers` |
| `drizzle-kit push` succeeds (main DB) | `✅ Schema pushed to \`hostel_pro2\` — {N} tables created` |
| `drizzle-kit push` succeeds (test DB) | `✅ Schema pushed to \`hostel_pro22_test\`` |
| Triggers applied | `✅ {N} triggers applied to both databases` |
| Schema tests pass | `🧪 *Schema Tests* — Unit: {pass}/{total} \| Integration: {pass}/{total}` |
| Phase gate passes | `✅ *Phase 1 — Schema* completed — {N} schema files, {N} triggers` |
| `drizzle-kit push` fails | `❌ *Phase 1* — schema push failed: {error}` |
| Trigger SQL has syntax error | `❌ *Phase 1* — trigger apply failed: {error}` |
| DB container not running | `⏳ *ACTION NEEDED* — PostgreSQL container not reachable on localhost:5432` |

### Phase 2: Authentication
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 2 — Auth* started — Better Auth + OTP + RBAC` |
| OTP mock mode verified | `✅ OTP mock mode working — code 123456 accepted` |
| Rate limiter tests pass | `✅ Rate limiter verified — blocks after 5 OTP requests per 10 min` |
| RBAC tests pass (real auth, not mocked) | `🧪 *Auth Tests* — Unit: {pass}/{total} \| Integration: {pass}/{total}` |
| `resolveUserId()` tests pass | `✅ Auth ID → App ID mapping verified` |
| Phase gate passes | `✅ *Phase 2 — Auth* completed — OTP, RBAC, rate limiting, resolveUserId` |
| Better Auth config error | `❌ *Phase 2* — Better Auth init failed: {error}` |
| BETTER_AUTH_SECRET not set | `⏳ *ACTION NEEDED* — set BETTER_AUTH_SECRET in .env` |

### Phase 3: Services
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 3 — Services* started — {N} services to migrate` |
| Each batch completes | `🔄 *Phase 3* — Batch {N} done: {service names}` |
| Service + integration test verified | `✅ \`{service}\` — unit: {pass}/{total}, integration: {pass}/{total}` |
| All services complete | `🧪 *Phase 3 Test Results* — Unit: {pass}/{total} \| Integration: {pass}/{total}` |
| `verify-test-coverage.sh` passes | `✅ All {N} services have integration tests` |
| Phase gate passes | `✅ *Phase 3 — Services* completed — {N} services, {N} integration tests` |
| Integration test fails | `❌ *Phase 3* — \`{service}\` integration test failed: {test name}: {error}` |
| Service missing integration test | `❌ *Phase 3* — \`{service}\` has no integration test — blocking` |
| Tautological mock detected | `❌ *Phase 3* — \`{test file}\` has tautological mock — DB mocked + same value asserted` |

### Phase 4: Storage
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 4 — Storage* started — local FS + HMAC signed URLs` |
| Signed URL roundtrip verified | `✅ Signed URL sign/verify/expire working` |
| File validation tests pass | `✅ File type allowlist + path traversal prevention verified` |
| Phase gate passes | `✅ *Phase 4 — Storage* completed — upload, download, signed URLs` |
| `SIGNED_URL_SECRET` not set | `⏳ *ACTION NEEDED* — set SIGNED_URL_SECRET in .env` |

### Phase 5: API Routes
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 5 — API Routes* started — ~45 route handlers` |
| RBAC matrix test passes | `✅ Cross-route RBAC matrix — all {N} routes verified (real auth, not mocked)` |
| Public paths test passes | `✅ PUBLIC_PATHS consistency — {N} public routes verified` |
| Zod validation test passes | `✅ All {N} mutation routes have Zod validation` |
| Cron endpoints exist and respond | `✅ Cron endpoints verified — data-retention, reconciliation, overdue-fees` |
| Phase gate passes | `✅ *Phase 5 — API Routes* completed — {N} routes, RBAC verified, Zod on all mutations` |
| Route returns wrong status code | `❌ *Phase 5* — \`{method} {path}\` returns {actual} instead of {expected}` |
| Missing Zod validation found | `❌ *Phase 5* — \`{route}\` accepts raw JSON without .parse() — blocking` |
| Public route calls requireAuth | `❌ *Phase 5* — \`{route}\` is in PUBLIC_PATHS but calls requireAuth() — BUG-001 pattern` |

### Phase 6: Frontend
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 6 — Frontend* started — {N} pages, {N} components` |
| Dashboard layouts with role enforcement done | `✅ Server-side role enforcement on all 5 dashboard layouts` |
| Sidebar links verified (no /dashboard/ prefix) | `✅ Sidebar links use correct paths — no /dashboard/ prefix` |
| Empty states verified (parent, room, fees) | `✅ Empty states show informational messages, not errors` |
| Visual baselines captured | `📸 *Visual baselines captured* — {page} — desktop, tablet, mobile` |
| Phase gate passes | `✅ *Phase 6 — Frontend* completed — {N} pages, {N} components, visual baselines` |
| Hardcoded English string found | `❌ *Phase 6* — \`{file}\` has hardcoded string: "{string}" — must use t()` |
| Link with /dashboard/ prefix found | `❌ *Phase 6* — \`{file}\` has /dashboard/ prefix link — BUG-003 pattern` |

### Phase 6A: i18n
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 6A — i18n* started — English + Hindi, {N} translation files` |
| Translation parity verified | `✅ Translation key parity — all {N} files match between en/ and hi/` |
| Locale switch verified | `✅ Language toggle working — cookie-based, no stale cache` |
| Phase gate passes | `✅ *Phase 6A — i18n* completed — {N} translation files, both locales verified` |
| Missing Hindi key | `❌ *Phase 6A* — \`{file}\`: key \`{key}\` exists in en/ but missing in hi/` |

### Phase 7: Crypto
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 7 — Crypto* started — AES-256-GCM review` |
| decrypt() throws on plaintext verified | `✅ Crypto verified — decrypt('hello') throws, no plaintext passthrough` |
| Architect review complete | `✅ *Phase 7 — Crypto* completed — architect reviewed \`crypto.ts\`` |
| decrypt() silently returns plaintext | `❌ *Phase 7* — CRITICAL: decrypt() returns plaintext instead of throwing` |

### Phase 8: Testing
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 8 — Testing* started — E2E suite + coverage audit` |
| E2E suite results | `🧪 *E2E Results* — {pass}/{total} across {N} test files` |
| Full test suite results | `🧪 *Full Test Results* — Unit: {p}/{t} \| Integration: {p}/{t} \| E2E: {p}/{t}` |
| Coverage report | `🧪 *Coverage* — Statements: {N}% \| Branches: {N}% \| Functions: {N}% \| Lines: {N}%` |
| `/audit-tests` results | `🧪 *Test Audit* — Tautological: {N} \| Mocked auth: {N} \| Missing integration: {N}` |
| Phase gate passes | `✅ *Phase 8 — Testing* completed — all suites pass, coverage meets thresholds` |
| Coverage below threshold | `❌ *Phase 8* — Coverage below threshold: {metric} at {N}% (need {threshold}%)` |
| Tautological mock found in audit | `❌ *Phase 8* — \`{file}\` flagged by /audit-tests: {finding}` |

### Phase 9: Docker
| When | Message |
|------|---------|
| Phase starts | `🚀 *Phase 9 — Docker* started` |
| Image builds | `✅ Docker image built successfully` |
| Health check passes | `✅ \`GET /api/health\` returns 200 from container` |
| Phase gate passes | `✅ *Phase 9 — Docker* completed — image builds, health check passes` |
| Docker build fails | `❌ *Phase 9* — Docker build failed: {error}` |

### Cross-Phase Triggers
| When | Message |
|------|---------|
| Phase gate fails at any step | `❌ *Phase {N}* gate failed at step: {step} — {error summary}` |
| Phase gate passes (any phase) | `✅ *Phase {N} — {Name}* gate passed — all 6 checks green` |
| Git commit created | `📋 *Committed*: Phase {N}: {commit message}` |
| Blocked waiting for user | `⏳ *ACTION NEEDED* — {what's needed}\nContext: {why}\nWaiting on: {specific action}` |
| Resuming after blocker resolved | `🔄 *Resumed* — {what was resolved}, continuing Phase {N}` |
| Build error with unclear cause | `🚧 *BLOCKER* — {error description}\nNeeds: {what's needed to debug}` |

### When NOT to Notify
- Routine file reads/writes
- Individual test passes within a suite
- Minor code fixes within a verification loop
- Reading old codebase for reference
- Creating individual files (only notify on batch/milestone completion)

## Case Convention Enforcement

All code must follow `CONVENTIONS.md`. Key rules:
- **DB columns**: `snake_case` (`full_name`, `created_at`, `student_user_id`)
- **TS/API/Frontend**: `camelCase` (`fullName`, `createdAt`, `studentUserId`)
- **Enums everywhere**: `UPPER_SNAKE_CASE` (`SUBMITTED`, `BOYS_HOSTEL`)
- **URL paths**: `kebab-case` (`/api/leave-types`, `/api/blackout-dates`)
- **URL params**: `camelCase` (`?sortBy=createdAt&pageSize=10`)

### Mandatory Test Cases (every service + API route)

| ID | Test | Verifies |
|----|------|----------|
| T1 | Response keys are camelCase | No `full_name` or `created_at` in API JSON |
| T2 | Request body accepts camelCase only | `fullName` works, `full_name` → 400 |
| T3 | Enum values are UPPER_SNAKE_CASE | `currentStatus: "SUBMITTED"` not `"submitted"` |
| T4 | Pagination shape is standard camelCase | `{ data, pagination: { total, page, limit, totalPages } }` |
| T5 | Error shape has UPPER_SNAKE code + camelCase keys | `{ error: { code: "VALIDATION_ERROR", message, status } }` |
| T6 | Drizzle select returns camelCase | Service layer never returns snake_case |
| T7 | Query param sorting maps correctly | `?sortBy=createdAt` → `ORDER BY created_at` |
| T8 | Translation keys use dot.camelCase | `applications.statusBadge`, not `status_badge` |

These 8 test patterns are defined in `CONVENTIONS.md` with full code examples. Every API test file must include T1, T3, T4, T5 at minimum.

## Verification Strategy

After each phase, the following must pass in order:

```
1. bun run typecheck          # Zero type errors
2. bun run lint               # Zero lint errors
3. bun run test:unit          # All unit tests pass
4. bun run test:integration   # All integration tests pass (real DB)
5. bun run build              # Next.js production build succeeds
6. bun run test:coverage      # Coverage >= thresholds
```

**No phase advances until all 6 pass.** This is automated via `scripts/phase-gate.sh`.
