# Hostel Pro — Post-Mortem Audit Report

**Date**: 2026-03-21
**Scope**: Full codebase audit — tests, API routes, services, frontend, specifications, agent definitions

---

## Executive Summary

Despite having one of the most detailed specification suites I've seen (CLAUDE.md, MIGRATION_PLAN.md, TESTING_STRATEGY.md, 6 agent definitions, 4 skills), the execution has **systemic quality gaps**. The root cause is not missing documentation — it's that the documentation describes *what should be built* without providing *enforceable gates that prevent shipping incomplete work*.

The result: tests that pass but don't verify behavior, routes with security gaps, services with logic bugs, and a frontend that looks complete on the surface but has untranslated strings and missing functionality.

**Core diagnosis: The specifications optimized for breadth of coverage over depth of enforcement.**

---

## Part 1: What Went Wrong (Specific Findings)

### 1.1 Tests That Lie — The False Positive Problem

**Severity: CRITICAL**

The test suite creates a false sense of safety. Here are the patterns found:

#### Pattern A: Tautological Mocks (Testing the mock, not the code)

**File**: `src/lib/services/__tests__/payments.unit.test.ts:49-66`
```typescript
// The test manually sets the mock to return count=42
const mockSelect = vi.fn().mockReturnValue({
  from: vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([{ count: 42 }]),
  }),
});
(db.select as ReturnType<typeof vi.fn>).mockImplementation(mockSelect);

const receipt = await generateReceiptNumber();
expect(receipt).toMatch(/^RCP-\d{6}-\d{5}$/);  // ← Tests format only
```

This test proves the string formatting works when fed `42`. It does NOT prove:
- That the service actually queries the database
- That the count is used correctly (service could hardcode "00001" and pass)
- That concurrent calls generate unique numbers
- That the month is zero-padded correctly

**Every API route test file** (`src/app/api/__tests__/*.unit.test.ts`) follows this same pattern: mock all services, mock auth, then verify the mock returns what you told it to return.

#### Pattern B: Mocked Auth Means Zero RBAC Verification

Every API route test mocks auth like this:
```typescript
vi.mock('@/lib/auth/rbac', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
}));
```

Then "tests" role enforcement by rigging the mock:
```typescript
mockRequireRole.mockRejectedValue(new ForbiddenError("Role 'STUDENT' is not authorized."));
```

This verifies that **if** `requireRole` throws, the route returns 403. It does NOT verify:
- That the route actually calls `requireRole`
- That it calls it with the correct role list
- That a real STUDENT session can't access SUPERINTENDENT endpoints

**A route handler could be missing the `requireRole` call entirely and all tests would still pass.**

#### Pattern C: Route Existence Test — Checks Files, Not Routes

**File**: `src/app/__tests__/routes-existence.unit.test.ts`

This test uses `fs.existsSync()` to verify page files exist on disk. It doesn't verify:
- Routes are actually registered with Next.js
- Routes respond to the correct HTTP methods
- Routes have middleware applied
- A catch-all route doesn't shadow specific routes

The entire 351-line test could pass while the app returns 404 for every URL.

#### Pattern D: Near-Zero Integration Tests

The project has **2 integration test files** for **22+ services**:
- `src/lib/services/__tests__/rooms.integration.test.ts` (103 lines)
- `src/lib/services/__tests__/crypto.integration.test.ts`

Missing integration tests for:
- Payments (create fee → pay → verify → receipt) — **the most critical business flow**
- Applications (submit → review → approve → allocate) — **the primary user journey**
- Leaves (request → approve → calendar update)
- Auth (OTP send → verify → session create → role check)
- Notifications (event → dispatch → in-app insert)
- Documents (upload → sign URL → download → verify)
- Audit logging (any sensitive operation → audit record created)

**The TESTING_STRATEGY.md promised**: "Service functions → real DB: CRUD operations, query correctness, constraint enforcement" — for ALL services. Only 2 out of 22 have this.

### 1.2 Actual Bugs Found in Production Code

#### Bug 1: Audit Log Query Ignores `entityType` Parameter

