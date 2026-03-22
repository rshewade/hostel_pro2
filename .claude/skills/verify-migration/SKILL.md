---
name: verify-migration
description: Verify a migrated service, API route, or component — runs type check, tests, coverage, schema match, and old-vs-new behavior comparison
user-invocable: true
---

# Migration Verification Skill

Verify that a migrated service, API route, or component is correct, complete, and matches the old implementation's behavior.

## Usage

```
/verify-migration <target>
```

Where `<target>` is one of:
- A service name: `/verify-migration users` → checks `src/lib/services/users.ts`
- An API route group: `/verify-migration api/applications` → checks `src/app/api/applications/`
- A component: `/verify-migration ApplicationCard` → checks the component file
- A phase: `/verify-migration phase-1` → runs full phase verification
- No argument: `/verify-migration` → shows what's been migrated and what's pending

## Verification Steps

### For a Service (`/verify-migration <service-name>`)

Run all checks in sequence, report pass/fail for each:

#### Step 1 — File Exists
```bash
ls src/lib/services/<name>.ts
```
- PASS: file exists
- FAIL: file not found → report and stop

#### Step 2 — No NestJS Patterns
```bash
# Check for leftover NestJS decorators/patterns
grep -n '@Injectable\|@Inject\|@Module\|@Controller\|ConfigService' src/lib/services/<name>.ts
```
- PASS: no matches
- FAIL: list lines with NestJS patterns that need removal

#### Step 3 — No Supabase Imports
```bash
grep -n 'supabase\|@supabase' src/lib/services/<name>.ts
```
- PASS: no matches
- FAIL: list lines with Supabase references

#### Step 4 — Uses Drizzle
```bash
grep -n 'drizzle-orm\|from.*schema\|db\.' src/lib/services/<name>.ts
```
- PASS: Drizzle imports and queries found
- FAIL: no Drizzle usage detected — may still be using old query patterns

#### Step 5 — Uses Zod (if has validation)
```bash
grep -n 'class-validator\|IsString\|IsNotEmpty\|IsEnum' src/lib/services/<name>.ts
```
- PASS: no class-validator found
- FAIL: old validation patterns detected

#### Step 6 — Type Check
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && bunx tsc --noEmit --pretty 2>&1 | grep -A2 "src/lib/services/<name>"
```
- PASS: no type errors in this file
- FAIL: list type errors

#### Step 7 — Unit Tests Exist
```bash
ls src/lib/services/__tests__/<name>.unit.test.ts
```
- PASS: unit test file exists
- FAIL: no unit tests → must be created

#### Step 8 — Integration Tests Exist
```bash
ls src/lib/services/__tests__/<name>.integration.test.ts
```
- PASS: integration test file exists
- FAIL: no integration tests → must be created

#### Step 9 — Tests Pass
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && bunx vitest run --reporter=verbose src/lib/services/__tests__/<name>.unit.test.ts
cd /mnt/data/projects/devbox/hostel_pro2 && DATABASE_URL="postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test" bunx vitest run --config vitest.integration.config.ts --reporter=verbose src/lib/services/__tests__/<name>.integration.test.ts
```
- PASS: all tests pass
- FAIL: list failing tests with details

#### Step 8a — Integration Test Quality Check

Verify the integration test actually tests behavior against a real database, not mocks:

```bash
# Check for tautological patterns — DB should NOT be mocked in integration tests
grep -n 'vi.mock.*@/lib/db' src/lib/services/__tests__/<name>.integration.test.ts
```
- PASS: no DB mocks in integration test (it uses real testDb)
- FAIL: integration test mocks the DB — this is tautological, not a real integration test

```bash
# Verify it uses the test database
grep -n 'testDb\|integration.setup' src/lib/services/__tests__/<name>.integration.test.ts
```
- PASS: imports testDb from integration setup
- FAIL: does not use test database — not a valid integration test

```bash
# Verify test factories are used (reduces boilerplate, improves consistency)
grep -n 'factories\|createTest' src/lib/services/__tests__/<name>.integration.test.ts
```
- INFO: Using factories is recommended but not required

