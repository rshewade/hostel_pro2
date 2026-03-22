# Hostel Pro

Hostel/student accommodation management system. Migrating from NestJS + Supabase to a modern Bun + Next.js + PostgreSQL stack.

## CRITICAL: Read Before Doing Anything

**Every agent and orchestrator session MUST read these files before starting work:**
1. This file (`CLAUDE.md`)
2. `docs/ORCHESTRATOR_RULES.md` — 12 non-negotiable rules for quality gates
3. `docs/CONVENTIONS.md` — case conventions (T1-T8) and design tests (D1-D13)

**Non-negotiable gate**: `devbox run -- bash scripts/phase-gate.sh` must pass before ANY commit. The pre-commit hook enforces this mechanically. Never mark a task done without tests. Never say "passes" without running the command. See `docs/ORCHESTRATOR_RULES.md` for the full rule set.

## Tech Stack

- **Runtime**: Bun 1.2.5
- **Framework**: Next.js (App Router) — single app for API + frontend
- **Database**: PostgreSQL 18 via Drizzle ORM + `postgres` driver
- **Auth**: Better Auth with custom OTP plugin (SMS via Twilio/MSG91)
- **Storage**: Local filesystem with HMAC signed URLs
- **Validation**: Zod (NOT class-validator)
- **Testing**: Vitest (unit/integration) + Playwright Test (E2E) + Playwright CLI (visual)
- **Styling**: Tailwind CSS 4 + Lucide React icons
- **i18n**: `next-intl` — cookie-based locale, no URL prefix (English + Hindi)
- **Payments**: Razorpay
- **Dev environment**: Devbox (Nix)

## Project Structure

```
hostel_pro2/
├── CLAUDE.md                         ← You are here
├── MIGRATION_PLAN.md                 ← 9-phase migration roadmap
├── TESTING_STRATEGY.md               ← 4-layer testing pyramid
├── devbox.json                       ← Dev environment config
├── .claude/
│   ├── agents/                       ← 6 specialized agents
│   │   ├── architect.md              ← Tech lead (Opus)
│   │   ├── backend-dev.md            ← Backend dev (Sonnet)
│   │   ├── frontend-dev.md           ← Frontend dev (Sonnet)
│   │   ├── devops.md                 ← DevOps/infra (Sonnet)
│   │   ├── qa-tester.md              ← QA testing (Sonnet)
│   │   └── visual-tester.md          ← Visual testing (Sonnet)
│   ├── skills/                       ← 5 invocable skills
│   │   ├── postgres/SKILL.md         ← /pg — main DB management
│   │   ├── testdb/SKILL.md           ← /testdb — test DB management
│   │   ├── playwright/SKILL.md       ← /visual-test — screenshots
│   │   ├── verify-migration/SKILL.md ← /verify-migration — checklist
│   │   └── audit-tests/SKILL.md      ← /audit-tests — test quality analysis
│   └── settings.local.json
├── src/                              ← Application code (to be created)
│   ├── app/
│   │   ├── api/                      ← ~40 API route handlers
│   │   └── (pages)/                  ← Frontend pages
│   ├── components/                   ← ~280 React components
│   ├── i18n/
│   │   ├── config.ts                ← Locale list (en, hi), default
│   │   └── request.ts               ← getRequestConfig (reads cookie)
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              ← Drizzle client
│   │   │   └── schema/               ← 14 schema files
│   │   ├── auth/                     ← Better Auth setup
│   │   ├── services/                 ← ~22 service modules
│   │   ├── notifications/            ← Notification dispatch + channel providers
│   │   │   ├── index.ts              ← notify(event, context) dispatcher
│   │   │   ├── template.ts           ← {{variable}} template renderer
│   │   │   └── channels/             ← sms.ts, email.ts, whatsapp.ts, in-app.ts
│   │   ├── storage/                  ← Local FS + signed URLs
│   │   └── errors.ts                 ← Custom error classes
│   ├── types/                        ← TypeScript type definitions
│   ├── test/                         ← Test setup, fixtures, helpers
│   └── middleware.ts
├── e2e/                              ← Playwright E2E tests
├── drizzle/
│   └── custom/triggers.sql           ← DB triggers (applied manually)
├── messages/                         ← Translation files
│   ├── en/                           ← English (9 JSON files)
│   └── hi/                           ← Hindi (9 JSON files)
├── uploads/                          ← Local file storage
└── .visual-tests/                    ← Visual test artifacts
```