**File**: `src/lib/services/audit.ts:62-67`
```typescript
export async function getAuditLogsByEntity(entityType: string, entityId: string, limit = 100) {
  return db.select().from(auditLogs)
    .where(eq(auditLogs.entityId, entityId))  // ← Missing entityType filter!
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
```

The function accepts `entityType` but never uses it. If two different entities (e.g., a USER and an APPLICATION) share the same UUID, this returns wrong data. Should use `and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId))`.

#### Bug 2: Crypto Silently Passes Through Plaintext

**File**: `src/lib/services/crypto.ts:29`
```typescript
export function decrypt(encrypted: string): string {
  if (!encrypted.includes(':')) return encrypted; // plaintext passthrough
```

If `ENCRYPTION_KEY` is not set and data is stored unencrypted, `decrypt()` silently returns the raw value. This means:
- No alarm when encryption is misconfigured
- Data that should be encrypted flows through unprotected
- Impossible to detect unencrypted records in the database

#### Bug 3: Missing Zod Validation on Mutation Routes

These POST/PATCH endpoints accept `await req.json()` without Zod validation:
- `src/app/api/applications/[id]/route.ts` (PATCH)
- `src/app/api/users/profile/route.ts` (PATCH)
- `src/app/api/student/exit-request/route.ts` (POST)
- `src/app/api/documents/upload/route.ts` (manual check instead of Zod)

This violates CLAUDE.md's explicit convention: "Validate all input with Zod schemas."

#### Bug 4: OTP Rate Limiting Not Implemented

CLAUDE.md specifies: "max 5 OTP requests per phone per 10 min." No rate limiting exists in the OTP routes or middleware. Any caller can brute-force OTPs.

#### Bug 5: Inconsistent List API Response Formats

Some list endpoints return `{ data, total, page, limit }`, others return just `{ data }`:
- `src/app/api/parent/leave/route.ts` — returns `{ data }` without pagination
- `src/app/api/student/exit-request/route.ts` — returns `{ data }` without pagination

Frontend code expecting a consistent shape will break.

### 1.3 Frontend Gaps

#### Hardcoded Strings Bypassing i18n

Despite CLAUDE.md saying "No hardcoded user-facing strings", several dashboard pages contain untranslated text:
- Student dashboard: "Pay Fees", "Download Letters", "Apply for Leave", "Room Details"
- Accounts page: "Receipt management module coming soon..."
- Various "Coming Soon" feature labels

These should all use `t()` translation calls.

#### Superintendent Page Has Unimplemented Features

`src/app/(dashboard)/superintendent/page.tsx` contains: `// TODO: Implement actual message sending via API` — messages are logged to console instead of sent.

### 1.4 E2E Test Coverage vs. Promise

TESTING_STRATEGY.md promises **10 critical user journeys**. The project has 7 E2E files:
```
routes-smoke.e2e.test.ts
test1-accounts-roles.e2e.test.ts
test2-application-flow.e2e.test.ts
test3-auth-and-dashboards.e2e.test.ts
test4-api-flows.e2e.test.ts
test5-security-i18n-compliance.e2e.test.ts
test6-responsive-edge-cases.e2e.test.ts
```

But quantity of files doesn't equal quality. Without running them, the structure suggests they cover high-level flows but lack the depth needed for critical paths like payment verification or concurrent room allocation.

### 1.5 Missing Infrastructure

