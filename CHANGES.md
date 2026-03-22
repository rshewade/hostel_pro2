# Additional Changes — Hostel Pro

Implemented on 2026-03-21.

---

## 1. Application Approval — Auto Student Account Creation

When an application is approved by a superintendent/trustee, the system now automatically:
1. Creates a **Better Auth user** (email/password login) using the applicant's email
2. Creates an **app user profile** in the `users` table with role `STUDENT` and the correct vertical
3. Links the application to the new user via `student_user_id`
4. Logs temporary credentials to the console (to be replaced with SMS/email notification in production)

**Files changed:**
- `src/lib/services/applications.ts` — `updateApplicationStatus()` + new `createStudentAccount()`

---

## 2. Temporary Password Format

Student accounts created on approval receive a deterministic temporary password built from application data:

**Format:** `HP<last 4 digits of tracking number>#<DDMM of date of birth>`

| Example | Tracking # | DOB | Password |
|---------|-----------|-----|----------|
| Ashok Panchal | BH-2026-0007 | 2000-01-01 | `HP0007#0101` |
| Priya Jain | GA-2026-0003 | 2005-11-08 | `HP0003#0811` |

- Prefix `HP` (Hostel Pro) ensures minimum length
- Tracking number last 4 digits provide uniqueness
- DOB `DDMM` adds a personal factor the student knows
- Students should change this password on first login

**Files changed:**
- `src/lib/services/applications.ts` — `createStudentAccount()` password generation

---

## 3. Email Required on Application Form

Applicant email is now **mandatory** (previously optional). This email is used for:
- Student login account creation after approval
- Communication during the application process

### API Changes
- `POST /api/applications` — `applicantEmail` changed from `z.string().email().optional()` to `z.string().email()` (required)

### Frontend Changes
- Email input is **always visible and required** on the contact/OTP page (all 3 verticals)
- Email is saved to `localStorage` regardless of whether phone or email is chosen as OTP method
- Form submission always passes `applicantEmail` from the contact step

**Files changed:**
- `src/app/api/applications/route.ts` — schema validation
- `src/app/apply/boys-hostel/contact/page.tsx`
- `src/app/apply/girls-ashram/contact/page.tsx`
- `src/app/apply/dharamshala/contact/page.tsx`
- `src/app/apply/boys-hostel/form/page.tsx` — error message extraction

---

## 4. Duplicate Email Check on Application Submission

Before creating a new application, the system checks for duplicate emails:

1. **Users table** — if the email already belongs to a registered user, the application is rejected with: *"An account with this email already exists. Please log in instead."*
2. **Pending applications** — if the email has a non-rejected/non-archived application in progress, the application is rejected with: *"An application with this email is already in progress. Use the tracking page to check status."*

Both checks throw a `ConflictError` (HTTP 409).

**Files changed:**
- `src/lib/services/applications.ts` — new `checkDuplicateEmail()` function
- `src/app/api/applications/route.ts` — calls `checkDuplicateEmail()` before `createApplication()`

---

## 5. Config Page — Missing PUT/DELETE Handlers

The superintendent config page (`/superintendent/config`) was failing because the API routes for leave types and blackout dates only had GET/POST handlers. The frontend sends PUT for updates and DELETE for removals.

### Added:
- `PUT /api/config/leave-types` — update leave type by ID
- `PUT /api/config/blackout-dates` — update blackout date by ID
- `DELETE /api/config/blackout-dates` — delete blackout date by ID

### Frontend interface fixes:
- Aligned TypeScript interfaces to match actual DB schema (`isActive` not `active`, `maxDays` not `maxDaysPerMonth`/`maxDaysPerSemester`, etc.)
- Removed non-existent fields (`allowedVerticals`, `verticals` arrays)

**Files changed:**
- `src/app/api/config/leave-types/route.ts`
- `src/app/api/config/blackout-dates/route.ts`
- `src/app/(dashboard)/superintendent/config/page.tsx`

---

## 6. Application Status Update — Correct Endpoint & Valid Transitions

The superintendent and trustee dashboards were calling `PUT /api/applications/[id]` to approve/reject applications, but:
- That route only has GET/PATCH (no PUT)
- The PATCH schema doesn't accept `status` fields
- The correct endpoint is `PATCH /api/applications/[id]/status`

### DB trigger enforces these transitions:
```
DRAFT      → SUBMITTED
SUBMITTED  → REVIEW, REJECTED
REVIEW     → INTERVIEW, APPROVED, REJECTED
INTERVIEW  → APPROVED, REJECTED
APPROVED   → ARCHIVED
REJECTED   → ARCHIVED
```

