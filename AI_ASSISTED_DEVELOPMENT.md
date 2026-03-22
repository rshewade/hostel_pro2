# AI-Assisted Development: A Practical Approach

**Project**: Hostel Pro — Hostel/Student Accommodation Management System
**Date**: 2026-03-20
**Stack**: Bun + Next.js + PostgreSQL 18 + Drizzle ORM + Better Auth + Tailwind CSS 4
**Migration**: NestJS/Supabase (old) → Modern single-app architecture (new)

---

## The Core Idea

Instead of writing code first and documenting later, we inverted the process: **define everything before writing a single line of code**. The AI agents work from detailed plans, conventions, and checklists — not from vague instructions. Every decision is captured upfront so agents can operate autonomously with minimal human intervention.

The result: a full-stack application migration planned across 11 phases, with 6 specialized AI agents, 5 reusable skills, mock strategies for all external dependencies, Slack notifications for progress tracking, and zero third-party keys required to start development.

---

## Phase 1: Foundation Before Code

### Start with the Migration Plan

Before touching any code, we wrote `MIGRATION_PLAN.md` — a 500+ line document covering:

- **9 phases + 1 sub-phase (6A for i18n)** with exact files to create per phase
- **File reuse strategy** — categorized ~380 files from the old codebase by reusability (100% copy → discard/rewrite)
- **Translation maps** — old pattern → new pattern for every infrastructure change (NestJS → plain TS, Supabase → Drizzle, class-validator → Zod, etc.)
- **Execution order** with a dependency diagram showing which phases block others
- **Estimated scope** — exact file counts per category

The key insight: **the migration plan IS the specification**. Agents read it and know exactly what to build, where the old code lives, what patterns to follow, and what to verify.

### CLAUDE.md as the Single Source of Truth

`CLAUDE.md` is automatically loaded into every conversation context. We made it the definitive reference for:

- Tech stack and project structure
- Code conventions (services, API routes, DB, frontend, i18n, error handling)
- Mock modes for external services
- Agent roster and workflow
- Phase completion gates
- Security checklist
- Rollback strategy per phase

If it's not in CLAUDE.md, it doesn't exist for the agents. This eliminates ambiguity.

---

## Phase 2: Specialized Agent Team

### Why Not One General Agent?

A single agent trying to handle schema design, frontend migration, testing, and DevOps would:
- Lose context as conversations grow
- Apply backend patterns to frontend code (or vice versa)
- Not know when to escalate vs. proceed
- Have no clear ownership of deliverables

### The 6-Agent Team

We defined 6 agents, each as a markdown file in `.claude/agents/`:

| Agent | Model | Responsibility |
|-------|-------|---------------|
| `architect` | Opus (most capable) | Architecture decisions, schema design, code review, phase sign-off |
| `backend-dev` | Sonnet (fast) | Drizzle schemas, service migration, API routes, auth |
| `frontend-dev` | Sonnet | React components, Tailwind UI, i18n, data fetching |
| `devops` | Sonnet | Docker, PostgreSQL ops, CI/CD, environment |
| `qa-tester` | Sonnet | Vitest tests, migration verification, coverage |
| `visual-tester` | Sonnet | Playwright screenshots, responsive/cross-browser testing |

### What Each Agent File Contains

Each agent definition includes:
1. **Available skills** — which project commands they can use, with common usage examples
2. **Project context** — relevant tech stack, database details, old codebase paths
3. **Migration patterns** — before/after code examples specific to their domain
4. **Testing requirements** — what tests they must write alongside their code
5. **Rules** — hard constraints (e.g., "no hardcoded strings", "no NestJS patterns")
6. **Phase completion gate** — must pass typecheck + lint + tests + build before pushing
7. **Notification triggers** — when to ping the user via Slack

### Agent Teams (Experimental)

We enabled Claude Code's experimental Agent Teams feature (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`), which allows agents to:
- Run concurrently with independent context windows
- Message each other directly (not just report to parent)
- Self-coordinate via shared task lists
- Persist across conversation turns

This enables parallel workflows like:
```
backend-dev migrates service → messages qa-tester "ready for verification"
qa-tester runs /verify-migration → messages backend-dev with results
frontend-dev migrates component → messages visual-tester "capture baselines"
```

---

## Phase 3: Reusable Skills

### What Are Skills?

Skills are user-invocable commands (like `/pg tables` or `/visual-test responsive dashboard`) defined as markdown files in `.claude/skills/`. They encode domain knowledge that agents reference during their work.

### The 5 Skills We Built

| Skill | Purpose | Key Innovation |
|-------|---------|---------------|
| `/pg` | PostgreSQL management | Encodes connection details, container name, common queries — agents never need to remember `docker exec` syntax |
| `/testdb` | Test database lifecycle | Create, recreate, push schema, truncate, seed — keeps test DB in sync with schema changes |
| `/visual-test` | Playwright visual testing | Screenshot capture at 3 viewports, cross-browser, baseline comparison — standardized across all pages |
| `/verify-migration` | Migration verification checklist | 10-step service check, 7-step API check, 7-step component check, 10-step i18n check — nothing ships without passing |
| `/notify` | Slack DM notifications | Progress updates with emoji prefixes — agents notify on milestones, never silently wait when blocked |