| Item | Status | Impact |
|------|--------|--------|
| CI/CD pipeline (`.github/workflows/`) | **MISSING** | No automated gate — anyone can push broken code |
| Pre-commit hooks (`.husky/`) | **MISSING** | Gate commands must be run manually (they won't be) |
| Coverage enforcement in vitest config | **MISSING** | No threshold — coverage can drop to 0% without failing |
| `vitest.integration.config.ts` | EXISTS | But only 2 services have integration tests |

---

## Part 2: Root Cause Analysis — Why Detailed Specs Failed

### 2.1 The Specification Described Outcomes, Not Enforcement

CLAUDE.md says: "Every phase must pass this checklist before moving on. No exceptions."

But there is:
- No CI pipeline to block merges
- No pre-commit hooks to enforce the gate
- No automated tool that prevents phase progression
- No blocking authority assigned to any agent

**The gate is aspirational, not mechanical.** An agent can declare "Phase 3 complete" without running integration tests, and nothing stops it.

### 2.2 Verification Skill Checks Existence, Not Correctness

`/verify-migration` for a service checks:
1. File exists
2. No NestJS imports
3. Uses Drizzle
4. Has tests
5. Old methods have equivalents

It does NOT check:
- Tests actually pass
- Tests cover critical paths
- Behavior matches the old implementation
- Error handling is correct


**Having a file with tests ≠ having verified behavior.** The skill rewards "check the box" over "prove it works."

### 2.3 Agent Definitions Lack Accountability Boundaries

The agent communication pattern says:
```
backend-dev → qa-tester: "users service ready for verification"
qa-tester → backend-dev: "3 tests failing, see details"
```

But:
- No SLA on response time (qa-tester might never verify)
- No blocking: backend-dev can move on without qa-tester's sign-off
- No escalation trigger: if qa-tester doesn't respond in 15 min, nothing happens
- No task tracking: messages can be lost in context windows

**Result:** backend-dev writes a service, sends a message to qa-tester, then moves on. qa-tester is busy with something else. The service ships unverified.

### 2.4 Mock Mode Creates a Comfort Illusion

CLAUDE.md correctly states: "Tests always use mock — zero external dependencies."

But the specification never requires **contract tests** that verify mock and live implementations have identical interfaces. So:
- Mock SMS always succeeds → tests pass
- Live Twilio has rate limits, network errors, format requirements → production fails
- Nobody tested the transition from mock to live

### 2.5 "Functional Parity" Was Never Defined

`/verify-migration` says to check that "all old public methods have new equivalents." But "equivalent" is undefined:
- Same function name? (weakest)
- Same signature? (inputs and outputs match)
- Same behavior? (returns same results for same inputs)
- Same error handling? (throws same errors for invalid inputs)

In practice, agents checked for "same function name" and moved on.

### 2.6 Unit Tests Were Incentivized Over Integration Tests

The phase completion gate says: "Unit tests → Integration tests → Build." But:
- Unit tests are fast to write (mock everything, assert format)
- Integration tests require a running database, seed data, cleanup
- No coverage threshold enforced
- Agents naturally optimize for speed: write unit tests, skip integration

**The specification didn't weight test types.** It should have said: "Integration tests for all services with real DB are non-negotiable. Unit tests are supplementary."

---

## Part 3: Recommended Changes

### 3.1 Changes to CLAUDE.md

#### A. Replace the Phase Completion Gate with an Executable Script

Instead of a prose checklist, create `scripts/phase-gate.sh`:

```bash
#!/bin/bash
set -e
echo "=== Phase Gate ==="
bun run typecheck
bun run lint
bun run test:unit
bun run test:integration
bun run build
echo "=== ALL CHECKS PASSED ==="
```

Then in CLAUDE.md:
> **Phase completion gate**: Run `bun run phase:gate`. It must exit 0. There is no manual alternative.

#### B. Add Integration Test Requirements Per Service

Add a section:
```
### Required Integration Tests (Non-Negotiable)
Every service must have an integration test that:
1. Inserts test data into the real test database
2. Calls the service function
3. Verifies the database state changed correctly
4. Tests at least one error/edge case with real constraints

Services without integration tests CANNOT be marked complete.
```

#### C. Define "Functional Parity" Explicitly

```
### Functional Parity Definition
A service has functional parity when:
1. Every public function from the old service exists in the new service
2. For each function, an integration test proves:
   - Same inputs produce same outputs (or documented improvement)
   - Same invalid inputs produce equivalent errors
   - Database state changes match (create/update/delete)
3. Old bugs are NOT replicated — document fixes in commit message
```

#### D. Add Mandatory RBAC Test Requirement

```
### RBAC Test Requirement
Every API route must have tests that verify:
1. Unauthenticated request → 401
2. Authenticated but wrong role → 403
3. Authenticated with correct role → 200/201
These must test with REAL auth session objects (not mocked requireRole).
```

#### E. Add Coverage Enforcement

```
### Coverage Thresholds (Enforced)
In vitest.config.ts:
  coverage: {
    thresholds: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    }
  }
Tests fail if coverage drops below these thresholds.
```

### 3.2 Changes to Agent Definitions

#### A. `qa-tester.md` — Add Explicit Anti-Patterns

Add this section:
```
### Anti-Patterns You Must Reject

When reviewing tests written by other agents:

1. **Tautological mocks**: If a test mocks a function to return X, then
   asserts the result contains X — that test is worthless. Flag it.

2. **Mocked auth assertions**: If a test mocks requireRole to throw,
   then checks for 403 — that proves the error handler works, not that
   auth is enforced. Require a real session test.

3. **Format-only assertions**: expect(receipt).toMatch(/^RCP-\d{6}-\d{5}$/)
   proves nothing about correctness. Assert the actual value.

4. **Existence-only tests**: Checking fs.existsSync() proves a file was
   created, not that it works. These are smoke tests, not verification.

5. **Zero-assertion tests**: Any test with only expect().toBeDefined()
   or no expect() at all.

Mark any service with these patterns as NEEDS REWORK.
```

#### B. `backend-dev.md` — Separate Writing from Verification

Add:
```
### Self-Verification Limit

You may run tests locally as a confidence check. However, you MUST
NOT mark a service as "complete" based on your own test run alone.

After writing a service + tests:
1. Create a task: "Verify: <service name>"
2. Assign it to qa-tester
3. Move to next service
4. Do NOT count the service as done until qa-tester marks the task complete

You may proceed to the next service while waiting, but the phase is
not complete until ALL verification tasks are closed.
```

#### C. `architect.md` — Add Blocking Authority

Add:
```
### Blocking Authority

You have authority to BLOCK phase completion if:
1. Security review reveals unmitigated vulnerabilities
2. Integration test coverage is below requirements
3. Functional parity is not demonstrated
4. Code conventions are violated in critical paths (auth, payments, crypto)

To block: Create a task "BLOCKED: <reason>" and notify the user.
No agent may mark the phase complete while a BLOCKED task exists.
```

#### D. All Agents — Add Anti-Shortcut Rules

Add to every agent definition:
```
### Quality Over Speed

- Never skip integration tests to save time
- Never mock auth to avoid setting up test sessions
- Never mark a test as passing by weakening the assertion
- Never create a test file with placeholder tests to "add later"
- If you can't write a proper test, flag it as incomplete — don't fake it
```

### 3.3 Changes to `/verify-migration` Skill

#### A. Add Behavioral Verification Steps

Replace the current Step 10 (Function Parity Check) with:
```
Step 10: Behavioral Parity Verification
  a. For each public function in the new service:
     - Find the equivalent in the old codebase
     - Verify an integration test exists that covers:
       * Happy path (valid input → expected output)
       * Error path (invalid input → correct error thrown)
       * Database state (correct rows created/updated/deleted)
  b. PASS: All functions have behavioral tests
  c. FAIL: List functions missing behavioral tests
```

#### B. Add Security Verification Steps

Add new steps:
```
Step 11: Security Audit
  a. Grep for requireAuth in route handler → must exist
  b. Grep for requireRole with specific roles → must exist for non-public routes
  c. Grep for Zod validation on POST/PATCH/PUT body → must exist
  d. Check for rate limiting on auth endpoints
  e. PASS: All checks pass
  f. FAIL: List specific security gaps

Step 12: Run Integration Tests
  a. Execute: bun run test:integration --filter <service>
  b. PASS: All tests pass with 0 failures
  c. FAIL: Paste test output — do NOT mark as READY
```

### 3.4 New Infrastructure to Create

#### A. CI Pipeline (`.github/workflows/ci.yml`)

```yaml
name: CI
on: [push, pull_request]
jobs:
  gate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18
        env:
          POSTGRES_DB: hostel_pro_test
          POSTGRES_USER: db_user1
          POSTGRES_PASSWORD: test
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck
      - run: bun run lint
      - run: bun run test:unit
      - run: bun run test:integration
      - run: bun run build
      - run: bun run test:e2e
```

#### B. Pre-Commit Hook

Create `.husky/pre-commit`:
```bash
#!/bin/sh
bun run typecheck || exit 1
bun run test:unit || exit 1
```

#### C. Coverage Configuration

Add to `vitest.config.ts`:
```typescript
test: {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'lcov'],
    thresholds: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
}
```

#### D. Integration Test Template

Create `src/test/integration-template.ts` that every service integration test must follow — with real DB setup, cleanup, and behavioral assertions.

### 3.5 New Skill: `/audit-tests`

Create a new skill that can be invoked to analyze test quality:

```
For each test file:
1. Count assertions per test (flag tests with <2 assertions)
2. Detect tautological mocks (mock returns X → assert X)
3. Detect mocked auth (flag as "needs real auth test")
4. Check integration test exists for the corresponding service
5. Output a scorecard: STRONG / WEAK / MISSING per service
```

---

## Part 4: Process Changes

### 4.1 The Real Problem: No Human-in-the-Loop Quality Gate

All the specification documents assume agents will self-enforce quality. They won't. Agents optimize for completion. The fix:

1. **After each phase**: User (you) runs the gate script manually and reviews the output
2. **After each service**: User spot-checks one integration test to verify it's not tautological
3. **Before any push**: CI must pass (once CI exists)

### 4.2 Prioritize Depth Over Breadth

The current approach: migrate all 22 services with unit tests, then come back for integration tests.

Better approach: **migrate one service completely** (unit + integration + E2E + security) as a reference implementation, then replicate the pattern.

### 4.3 Test-First for Critical Paths

For payments, auth, and room allocation:
1. Write the integration test FIRST (against the old behavior)
2. Then implement the service to make the test pass
3. This guarantees the test isn't tautological — it was written before the implementation

### 4.4 Reduce Specification, Increase Automation

The current CLAUDE.md is ~800 lines. Most of it should be **automated checks**, not prose instructions. Rules that can't be mechanically enforced will be violated.

**Rule of thumb**: If a specification line says "must" or "always", it needs a corresponding automated check. If it can't be automated, it needs a human review step assigned to a specific role.

---

## Part 5: Summary of Actions

### Immediate (Before Any More Development)

| # | Action | Owner |
|---|--------|-------|
| 1 | Fix `getAuditLogsByEntity` bug (missing entityType filter) | backend-dev |
| 2 | Add Zod validation to 3 unvalidated mutation routes | backend-dev |
| 3 | Remove crypto plaintext passthrough (fail loudly instead) | backend-dev |
| 4 | Implement OTP rate limiting | backend-dev |
| 5 | Create CI pipeline | devops |
| 6 | Add coverage thresholds to vitest config | devops |

### Short-Term (During Current Sprint)

| # | Action | Owner |
|---|--------|-------|
| 7 | Write integration tests for payments service (real DB) | qa-tester |
| 8 | Write integration tests for applications service (real DB) | qa-tester |
| 9 | Write real RBAC tests (not mocked) for all API routes | qa-tester |
| 10 | Move hardcoded strings to i18n translation files | frontend-dev |
| 11 | Implement superintendent message sending | backend-dev |
| 12 | Update `/verify-migration` with security + behavioral steps | architect |

### Medium-Term (Next Phase)

| # | Action | Owner |
|---|--------|-------|
| 13 | Write integration tests for remaining 18 services | qa-tester |
| 14 | Create `/audit-tests` skill | architect |
| 15 | Add pre-commit hooks | devops |
| 16 | Update all agent definitions with anti-shortcut rules | architect |
| 17 | Create reference implementation (1 service, fully tested) | architect + backend-dev |

---

## Conclusion

The specifications were thorough but toothless. They described the ideal outcome without creating the mechanical barriers that force agents to achieve it. Agents — whether human or AI — will take shortcuts when shortcuts are available and completion is the incentive.

The fix is not more documentation. It's:
1. **Automated enforcement** (CI, hooks, coverage thresholds)
2. **Separation of concerns** (writer ≠ verifier)
3. **Behavioral tests over structural tests** (prove it works, don't just prove it exists)
4. **Depth-first development** (one service done right > 22 services done superficially)

The codebase is salvageable. The architecture is sound. The services work. But the test suite needs to be substantially rewritten to provide real confidence, and the enforcement infrastructure must exist before the next phase of development.