## Code Conventions

### Services
- Plain exported functions or classes — **NO decorators, NO DI, NO NestJS patterns**
- Import `db` from `@/lib/db`, schemas from `@/lib/db/schema`
- Use `process.env.*` directly — no ConfigService wrapper
- Throw typed errors: `NotFoundError`, `ForbiddenError`, `ValidationError` from `@/lib/errors`

### API Routes
- Thin handlers: validate input → call service → return response
- Always check auth: `requireAuth(req)` + `requireRole(session, [roles])`
- Validate all input with Zod schemas

### Database
- All tables have `id` (UUID), `created_at`, `updated_at`
- Use `pgEnum` for all status/role fields
- Define relations in `src/lib/db/schema/relations.ts`
- Triggers in `drizzle/custom/triggers.sql` — applied manually, not via Drizzle
- Index all foreign keys and frequently queried columns

### Frontend
- Server components by default — `'use client'` only when needed
- Use Next.js routing (`<Link>`, `useRouter`) — **NO react-router-dom**
- Tailwind CSS 4 with `@import "tailwindcss"` — no tailwind.config.js needed
- `next/image` for all images
- `data-testid` attributes on E2E-targetable elements
- **No hardcoded user-facing strings** — every visible string uses `next-intl` translation keys

### i18n (Internationalization)
- **Library**: `next-intl` — cookie-based locale, no URL prefix
- **Locales**: `en` (English, default), `hi` (Hindi / हिन्दी)
- **Server components**: `const t = await getTranslations('Namespace')`
- **Client components**: `const t = useTranslations('Namespace')`
- **Messages**: `messages/en/*.json` and `messages/hi/*.json` — one file per feature domain
- **Shared strings** (buttons, nav, errors): go in `common.json`
- **English is source of truth** — write `en/` first, then `hi/`
- **Do NOT translate**: DB field names, API keys, log messages, route paths, code comments

### Validation
- Zod for everything — **NOT class-validator**
- Define schemas next to the service/route that uses them

## Commands

```bash
# Dev environment
devbox shell                          # Enter Nix shell with Bun + PostgreSQL

# Development
bun run dev                           # Start Next.js dev server
bun run build                         # Production build
bun run start                         # Run production server

# Database
bunx drizzle-kit generate             # Generate migrations
bunx drizzle-kit push                 # Push schema to DB
bunx drizzle-kit studio               # Visual DB management

# Testing
bun run test:unit                     # Unit tests (Vitest, fast)
bun run test:integration              # Integration tests (Vitest + real DB)
bun run test:e2e                      # E2E tests (Playwright)
bun run test:all                      # All layers sequentially
bun run test:coverage                 # Unit tests with coverage report

# Quality gates
bun run phase:gate                    # Full phase completion gate (typecheck+lint+tests+build)
bun run hooks:install                 # Install git pre-commit hooks
```

## Mock Modes (3rd Party Services)

Development works without any 3rd party API keys using mock implementations.

| Service | Env Var | Default | Mock Behavior |
|---------|---------|---------|--------------|
| SMS (Twilio/MSG91) | `SMS_MODE=mock\|live` | `mock` | OTP always `123456`, logs to console, no SMS sent |
| Razorpay (payments) | `RAZORPAY_MODE=mock\|live` | `mock` | Fake order/payment IDs, signature always valid |
| Notifications | `NOTIFICATION_MODE=mock\|live` | `mock` | All notifications log to console |
| Email | `EMAIL_PROVIDER=console\|resend\|sendgrid\|ses` | `console` | Logs email subject/body to console |
| WhatsApp | `WHATSAPP_MODE=mock\|live` | `mock` | Logs WhatsApp messages to console |

- **Mock is default** — all dev, testing, and CI runs use mock mode
- **Same interface** — mock and live implementations share identical APIs; code doesn't know the difference
- **Switch to live** — set `*_MODE=live` + provide real keys in `.env`
- **Tests always use mock** — zero external dependencies for 3rd-party services, deterministic results
- **In-app notifications always live** — they're just DB inserts, no external service needed

### Important: Mock Mode ≠ Test Database

- **Mock mode** (`SMS_MODE=mock`, `RAZORPAY_MODE=mock`): Replaces external 3rd-party API calls with console stubs. Used for SMS, payments, email, WhatsApp.
- **Test database** (`hostel_pro2_test`): A real PostgreSQL database for integration tests. **Never mock the database in integration tests.**