#### Step 10 — Function Parity Check
Compare exported functions between old and new:
```bash
# Old service exports
grep -n 'async\s\+\w\+\|export\s\+\(async\s\+\)\?function' /home/ubuntu/projects/hostel_old/repo/backend/src/<module>/<name>.service.ts

# New service exports
grep -n 'async\s\+\w\+\|export\s\+\(async\s\+\)\?function' src/lib/services/<name>.ts
```
- PASS: all old public methods have new equivalents
- FAIL: list missing functions

#### Step 10a — Behavioral Parity Verification

Beyond checking function names exist, verify key behaviors are preserved:

1. Read the old service at `/home/ubuntu/projects/hostel_old/repo/` and list its main operations
2. For each operation, verify the new code handles:
   - **Happy path**: same input produces same output format
   - **Error cases**: same error types thrown for invalid input
   - **Edge cases**: empty inputs, null values, boundary conditions
   - **Status transitions**: all state machine transitions from old code are preserved
3. Check that integration tests exercise at least the happy path and one error case

#### Step 11 — Security Audit

For API routes associated with this service:

```bash
# Every non-public route must have requireAuth
grep -rn 'requireAuth' src/app/api/<route>/route.ts
```
- PASS: `requireAuth` present in every handler
- FAIL: missing auth check — security risk

```bash
# Every route accepting a body must have Zod validation
grep -rn '\.parse\|safeParse' src/app/api/<route>/route.ts
```
- PASS: Zod validation present on POST/PATCH/PUT handlers
- FAIL: raw `await req.json()` without validation — input injection risk

```bash
# Check for rate limiting on auth-related endpoints
grep -rn 'rateLimit\|checkOtpRateLimit' src/app/api/<route>/route.ts src/lib/auth/
```
- PASS: rate limiting present on auth endpoints (OTP send/verify)
- N/A: not an auth endpoint
- FAIL: auth endpoint without rate limiting

### For an API Route (`/verify-migration api/<route>`)

#### Step 1 — Route File Exists
```bash
ls src/app/api/<route>/route.ts
```

#### Step 2 — Has Auth Check
```bash
grep -n 'requireAuth\|requireRole\|getSession' src/app/api/<route>/route.ts
```
- PASS: auth checks present
- FAIL: route is unprotected → security risk

#### Step 3 — Has Input Validation
```bash
grep -n 'safeParse\|\.parse(\|zod\|Schema' src/app/api/<route>/route.ts
```
- PASS: Zod validation present
- FAIL: no input validation → potential injection risk

#### Step 4 — API Tests Exist
```bash
ls src/app/api/__tests__/<route>.api.test.ts
```

#### Step 5 — API Tests Pass
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && DATABASE_URL="postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test" bunx vitest run --config vitest.integration.config.ts --reporter=verbose src/app/api/__tests__/<route>.api.test.ts
```

#### Step 6 — HTTP Method Coverage
Check that all required HTTP methods are exported:
```bash
grep -n 'export async function GET\|POST\|PUT\|PATCH\|DELETE' src/app/api/<route>/route.ts
```
Compare against old controller to ensure all endpoints are covered.

#### Step 7 — Test Coverage Check
Verify the API test covers:
```bash
grep -n '401\|403\|200\|201\|400\|404' src/app/api/__tests__/<route>.api.test.ts
```
- Must have: 401 (no auth), 403 (wrong role), and success case tests

#### Step 7a — RBAC Auth Matrix

Verify by reading the route code that:

1. Each HTTP method has an explicit `requireAuth()` call (or is documented as public with a comment)
2. `requireRole()` specifies the correct minimum required roles (cross-reference with old codebase)
3. Check that tests verify all three auth scenarios:
   - **401**: Request without auth token → should return 401
   - **403**: Request with auth but wrong role → should return 403
   - **200/201**: Request with correct role → should succeed

```bash
# Verify auth test coverage
grep -n '401\|403\|Unauthorized\|Forbidden' src/app/api/__tests__/<route>.unit.test.ts
```
- PASS: Tests cover 401 and 403 scenarios
- FAIL: Missing auth rejection tests — RBAC not verified

### For a Component (`/verify-migration <ComponentName>`)

#### Step 1 — Component File Exists
```bash
find src/components -name "<ComponentName>.tsx" -o -name "<ComponentName>.ts"
```

#### Step 2 — No Supabase Imports
```bash
grep -n 'supabase\|@supabase' <component-path>
```

#### Step 3 — No react-router-dom
```bash
grep -n 'react-router-dom\|useNavigate\|useLocation' <component-path>
```
- PASS: uses Next.js routing
- FAIL: old router still in use

#### Step 4 — Component Test Exists
```bash
find src/components/__tests__ -name "<ComponentName>.test.tsx"
```

#### Step 5 — Component Test Passes
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && bunx vitest run --reporter=verbose src/components/__tests__/<ComponentName>.test.tsx
```