### Skill-to-Agent Matrix

Not every agent needs every skill. We mapped skills to agents based on their responsibilities:

| Agent | /pg | /testdb | /visual-test | /verify-migration | /notify |
|-------|:---:|:-------:|:------------:|:-----------------:|:-------:|
| architect | yes | — | yes | yes | yes |
| backend-dev | yes | yes | — | yes | yes |
| frontend-dev | — | — | yes | yes | yes |
| devops | yes | yes | — | — | yes |
| qa-tester | yes | yes | yes | yes | yes |
| visual-tester | — | — | yes | — | yes |

---

## Phase 4: Mock Everything External

### The Problem

Third-party APIs (Razorpay, Twilio, SendGrid) would block development if keys weren't available. We needed all 11 phases to be buildable without any external credentials.

### The Pattern

Every external service gets a **common interface** with swappable mock/live implementations, controlled by environment variables:

```
SMS_MODE=mock|live                    (default: mock)
RAZORPAY_MODE=mock|live               (default: mock)
NOTIFICATION_MODE=mock|live           (default: mock)
EMAIL_PROVIDER=console|resend|sendgrid|ses  (default: console)
WHATSAPP_MODE=mock|live               (default: mock)
```

### What Mocks Do

| Service | Mock Behavior |
|---------|--------------|
| SMS/OTP | OTP always `123456`, logs to console |
| Razorpay | Fake order IDs, signatures always valid, realistic payment objects |
| Email | Logs subject + body to console |
| WhatsApp | Logs message to console |
| In-app notifications | Always live — just DB inserts |

### Why This Works

- **Zero keys to start** — `bun run dev` works from Phase 0 onward
- **Tests are deterministic** — mock responses are predictable
- **Same code paths** — mock and live share identical interfaces, so switching is just an env var flip
- **No "TODO: implement later"** — the mock IS the implementation for dev, the live swap is trivial

---

## Phase 5: Testing Strategy Before Tests

### The Testing Pyramid

We defined a 4-layer testing strategy in `TESTING_STRATEGY.md` before writing any test:

```
Layer 4 — Visual     (Playwright CLI screenshots, baselines)
Layer 3 — E2E        (Playwright Test, 10 critical user flows)
Layer 2 — Integration (Vitest + real PostgreSQL, service→DB + API routes)
Layer 1 — Unit       (Vitest + jsdom, services + schemas + components)
```

### Naming Conventions

File names encode the test layer:
- `*.unit.test.ts` — unit tests
- `*.test.tsx` — component tests
- `*.integration.test.ts` — service + DB tests
- `*.api.test.ts` — API route tests
- `*.e2e.test.ts` — end-to-end tests

### Real Database, Never Mock It

Integration tests run against `hostel_pro_test` — a real PostgreSQL database. The `/testdb` skill manages its lifecycle:
- `/testdb create` → provision
- `/testdb push` → sync Drizzle schema
- `/testdb truncate` → clean between tests
- `/testdb recreate` → nuclear reset

### The Phase Completion Gate

Every phase must pass before moving on:
```
1. typecheck     → bunx tsc --noEmit
2. lint          → bun run lint
3. unit tests    → bun run test:unit
4. integration   → bun run test:integration
5. build         → bun run build
6. commit + push → git push origin main
7. notify        → Slack DM with results
```

If any step fails, fix and restart. No exceptions.

---

## Phase 6: Notifications and Observability

### Slack DM for Progress

All 6 agents send Slack DMs to the developer at key milestones:

| Event | Emoji | When |
|-------|-------|------|
| Phase started | 🚀 | Beginning of each phase |
| Phase completed | ✅ | All checks pass, code pushed |
| Verification passed | ✅ | /verify-migration succeeds |
| Verification failed | ❌ | /verify-migration finds issues |
| Blocker | 🚧 | Agent is stuck |
| **Waiting for user** | ⏳ | **Agent needs human action — never silently waits** |
| Test results | 🧪 | After test suite runs |
| Visual baselines | 📸 | After Playwright captures |

### The "Never Silently Wait" Rule

Every agent has a hard rule: if blocked on something only the user can do (env vars, secrets, clarification, external resources), immediately send a ⏳ Slack notification. This prevents the situation where an agent is stuck and the developer doesn't know.

---

## Phase 7: Internationalization from Day One

### Why Plan i18n Early

Adding translation support after building 280 components means touching every file twice. By planning i18n in Phase 0 (infrastructure) and Phase 6A (translations), every component is built with `t()` calls from the start.

### The Approach

- **Library**: `next-intl` (best Next.js App Router support)
- **Strategy**: Cookie-based locale, no URL prefix — avoids `/en/dashboard` vs `/hi/dashboard`
- **Locales**: English (source of truth) + Hindi
- **Rule**: No hardcoded user-facing strings anywhere — enforced by `/verify-migration` Phase 6A checks

---

## Phase 8: Security and Rollback

### Per-Phase Security Checklist