Mock mode and test DB serve different purposes. Integration tests use mock mode for external services AND the real test database for data operations. Both are always required together.

## Database

### Main Database
- **Host**: `localhost:5432`
- **Database**: `hostel_pro2`
- **User**: `db_user1`
- **Container**: `accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6`
- Managed via `/pg` skill

### Test Database
- **Database**: `hostel_pro2_test` (same server)
- Used for integration and API tests — **never mock the DB**
- Managed via `/testdb` skill

## Skills

| Skill | Invoke | Purpose |
|-------|--------|---------|
| PostgreSQL | `/pg` | Query, inspect, manage main database |
| Test DB | `/testdb` | Create, reset, seed, truncate test database |
| Visual Test | `/visual-test` | Playwright screenshots, responsive, cross-browser |
| Verify Migration | `/verify-migration` | Checklist verification for migrated code |
| Audit Tests | `/audit-tests` | Analyze test quality, detect anti-patterns |
| Notify | `/notify` | Send progress updates to user via Slack DM |

## Notifications

Progress updates are sent to the user via **Slack DM** (channel `D08FLCTGSQP`).

### What Gets Notified

| Event | Emoji | Example |
|-------|-------|---------|
| Phase started | 🚀 | `Phase 1 — Schema started` |
| Phase completed | ✅ | `Phase 1 — Schema completed (14 files, 42 tests)` |
| Verification passed | ✅ | `/verify-migration users — PASSED (10/10)` |
| Verification failed | ❌ | `/verify-migration users — NEEDS WORK (2 failures)` |
| Blocker | 🚧 | `backend-dev blocked on missing env var` |
| Escalation | ⬆️ | `Escalation to architect — schema design question` |
| Test results | 🧪 | `Unit: 48/48 | Integration: 12/12` |
| Visual baselines | 📸 | `Dashboard baselines captured (3 viewports)` |
| **Waiting for user** | ⏳ | `ACTION NEEDED — provide RAZORPAY_KEY_ID env var` |

**Critical rule**: If any agent is blocked and waiting for user action, it **must** send an ⏳ notification immediately. Never silently wait.

### What Does NOT Get Notified

- Routine file reads/writes
- Individual test passes
- Minor code fixes within a verification loop
- Agent-to-agent coordination (handled by teams)

### How to Send

All agents have the `/notify` skill. To send manually: `/notify <message>`

## Agents

**Agent Teams is enabled** — teammates run concurrently with independent context windows and can message each other directly.

```json
// .claude/settings.local.json
{ "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }
```

### Team Roster

| Agent | Model | Primary Focus |
|-------|-------|--------------|
| `architect` | Opus | Architecture decisions, schema design, code review, phase planning |
| `backend-dev` | Sonnet | Drizzle schemas, services, API routes, auth, storage |
| `frontend-dev` | Sonnet | React components, pages, Tailwind UI, data fetching |
| `devops` | Sonnet | Docker, PostgreSQL ops, CI/CD, Devbox, deployment |
| `qa-tester` | Sonnet | Vitest tests, migration verification, coverage |
| `visual-tester` | Sonnet | Playwright visual testing, baselines, regression |

### How Agent Teams Work

Unlike basic subagents (one-shot, report to parent only), teammates:
- **Run concurrently** — multiple agents work at the same time
- **Message each other directly** — `backend-dev` can notify `qa-tester` when a service is ready
- **Have independent context** — each agent maintains its own conversation history
- **Share a task list** — self-coordinate work without a central coordinator
- **Persist across turns** — teammates stay active within the session

### Communication Patterns

```
architect ←→ backend-dev     Schema review, design decisions
backend-dev → qa-tester      "users service ready for verification"
qa-tester → backend-dev      "3 tests failing, see details"
frontend-dev → visual-tester "dashboard page migrated, capture baselines"
qa-tester → frontend-dev     "ApplicationCard missing i18n keys"
devops ←→ backend-dev        DB issues, environment problems
architect → all              Phase sign-off, convention changes
```

### Token Usage Note

Agent Teams uses significantly more tokens than basic subagents since each teammate maintains its own context window. Use teammates for work that genuinely benefits from parallel execution and direct coordination. For simple one-off tasks, a regular subagent is more efficient.

## Agent Workflow

