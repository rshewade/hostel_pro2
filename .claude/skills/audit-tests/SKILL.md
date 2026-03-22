---
name: audit-tests
description: Analyze test quality — detects tautological mocks, missing integration tests, weak assertions, and mocked auth
user-invocable: true
---

# Test Quality Audit Skill

Analyze test files for anti-patterns that create false confidence.

## Usage

```
/audit-tests                          — audit all test files
/audit-tests <file>                   — audit a specific test file
/audit-tests services                 — audit all service tests
/audit-tests api                      — audit all API route tests
```

## Checks to Perform

### Check 1 — Tautological DB Mocks

Find service tests that mock their own data layer:

```bash
grep -rn "vi.mock.*@/lib/db" src/lib/services/__tests__/*.unit.test.ts
```

For each match, read the test file and check if assertions only verify mock return values.

- **Flag**: test mocks DB AND asserts the mock's return value (tautological)
- **OK**: test mocks DB to isolate pure business logic (e.g., testing string formatting, validation rules — not data retrieval)

### Check 2 — Mocked Auth in API Tests

```bash
grep -rn "vi.mock.*@/lib/auth/rbac" src/app/api/__tests__/*.unit.test.ts
```

For each match, check if the test claims to verify auth behavior:

- **Flag**: test mocks `requireAuth`/`requireRole` AND has assertions like `expect(res.status).toBe(401)` — this tests the mock, not auth
- **OK**: auth is mocked to focus on testing non-auth business logic in the handler

### Check 3 — Missing Integration Tests

```bash
# List services without integration tests
for service in src/lib/services/*.ts; do
  name=$(basename "$service" .ts)
  # Skip index files and non-service files
  if [ "$name" = "index" ] || [ "$name" = "types" ]; then continue; fi
  if [ ! -f "src/lib/services/__tests__/${name}.integration.test.ts" ]; then
    echo "MISSING: $name"
  fi
done
```

### Check 4 — Format-Only Assertions

```bash
# Find tests with only type/existence assertions
grep -B5 -A1 "\.toBeDefined()\|\.toBeTruthy()\|typeof.*function" src/lib/services/__tests__/*.unit.test.ts
```

Flag tests where the ONLY assertions are type checks or existence checks. These prove the function exists, not that it produces correct output.

### Check 5 — Mock-to-Assertion Ratio

For each test file, count:
- Number of `vi.mock()` calls
- Number of `expect()` assertions
- Number of `vi.fn()` declarations

If `vi.mock()` count > unique `expect()` patterns, the test is likely testing mocks, not code. Flag for review.

## Output Format

```
╔══════════════════════════════════════════════════╗
║  Test Quality Audit                              ║
╠══════════════════════════════════════════════════╣
║  Files analyzed: NN                              ║
║                                                  ║
║  Tautological mocks:     NN files                ║
║  Missing integration:    NN/NN services          ║
║  Mocked auth (untested): NN files                ║
║  Format-only assertions: NN files                ║
║                                                  ║
╠══════════════════════════════════════════════════╣
║  Details                                         ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  TAUTOLOGICAL MOCKS:                             ║
║    - payments.unit.test.ts (3 mock chains)       ║
║    - audit.unit.test.ts (2 mock chains)          ║
║    ...                                           ║
║                                                  ║
║  MISSING INTEGRATION TESTS:                      ║
║    - applications                                ║
║    - payments                                    ║
║    - leaves                                      ║
║    ...                                           ║
║                                                  ║
║  RECOMMENDATION:                                 ║
║    Write integration tests for NN services.      ║
║    Use factories from src/test/factories.ts.     ║
║    Reference: rooms.integration.test.ts          ║
║                                                  ║
╚══════════════════════════════════════════════════╝
```

## Rules

1. **Never auto-fix tests** — report findings for the developer to address
2. **Distinguish legitimate mocks from tautological ones** — mocking an external API (Razorpay, SMS) is fine; mocking the DB in a service test is suspicious
3. **Run from project root**: `/mnt/data/projects/devbox/hostel_pro2/`
4. **Include file paths and line numbers** in all findings so developers can navigate directly
5. **Prioritize findings** — tautological mocks and missing integration tests are HIGH priority; format-only assertions are MEDIUM