Instead of a generic "be secure" instruction, we defined specific security checks per phase:
- Phase 2: OTP rate limiting, session expiry, no token leaks
- Phase 4: File type validation (allowlist), path traversal prevention, signed URL expiry
- Phase 5: Every route has `requireAuth` + `requireRole`, Zod validation
- Phase 9: No secrets in Dockerfile, non-root container user

### Rollback Strategy

Every phase has a documented rollback method:
- Phases 0-6A: `git revert` (all code, no data)
- Phase 1: DROP tables + re-push schema
- Phase 7: Verify no data encrypted with new keys before reverting
- Point of no return: post-deployment with real user data

---

## Phase 9: Error Handling Contract

### Defined Before Implementation

We specified the error handling contract in CLAUDE.md before any API route was written:

- 6 error classes: `NotFoundError`, `ForbiddenError`, `UnauthorizedError`, `ValidationError`, `ConflictError`, `RateLimitError`
- Standardized API response: `{ error: { code, message, status, details? } }`
- Pattern: services throw → routes catch → JSON response
- Rule: never leak stack traces to clients

This means every agent building an API route produces consistent error responses without coordination.

---

## What We Built (Before Writing Application Code)

| Asset | Count | Purpose |
|-------|-------|---------|
| `CLAUDE.md` | 1 (350+ lines) | Single source of truth for all conventions |
| `MIGRATION_PLAN.md` | 1 (600+ lines) | 11-phase roadmap with exact deliverables |
| `TESTING_STRATEGY.md` | 1 (650+ lines) | 4-layer pyramid with examples |
| Agent definitions | 6 | Specialized AI workers with tools and rules |
| Skill definitions | 5 | Reusable commands for DB, testing, visual, verification, notifications |
| Mock strategies | 5 | SMS, Razorpay, Email, WhatsApp, Notifications |
| Notification events | 11 | Leave, payment, room, emergency, audit |
| Git commits | 8 | All planning pushed to GitHub |

**Total planning artifacts**: ~2000 lines of structured documentation
**Application code written**: 0 lines
**Third-party keys required to start**: 0

---

## Key Principles

1. **Plan exhaustively, code with confidence** — Agents work from detailed specs, not vague instructions. The planning phase is the most important phase.

2. **Specialize agents, not generalize** — A backend agent with Drizzle patterns produces better code than a generalist guessing at patterns. Each agent is an expert in their domain.

3. **Skills encode institutional knowledge** — Connection strings, container names, verification checklists — write them once, reference them forever. No agent needs to ask "how do I connect to the database?"

4. **Mock everything external** — Development should never be blocked by a missing API key. Build the interface, mock the implementation, swap when ready.

5. **Test strategy before tests** — Naming conventions, file structure, database strategy, coverage targets — define them all before the first `describe()` block. This prevents inconsistency across agents.

6. **Notify, don't assume** — Agents tell the developer what's happening via Slack. The ⏳ "waiting for user action" notification is the most important one — it prevents silent deadlocks.

7. **Gate every phase** — Typecheck + lint + tests + build must all pass before pushing. This catches issues early and ensures each phase is a stable checkpoint to rollback to.

8. **Absolute paths, no ambiguity** — `~/projects/hostel_old/repo/` works for a human but breaks for agents in different contexts. Always use `/home/ubuntu/projects/hostel_old/repo/`.

9. **One version of truth** — PostgreSQL version, error response format, i18n approach — define once in CLAUDE.md, reference everywhere. When we changed PostgreSQL 16 → 18, we updated it in one pass across all files.

10. **The old codebase is a reference, not a template** — Old code has bugs, NestJS patterns, and missing features. Agents are instructed to fix bugs, strip decorators, and add what's missing — not blindly copy.

---

## How to Replicate This Approach

For any project migration or greenfield build:

1. **Write CLAUDE.md first** — Tech stack, conventions, structure, commands. This is what every agent session will see.

2. **Write the migration/implementation plan** — Phases, files per phase, dependencies, execution order. Be specific: file names, not just "create the auth module."

3. **Define agents** — One per domain. Give each agent: responsibilities, available skills, migration patterns, rules, testing requirements.

4. **Define skills** — Encode repeatable commands (database ops, testing, verification) as skill files. Reference from agents.

5. **Mock external services** — Interface + env var toggle. Default to mock. Document the switch.

6. **Define testing strategy** — Naming, structure, database strategy, coverage targets. Before any test is written.

7. **Set up notifications** — Slack, email, or file-based. Agents should never silently wait.

8. **Set permissions** — Grant everything needed upfront so agents aren't blocked by approval prompts.

9. **Enable agent teams** — If available, let agents communicate directly for faster coordination.

10. **Audit before starting** — Run a 20-point checklist. Fix every gap. Then start Phase 0.

---

## Outcome

After one morning of planning:
- A developer can say "start Phase 1" and walk away
- 6 agents know exactly what to build, how to test it, and when to notify
- Zero external dependencies block any phase
- Every phase has a clear completion gate and rollback strategy
- Progress is tracked via Slack DMs in real-time
- The entire approach is documented and reproducible for future projects