#### Step 6 — Has data-testid Attributes
```bash
grep -n 'data-testid' <component-path>
```
- PASS: E2E-targetable elements present
- WARN: no testid attributes (not blocking, but recommended for E2E)

#### Step 7 — Visual Baseline Exists
```bash
ls .visual-tests/baselines/*<component-or-page>*
```
- PASS: visual baseline captured
- WARN: no baseline yet → recommend running `/visual-test`

### For a Phase (`/verify-migration phase-<N>`)

Run all individual verifications for every file in the phase, then summarize.

Reference the migration plan at `/mnt/data/projects/devbox/hostel_pro2/MIGRATION_PLAN.md` to determine which files belong to each phase.

| Phase | Files to Verify |
|-------|----------------|
| phase-1 | All `src/lib/db/schema/*.ts` files + `drizzle/custom/triggers.sql` |
| phase-2 | `src/lib/auth/index.ts`, `client.ts`, `otp-provider.ts`, `rbac.ts`, `src/app/api/auth/` |
| phase-3 | All `src/lib/services/*.ts` |
| phase-4 | `src/lib/storage/index.ts`, `signed-urls.ts`, `src/app/api/storage/` |
| phase-5 | All `src/app/api/*/route.ts` |
| phase-6 | All `src/components/**/*.tsx` + visual baselines |
| phase-6a | i18n: translation files, language toggle, locale switching (see below) |
| phase-7 | `src/lib/services/crypto.ts` + encryption tests |
| phase-8 | Run full test suite: unit + integration + E2E |
| phase-9 | Dockerfile builds, docker-compose up works, health check passes |

### For i18n / Phase 6A (`/verify-migration phase-6a` or `/verify-migration i18n`)

#### Step 1 — i18n Config Exists
```bash
ls src/i18n/config.ts src/i18n/request.ts
```
- PASS: both files exist
- FAIL: i18n infrastructure missing

#### Step 2 — next-intl Plugin Configured
```bash
grep -n 'createNextIntlPlugin\|withNextIntl' next.config.ts
```
- PASS: next-intl plugin wraps Next.js config
- FAIL: plugin not configured → translations won't load

#### Step 3 — NextIntlClientProvider in Root Layout
```bash
grep -n 'NextIntlClientProvider' src/app/layout.tsx
```
- PASS: provider wraps the app
- FAIL: client components can't access translations

#### Step 4 — All Translation Files Exist
```bash
# English (source of truth)
ls messages/en/common.json messages/en/auth.json messages/en/dashboard.json messages/en/applications.json messages/en/rooms.json messages/en/fees.json messages/en/leaves.json messages/en/documents.json messages/en/settings.json

# Hindi
ls messages/hi/common.json messages/hi/auth.json messages/hi/dashboard.json messages/hi/applications.json messages/hi/rooms.json messages/hi/fees.json messages/hi/leaves.json messages/hi/documents.json messages/hi/settings.json
```
- PASS: all 18 files exist (9 per locale)
- FAIL: list missing files