### Phase → Agent Mapping

| Phase | Lead Agent | Support | Deliverables |
|-------|-----------|---------|-------------|
| 0 — Setup | `architect` | `devops` | Config files, project scaffold |
| 1 — Schema | `backend-dev` | `architect` (review) | Drizzle schemas, triggers, `/testdb create` |
| 2 — Auth | `backend-dev` | `qa-tester` | Better Auth, OTP, RBAC middleware |
| 3 — Services | `backend-dev` | `qa-tester` | ~20 service modules + unit/integration tests |
| 4 — Storage | `backend-dev` | `devops` | Local FS, signed URLs |
| 5 — API Routes | `backend-dev` | `qa-tester` | ~40 route handlers + API tests |
| 6 — Frontend | `frontend-dev` | `visual-tester` | ~280 components + visual baselines |
| 6A — i18n | `frontend-dev` | `qa-tester` | 18 translation files, language toggle |
| 7 — Crypto | `backend-dev` | `architect` (review) | Encryption utils, compliance |
| 8 — Testing | `qa-tester` | All devs | E2E tests, coverage gaps, full suite pass |
| 9 — Docker | `devops` | `architect` (review) | Dockerfile, docker-compose, deployment |

### Parallel Execution Strategy

Phases with independent work streams can run teammates concurrently:

```
Phase 3 (Services) — parallel batches:
  Batch 1: backend-dev migrates users + applications
           qa-tester verifies completed services from prior batch
  Batch 2: backend-dev migrates payments + rooms
           qa-tester verifies users + applications
  ...continues leapfrogging

Phase 6 (Frontend) — parallel:
  frontend-dev migrates components
  visual-tester captures baselines for completed pages
  qa-tester runs /verify-migration on completed components

Phase 8 (Testing) — all agents active:
  qa-tester writes E2E tests
  visual-tester runs cross-browser + responsive baselines
  backend-dev fixes issues flagged by qa-tester
  frontend-dev fixes UI issues flagged by visual-tester
```

### Workflow Per Service/Route Migration (with Teams)

```
1. backend-dev: reads old code → writes new service + tests
2. backend-dev messages qa-tester: "users service ready for verification"
3. qa-tester: runs /verify-migration users → reports pass/fail
4. If issues: qa-tester messages backend-dev with findings
5. backend-dev fixes → messages qa-tester to re-verify
6. qa-tester confirms pass → messages architect for review (if complex)
7. Move to next service
```

### Workflow Per Frontend Component Migration (with Teams)

```
1. frontend-dev: reads old component → migrates + adds i18n keys + writes test
2. frontend-dev messages visual-tester: "dashboard page ready"
3. visual-tester: runs /visual-test responsive dashboard → captures baselines
4. frontend-dev messages qa-tester: "dashboard component ready for verification"
5. qa-tester: runs /verify-migration Dashboard → reports pass/fail
6. If i18n issues: qa-tester messages frontend-dev with missing keys
7. Repeat until verification passes
```

### Phase Completion Gate

**Every phase must pass the automated gate before moving on. No exceptions.**

```bash
bun run phase:gate    # runs scripts/phase-gate.sh
```

This runs sequentially: **typecheck → lint → unit tests → integration tests → build**. All steps must pass.

```
If all pass:
  a. git add + commit with phase summary
  b. git push to origin/main
  c. /notify "✅ Phase N — Name completed and pushed"

If any step fails:
  a. Fix the errors
  b. Re-run `bun run phase:gate` from the beginning
  c. /notify "❌ Phase N build failed: <error summary>"
  d. Do NOT push or move to next phase until clean
```

**Important**: The `architect` agent has blocking authority over phase completion. See `architect.md` for review requirements.

**Phase-specific additions:**
- **Phase 6+**: Also run `/visual-test` baselines before pushing
- **Phase 6A**: Also verify translation key parity (`en/` vs `hi/`)
- **Phase 8**: Full E2E suite must pass (`bun run test:e2e`)
- **Phase 9**: `docker compose build` must succeed

**Commit convention:** One commit per phase minimum, message format:
```
Phase N: <summary of what was built>
```

### Escalation Rules

