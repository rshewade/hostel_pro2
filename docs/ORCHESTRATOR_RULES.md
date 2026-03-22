# Orchestrator Rules — Non-Negotiable

These rules govern how the orchestrator (main Claude session) manages tasks, agents, and quality gates. **No rule may be skipped, deferred, or overridden under any circumstances.**

---

## Rule 1: Verify Before Done — ALWAYS

**Before marking ANY task as done or committing ANY code:**

```bash
devbox run -- bash scripts/phase-gate.sh
```

This runs: typecheck → lint → unit tests → integration tests → build → coverage check.

**If it fails at ANY step → FIX before proceeding. Never commit broken code.**

The pre-commit hook enforces this mechanically, but the orchestrator must run it BEFORE even attempting to commit — not rely on the hook to catch failures.

---

## Rule 2: Tests Must Exist Before Task Is Done

A task that produces code but no tests is **NOT done**. Period.

| What was created | Required tests |
|------------------|---------------|
| Service file | `*.unit.test.ts` + `*.integration.test.ts` |
| API route | `*.api.test.ts` or covered in RBAC matrix test |
| Frontend component | `*.test.tsx` |
| Frontend page | Covered in E2E test |
| Schema file | Schema integration test |
| Utility/helper | `*.unit.test.ts` |

**If the task says "create users.ts", the test file `users.unit.test.ts` is part of that task — not a separate follow-up.**

---

## Rule 3: Run Locally, Not Hypothetically

Never say "build passes" or "tests pass" without having actually run the command and seen exit code 0.

**Wrong:**
- "Typecheck passes" (based on no errors in the editor)
- "Build should work" (based on experience)
- "Tests will pass once we add them"

**Right:**
- Run the command
- Check exit code
- Paste the last few lines of output as evidence

---

## Rule 4: Check CI After Every Push

After every `git push`, check CI status:

```bash
bash scripts/check-ci-status.sh
```

- If CI fails → **revert immediately** and fix
- If CI is pending → wait and check again
- Never push again until CI is green

---

## Rule 5: One Task = Complete Deliverable

A task is not "code written" — it is "code written + tests written + all checks pass + verified locally."

**Task completion checklist (run for EVERY task):**

1. ☐ All files listed in the task are created/modified
2. ☐ Tests for the code exist and pass
3. ☐ `devbox run -- bun run typecheck` exits 0
4. ☐ `devbox run -- bun run lint` exits 0
5. ☐ `devbox run -- bun run test:unit` exits 0
6. ☐ `devbox run -- bun run test:integration` exits 0 (if integration tests exist)
7. ☐ `devbox run -- bun run build` exits 0
8. ☐ No convention violations (camelCase API responses, Zod on mutations, etc.)
9. ☐ Slack notification sent for milestone

**If ANY box is unchecked → task is NOT done.**

---

## Rule 6: Never Batch Multiple Phases Into One Commit

Each phase gets its own commit(s). Never combine Phase 3 + Phase 4 + Phase 5 into one commit.

Rationale: If CI fails, a single-phase commit is easy to revert. A multi-phase commit is a nightmare.

---

## Rule 7: Agent Context Loading Is Mandatory

Before any agent starts work:

1. Read `CLAUDE.md`
2. Read `docs/CONVENTIONS.md`
3. Read `docs/ORCHESTRATOR_RULES.md` (this file)
4. Read the specific task from taskmaster
5. Read related existing files

**Never start coding without understanding the context.**

---

## Rule 8: QA Never Fixes — Dev Fixes

- QA agent identifies issues and reports them
- QA agent NEVER modifies source code
- Fix agents are spawned separately
- QA re-verifies after fix

---

## Rule 9: Only Architect Marks Done

- Dev agents set status to `review`
- QA verifies and reports
- **Only the architect can set status to `done`**
- Architect verifies: requirements met, tests pass, conventions followed

---

## Rule 10: Fail Fast, Fix Immediately

When a check fails:

1. **Stop** — do not continue to the next task
2. **Notify** — send Slack message with error details
3. **Fix** — resolve the issue in the current task
4. **Re-run** — verify the fix passes
5. **Notify** — send Slack message confirming fix
6. **Then proceed** — only after confirmation

**Never skip a failure. Never defer a fix. Never move on with known issues.**

---

## Rule 11: CI Is The Source of Truth

Local checks are a pre-filter. CI is the real gate.

- If local passes but CI fails → fix it
- If CI fails → the code is broken
- Check CI after every push: `bash scripts/check-ci-status.sh`

---

## Rule 12: Commit Message Must Reflect Reality

Never write "all tests pass" in a commit message unless all tests actually pass. Never write "build passes" unless the build actually exited 0.

---

## Enforcement Mechanisms

| Mechanism | What it enforces |
|-----------|-----------------|
| `scripts/pre-commit` (git hook) | Blocks commits if typecheck/lint/tests/build fail |
| `scripts/phase-gate.sh` | Full quality gate — run before marking phase done |
| `scripts/verify-test-coverage.sh` | Every service has integration test |
| `scripts/check-ci-status.sh` | Reverts last commit if CI failed |
| `.github/workflows/ci.yml` | Runs all checks on every push |

---

## Summary

```
Write code → Write tests → Run gate → All pass?
  YES → Commit → Push → Check CI → CI pass?
    YES → Notify ✅ → Next task
    NO → Revert → Fix → Start over
  NO → Fix → Re-run gate → Loop until pass
```

**There are no shortcuts. There are no exceptions.**