#### Step 5 — Translation Key Parity
For each JSON file, compare keys between `en/` and `hi/`:
```bash
# Extract keys from EN and HI, diff them
cd /mnt/data/projects/devbox/hostel_pro2
for file in common auth dashboard applications rooms fees leaves documents settings; do
  en_keys=$(bun -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('messages/en/${file}.json','utf8'))).sort().join('\n'))")
  hi_keys=$(bun -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync('messages/hi/${file}.json','utf8'))).sort().join('\n'))")
  diff <(echo "$en_keys") <(echo "$hi_keys") && echo "${file}: MATCH" || echo "${file}: MISMATCH"
done
```
- PASS: all files have matching top-level keys
- FAIL: list files with missing/extra keys in Hindi

#### Step 6 — No Hardcoded User-Facing Strings
Scan all components and pages for common hardcoded string patterns:
```bash
# Look for JSX text content that isn't a translation call
grep -rn '>[A-Z][a-z].*</' src/components/ src/app/ --include="*.tsx" | grep -v 't(' | grep -v 'className' | grep -v '//' | head -20
```
- PASS: no hardcoded strings found
- WARN: list files with potential hardcoded strings (manual review needed)

#### Step 7 — Language Toggle Component Exists
```bash
find src/components -name "language-toggle*" -o -name "LanguageToggle*" -o -name "locale-switcher*"
```
- PASS: toggle component exists
- FAIL: no language toggle found

#### Step 8 — Language Toggle on Landing Page
```bash
grep -rn 'LanguageToggle\|language-toggle\|LocaleSwitcher' src/app/layout.tsx src/app/page.tsx src/components/header* src/components/nav*
```
- PASS: toggle imported and used in layout/header
- FAIL: toggle not placed in UI

#### Step 9 — Visual Baselines for Both Locales
```bash
# Check baselines exist for both EN and HI
ls .visual-tests/baselines/*-en-* .visual-tests/baselines/*-hi-* 2>/dev/null | head -10
```
- PASS: baselines exist for both locales
- WARN: baselines missing for one or both locales → run `/visual-test` in each locale

#### Step 10 — Locale Cookie Switching Works (Manual/E2E)
Verify via E2E or manual test:
1. Load landing page → default is English
2. Click language toggle → page reloads in Hindi
3. Navigate to another page → Hindi persists
4. Refresh → Hindi still active (cookie persists)
- PASS: all 4 steps work
- FAIL: describe which step fails

## Output Format

For each target, produce a verification report:

```
╔══════════════════════════════════════════════════╗
║  Migration Verification: <target>                ║
╠══════════════════════════════════════════════════╣
║  ✅ File exists                                  ║
║  ✅ No NestJS patterns                           ║
║  ✅ No Supabase imports                          ║
║  ✅ Uses Drizzle ORM                             ║
║  ✅ Uses Zod validation                          ║
║  ✅ Type check passes                            ║
║  ✅ Unit tests exist (12 tests)                  ║
║  ✅ Integration tests exist (8 tests)            ║
║  ✅ All tests pass                               ║
║  ⚠️  Missing function: bulkExport()              ║
╠══════════════════════════════════════════════════╣
║  Result: 9/10 PASS, 1 WARNING                   ║
║  Status: READY (address warning before merge)    ║
╚══════════════════════════════════════════════════╝
```

Status levels:
- **READY** — all checks pass (warnings are OK)
- **NEEDS WORK** — one or more failures
- **BLOCKED** — file doesn't exist or critical dependency missing

## Important Rules

1. **Always run from project directory**: `/mnt/data/projects/devbox/hostel_pro2/`
2. **Use test database** for running integration/API tests — never main DB
3. **Read the old source file** for function parity comparison
4. **Don't auto-fix issues** — report them clearly so the developer can fix
5. **If no argument given** (`/verify-migration`), scan the project and list:
   - Files that have been migrated (exist in new project)
   - Files pending migration (in migration plan but not yet created)
   - Files migrated but not yet verified (no tests or tests failing)
6. **Reference MIGRATION_PLAN.md** for phase definitions and file mappings
7. **Reference TESTING_STRATEGY.md** for test naming conventions and coverage targets