### Action buttons are now status-aware:
| Current Status | Available Actions |
|---------------|-------------------|
| SUBMITTED | Accept for Review, Reject |
| REVIEW | Approve, Schedule Interview, Reject |
| INTERVIEW | Approve, Reject |
| APPROVED/DRAFT/ARCHIVED | No actions (message shown) |

**Files changed:**
- `src/app/(dashboard)/superintendent/page.tsx` — endpoint fix, status-aware buttons, `INTERVIEW` type/mapping
- `src/app/(dashboard)/trustee/applications/page.tsx` — endpoint fix, valid status values

---

## 7. New Applications Default to SUBMITTED

Previously, `createApplication()` set `currentStatus: 'DRAFT'`, but nothing transitioned DRAFT → SUBMITTED. Since the public form is a complete submission (no save-as-draft flow), applications now insert as `SUBMITTED` with `submittedAt` set.

**Files changed:**
- `src/lib/services/applications.ts` — `createApplication()`

---

## 8. Database Connection Leak Fix

Next.js hot reloads in dev mode were creating new `postgres()` and `pg.Pool` clients without closing old ones, exhausting PostgreSQL's `max_connections = 100`.

**Fix:** Cached both connection pools on `globalThis` (standard Next.js dev pattern) so hot reloads reuse existing connections.

**Files changed:**
- `src/lib/db/index.ts` — globalThis cache for postgres.js client
- `src/lib/auth/index.ts` — globalThis cache for pg Pool

---

## 9. Dev Server Performance — Turbopack + Bun Runtime

Page loads were significantly slower than expected after migrating from Node to Bun. Root cause: Bun was only acting as a package manager — Next.js still used Webpack (slow) on Node's HTTP server.

### Changes (applied incrementally, each verified for speed improvement):

**Step 1 — Turbopack** (biggest impact):
Changed `next dev` → `next dev --turbopack`. Turbopack replaces Webpack for dev compilation — 10-100x faster HMR and initial page loads.

**Step 2 — Bun runtime**:
Changed `next dev --turbopack` → `bun --bun next dev --turbopack`. This forces Next.js to run on Bun's HTTP server instead of Node's, giving faster cold starts and request handling.

**Files changed:**
- `package.json` — `dev` script: `"bun --bun next dev --turbopack"`

---

## 10. Recommendations for Rebuild — Lessons from Bug Fixes

During bug fixing, **no database schema or trigger changes were needed** — the DB design is solid. All 21 bugs were fixed in application code. However, several bugs could have been prevented entirely with better architectural decisions from the start.

### 10.1 Auth ID ↔ App User ID Mapping (prevented BUG-018, 019, 020)

Better Auth assigns its own UUID to users. The app `users` table has a separate `id`. Services were querying with one when they needed the other, causing 500 errors on fees, leaves, and notifications.

**Recommendation:**
- Store `better_auth_user_id` as an indexed column on the `users` table
- Create a reusable `resolveUserId(session)` helper that maps auth session → app user ID
- Use this helper in every service that needs the app user ID — never assume `session.user.id` is the app UUID

### 10.2 Single DB Connection Pool (prevented BUG-009, 017)

Two independent DB clients (`postgres` for Drizzle, `pg.Pool` for Better Auth) both created connections without `globalThis` caching, exhausting PostgreSQL's `max_connections` during dev hot reloads.

**Recommendation:**
- Cache all connection pools on `globalThis` from day one (standard Next.js pattern)
- Ideally share a single pool between Drizzle and Better Auth
- Set explicit `max` connection limits matching the PostgreSQL server config

### 10.3 Single Source of Truth for Route Auth (prevented BUG-001, 015, 016)

Middleware `publicPaths` listed routes as public, but route handlers independently called `requireAuth()`. The two lists were out of sync — middleware let requests through, then the handler rejected them.

**Recommendation:**
- If middleware says a route is public, the handler must not call `requireAuth()`
- Document a clear contract: middleware handles cookie-level auth gating, handlers handle role-level RBAC
- Consider a shared config or naming convention (e.g., routes in `/api/public/` never call `requireAuth()`)

### 10.4 Application Status — No DRAFT Without Save-as-Draft (prevented CHANGE-6, 7)

`createApplication()` defaulted to `DRAFT` status, but no save-as-draft flow existed. The DB trigger blocked `DRAFT → APPROVED` transitions, so superintendents couldn't approve applications until we changed the default to `SUBMITTED`.

**Recommendation:**
- Default new applications to `SUBMITTED` with `submittedAt` set
- Only introduce `DRAFT` status when a save-as-draft UI flow is built

### 10.5 Dev Server Config (prevented BUG-007, slow page loads)

`next dev` used Webpack by default, and `bun run dev` only used Bun as a package manager (Node still served HTTP).

**Recommendation:**
- Start with `bun --bun next dev --turbopack` from the beginning
- Use Turbopack for dev compilation, Bun runtime for HTTP serving