- **Agent blocked?** → Message `architect` for design guidance
- **Schema question?** → `architect` decides, messages `backend-dev` to implement
- **Old code has a bug?** → Fix it in new code (don't perpetuate bugs)
- **Old code missing a feature?** → Add it if it's in the migration plan, otherwise flag to user
- **Test DB out of sync?** → `devops` runs `/testdb recreate`, messages affected agents
- **Cross-cutting change?** → `architect` messages all affected agents with the update

## Testing Strategy

4-layer pyramid defined in `TESTING_STRATEGY.md`:

1. **Unit** (`*.unit.test.ts`, `*.test.tsx`) — Vitest, jsdom — services, schemas, components
2. **Integration** (`*.integration.test.ts`, `*.api.test.ts`) — Vitest + real PostgreSQL — service→DB, API routes
3. **E2E** (`*.e2e.test.ts`) — Playwright Test — 10 critical user journeys
4. **Visual** — Playwright CLI screenshots — per-page baselines at 3 breakpoints

**Key rule**: No phase merges without tests. Run `/verify-migration` before marking anything done.

### Integration Test Requirements (Non-Negotiable)

Every service in `src/lib/services/` must have a `*.integration.test.ts` file that:
1. Uses the real test database (`testDb` from `@/test/integration.setup`)
2. Does **NOT** mock `@/lib/db` — that defeats the purpose of integration testing
3. Tests at least: one create, one read, one error case
4. Uses factories from `@/test/factories.ts` for test data setup
5. Cleans up with `cleanDb()` in `beforeEach`

Services without integration tests are **not considered complete**, regardless of unit test count.

**Reference implementation**: `src/lib/services/__tests__/rooms.integration.test.ts`

### Coverage Enforcement

Coverage thresholds are configured in `vitest.config.ts` and enforced in CI:

| Metric | Threshold |
|--------|-----------|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

Run `bun run test:coverage` to check. CI will fail if thresholds are not met.

### Mandatory RBAC Tests

Every API route test must verify these three scenarios:
- **401**: Request without auth token returns 401 Unauthorized
- **403**: Request with valid auth but wrong role returns 403 Forbidden
- **200/201**: Request with correct role succeeds

These must be tested in at least one integration test per route group using real auth middleware (not mocked `requireAuth`/`requireRole`).

### Functional Parity Definition

A service achieves functional parity when:
1. All public functions from the old NestJS service have equivalents in the new code
2. Same inputs produce the same outputs (or improved outputs if fixing a documented bug)
3. Same error conditions throw appropriate typed errors from `@/lib/errors`
4. All status transitions are preserved (e.g., PENDING → APPROVED → ACTIVE)
5. Database queries return equivalent result sets
6. Integration tests prove points 2-5 against a real database

## Migration

9 phases defined in `MIGRATION_PLAN.md`:

```
Phase 0 (Setup) → Phase 1 (Schema) → Phase 2 (Auth)
                        ↓                  ↓
                  Phase 3 (Services) ←─────┘
                        ↓
                  Phase 4 (Storage) → Phase 5 (API Routes)
                        ↓                  ↓
                  Phase 7 (Crypto)   Phase 6 (Frontend)
                        ↓                  ↓
                  Phase 8 (Testing) → Phase 9 (Docker)
```

### Old codebase reference
`/home/ubuntu/projects/hostel_old/repo/` — NestJS backend + Next.js 16 frontend + Supabase

### Migration pattern
```
NestJS @Injectable() class  →  Plain exported functions
supabase.from().select()    →  db.select().from().where()
class-validator decorators  →  Zod schemas
Supabase Auth               →  Better Auth
Supabase Storage            →  Local FS + HMAC signed URLs
ConfigService.get()         →  process.env.*
@Cron() decorators          →  API endpoint + external cron
```

## Error Handling

### Error Classes (`src/lib/errors.ts`)

```typescript
class AppError extends Error        { status: number; code: string }
class NotFoundError extends AppError { status = 404; code = 'NOT_FOUND' }
class ForbiddenError extends AppError { status = 403; code = 'FORBIDDEN' }
class UnauthorizedError extends AppError { status = 401; code = 'UNAUTHORIZED' }
class ValidationError extends AppError { status = 400; code = 'VALIDATION_ERROR' }
class ConflictError extends AppError { status = 409; code = 'CONFLICT' }
class RateLimitError extends AppError { status = 429; code = 'RATE_LIMITED' }
```

### API Error Response Format

All API routes return errors in this shape:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "status": 404
  }
}
```

For validation errors, include field-level details:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "status": 400,
    "details": [
      { "field": "phone", "message": "Invalid phone number format" },
      { "field": "fullName", "message": "Required" }
    ]
  }
}
```

### Error Handling in API Routes

```typescript
// Pattern for every route handler
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    requireRole(session, ['superintendent']);
    const body = createApplicationSchema.parse(await req.json());
    const result = await createApplication(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', status: 400, details: err.errors }
      }, { status: 400 });
    }
    if (err instanceof AppError) {
      return NextResponse.json({
        error: { code: err.code, message: err.message, status: err.status }
      }, { status: err.status });
    }
    logger.error('Unhandled error', err);
    return NextResponse.json({
      error: { code: 'INTERNAL_ERROR', message: 'Something went wrong', status: 500 }
    }, { status: 500 });
  }
}
```

### Rules
- **Services throw** typed errors — never return `{ error }` objects
- **API routes catch** and transform to JSON response
- **Never leak stack traces** or internal details to the client
- **Log all 5xx errors** with full context (request, user, stack trace)
- **Frontend displays** `error.message` to the user, uses `error.code` for conditional UI

## Security

### Rules
- Never expose secrets in code — always `process.env`
- HMAC-verify all signed URLs
- Validate file types/sizes before storage
- Rate-limit auth endpoints (max 5 OTP requests per phone per 10 min)
- All routes must have auth + RBAC checks
- Sanitize all user input
- No raw SQL except in `drizzle/custom/triggers.sql`
- Never log sensitive data (passwords, tokens, OTPs, personal documents)

### Per-Phase Security Checklist

| Phase | Security Check |
|-------|---------------|
| 1 — Schema | No plaintext password fields; sensitive columns marked for encryption |
| 2 — Auth | OTP rate limiting; session expiry configured; RBAC covers all roles; no token leaks in responses |
| 3 — Services | All encryption uses AES-256-GCM; HMAC uses SHA-256; no hardcoded keys; crypto.ts reviewed by architect |
| 4 — Storage | File type validation (allowlist, not blocklist); file size limits; path traversal prevention; signed URLs expire |
| 5 — API Routes | Every route has `requireAuth` + `requireRole`; input validated with Zod; no SQL injection via raw queries |
| 6 — Frontend | No secrets in client code; no `dangerouslySetInnerHTML` with user data; CSP headers set |
| 6A — i18n | Translation values don't contain executable code; user input never used as translation keys |
| 7 — Crypto | All encryption tests pass; key rotation strategy documented; no deprecated algorithms |
| 8 — Testing | Auth bypass tests (missing token, expired session, wrong role); injection tests |
| 9 — Docker | No secrets in Dockerfile/compose; non-root user in container; health checks enabled |

### Security Review Gate
The `architect` agent must review the following files before each phase is marked complete:
- Phase 2: `src/lib/auth/` — all auth files
- Phase 3: `src/lib/services/crypto.ts` — encryption
- Phase 4: `src/lib/storage/signed-urls.ts` — URL signing
- Phase 5: `src/middleware.ts` — request interception

## Rollback Strategy

### Per-Phase Rollback

| Phase | Risk | Rollback Method |
|-------|------|----------------|
| 0 — Setup | Low | `git reset` — no data involved |
| 1 — Schema | Medium | `DROP` tables + re-push; or restore from `/pg dump-schema` taken before push |
| 2 — Auth | Medium | Delete Better Auth tables; no user data at this stage |
| 3 — Services | Low | `git revert` — services are pure code, no side effects |
| 4 — Storage | Low | `git revert` — uploads directory is empty at this stage |
| 5 — API Routes | Low | `git revert` — routes are pure code |
| 6 — Frontend | Low | `git revert` — components are pure code |
| 6A — i18n | Low | `git revert` — translation files are static JSON |
| 7 — Crypto | Medium | `git revert` — but verify no data was encrypted with new keys |
| 8 — Testing | None | Tests don't modify anything |
| 9 — Docker | Low | Revert Dockerfile/compose; old containers still available |

### Before Any Risky Operation
1. **Database**: Run `/pg dump-schema` before schema changes
2. **Data**: Run `pg_dump` before any data migration
3. **Git**: Commit before starting each phase — one commit per phase minimum
4. **Test DB**: `/testdb recreate` if test DB gets corrupted

### Point of No Return
Once **real user data** is loaded (post-deployment), rollback becomes significantly harder. Until then, every phase is fully reversible via git + database recreation.
