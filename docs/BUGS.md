# Bugs List — Hostel Pro

Discovered during manual and automated testing on 2026-03-21.

---

## Critical

### BUG-001: Public application form submission fails — API requires auth
- **Severity**: Critical
- **Found in**: Test 2.2.6 (Application Flow — Submit)
- **Steps to reproduce**:
  1. Navigate to `/apply` → select Boys Hostel
  2. Fill contact phone → verify OTP (123456)
  3. Fill all 6 form steps (Personal, Academic, Hostel, References, Documents, Review)
  4. Check declaration → click "Submit Application"
- **Expected**: Application saved to DB, redirect to `/apply/boys-hostel/success?trackingNumber=BH-2026-XXXX`
- **Actual**: Submission fails silently, stays on review page. No record created in DB.
- **Root cause**: `POST /api/applications` in `src/app/api/applications/route.ts` calls `requireAuth()`, but the public application form is used by unauthenticated applicants.
- **Fix**: Either make `POST /api/applications` public (add to `publicPaths` in middleware and remove `requireAuth` for POST), or create a separate public endpoint like `POST /api/applications/public`.
- **Screenshot**: `.visual-tests/screenshots/test2-full-flow/10_after_submit.png`

---

## High

### BUG-002: No server-side role enforcement on dashboard pages (FIXED)
- **Severity**: High
- **Status**: Fixed on 2026-03-21
- **Description**: A logged-in STUDENT could access `/superintendent` and receive 200 with full page HTML. Middleware only checked cookie presence, not role.
- **Fix applied**: Added role-specific `layout.tsx` files in each `src/app/(dashboard)/<role>/` directory that call `requireRole()` server-side. Unauthorized access now redirects to `/login?error=forbidden`.

### BUG-003: Sidebar and dashboard links used `/dashboard/student/...` prefix (FIXED)
- **Severity**: High
- **Status**: Fixed on 2026-03-21
- **Description**: Sidebar nav items and dashboard action buttons linked to `/dashboard/student/fees`, `/dashboard/student/leave`, etc. But pages live at `/student/fees` (the `(dashboard)` route group doesn't create a URL segment), so all links returned 404.
- **Fix applied**: Updated all links in sidebar.tsx, student/page.tsx, and all sub-pages to remove `/dashboard/` prefix. Added regression tests (149 route-existence tests + 38 sidebar tests).

---

## Medium

### BUG-004: Parent dashboard fails to load student data
- **Severity**: Medium
- **Found in**: Test 1 (Test Accounts & Roles — Parent)
- **Steps to reproduce**: Login as `parent@test.com` → navigate to `/parent`
- **Expected**: Dashboard shows linked students or "No students linked" empty state
- **Actual**: Error banner: "Unable to Load Data — Failed to load student data"
- **Root cause**: Parent account has no linked students in DB, and the dashboard doesn't handle the empty state gracefully — it shows an error instead of an informational message.
- **Screenshot**: `.visual-tests/screenshots/roles/parent-dashboard.png`

### BUG-005: Track page shows "Processing..." indefinitely for invalid tracking numbers
- **Severity**: Medium
- **Found in**: Test 2.2.8 (Track invalid number)
- **Steps to reproduce**:
  1. Navigate to `/track`
  2. Enter invalid tracking ID (e.g., `INVALID-0000`) and any mobile number
  3. Click "Continue"
- **Expected**: Error message like "Application not found"
- **Actual**: Shows "Processing..." spinner indefinitely, never resolves
- **Note**: With a valid tracking ID but wrong mobile, it correctly shows "Failed to verify application. Please try again."
- **Screenshot**: `.visual-tests/screenshots/test2-application-flow/2.2.8_track_invalid_result.png` (from earlier run)

### BUG-006: Better Auth trustedOrigins missing common ports
- **Severity**: Medium
- **Status**: Fixed on 2026-03-21
- **Description**: `trustedOrigins` in `src/lib/auth/index.ts` only had `localhost:3002`. Login from any other port (3000, 3001) or the external IP on port 3001 returned "Invalid Origin" error.
- **Fix applied**: Added `localhost:3000`, `localhost:3001`, `51.68.196.242:3001` to trustedOrigins.

---

## Low

### BUG-007: Slow SSR on several student pages (cold start)
- **Severity**: Low
- **Found in**: Manual API testing (Section 4)
- **Affected pages**: `/student/exit`, `/student/renewal`, `/student/mess`, `/student/biometric`
- **Description**: These pages take 5-20 seconds to respond on first request (cold start). Subsequent requests are fast.
- **Impact**: Poor perceived performance for first-time page loads.
- **Suggestion**: Investigate server-side data fetching in these pages, consider lazy loading or skeleton states.

### BUG-008: Accounts dashboard shows "1 Issue" Next.js dev indicator
- **Severity**: Low
- **Found in**: Test 1 (Accounts dashboard screenshot)
- **Description**: Next.js dev overlay shows "1 Issue" badge in bottom-left corner on the accounts dashboard. Likely a hydration warning or runtime error.
- **Impact**: Dev-only, won't appear in production. But should be investigated.
- **Screenshot**: `.visual-tests/screenshots/roles/accounts-dashboard.png`

---

## Bugs Found in Test 3-6 Runs (2026-03-21)

### BUG-009: "sorry, too many clients already" — PostgreSQL connection pool exhaustion
- **Severity**: Critical
- **Found in**: Test 6 (Parent portal, Student mobile responsive)
- **Steps to reproduce**: Run multiple E2E tests sequentially, or rapidly navigate between authenticated pages
- **Expected**: Pages load normally
- **Actual**: Server error: "sorry, too many clients already" at `src/lib/auth/rbac.ts:16` in `getSession()`. The error propagates through `requireAuth()` → role layout → page crash.
- **Root cause**: Each role-specific `layout.tsx` calls `requireAuth()` which creates a new DB connection via the `pg.Pool`. The pool has a default limit (usually 10), and the parent `(dashboard)/layout.tsx` ALSO calls `requireAuth()` — so each page request makes 2 auth DB calls (parent layout + role layout). Under test load, connections are exhausted.
- **Fix**: Either share the session between parent and child layouts, increase pool size, or remove the redundant `requireAuth()` from role layouts (they can just call `requireRole` since the parent layout already authenticated).
- **Screenshot**: `.visual-tests/screenshots/test6/parent-portal.png`, `.visual-tests/screenshots/test6/responsive-student-mobile.png`

### BUG-010: Student Fees page shows "Failed to load fee information" error
- **Severity**: Medium
- **Found in**: Test 3 (Student pages)
- **Steps to reproduce**: Login as student → navigate to `/student/fees`
- **Expected**: Fee overview with totals (even if all zeros) and empty fee list
- **Actual**: Fee Overview cards show ₹0 correctly, but "Fee Details" section shows red error: "Failed to load fee information. Please try again." with Retry button. Also shows "1 Issue" dev overlay.
- **Root cause**: The fees API call within the page component is failing, possibly due to the `?mine=true` query parameter or session lookup issue.
- **Screenshot**: `.visual-tests/screenshots/test3/student-fees.png`

### BUG-011: Student Room page shows error instead of "not allocated" empty state
- **Severity**: Medium
- **Found in**: Test 3 (Student pages)
- **Steps to reproduce**: Login as student with no room allocation → navigate to `/student/room`
- **Expected**: Informational message like "No room allocated yet" or "Pending Allocation"
- **Actual**: Red error banner: "Unable to Load Room Information — No room allocation found. Please contact the administrator." with Retry button.
- **Root cause**: The room page treats "no allocation" as an error instead of a valid empty state. The student dashboard already handles this correctly (shows "Pending Allocation" badge), but the room detail page does not.
- **Screenshot**: `.visual-tests/screenshots/test3/student-room.png`

### BUG-012: i18n — Home page Hindi translation not applied
- **Severity**: Medium
- **Found in**: Test 5 (i18n tests)
- **Steps to reproduce**: Navigate to `/` → click Hindi language toggle
- **Expected**: Page content switches to Hindi
- **Actual**: The screenshot shows Hindi toggle was clicked but the test assertion for Hindi characters may have failed. The language toggle button shows "हिन्दी" but the page content appears to remain in English.
- **Screenshot**: `.visual-tests/screenshots/test5/22-1-2_home_hindi.png`

### BUG-013: Cron endpoint returns wrong status code — 404 instead of 401
- **Severity**: Medium
- **Found in**: Test 5 (Security — Cron endpoint tests 17.3.2, 17.3.3, 21.5.x)
- **Steps to reproduce**: `POST /api/admin/cron/data-retention` without or with wrong `x-cron-secret` header
- **Expected**: 401 Unauthorized
- **Actual**: Returns 404 (route not found) or a different status code, causing all cron security tests to fail
- **Root cause**: The `/api/admin/cron/data-retention` route may not exist yet, or the path structure doesn't match what the tests expect.

### BUG-014: Multiple API RBAC tests returning wrong status codes
- **Severity**: Medium
- **Found in**: Test 4 (API Flows), Test 5 (Security)
- **Description**: Several API tests that check role-based access control are failing. The `getSessionCookie` helper may not be properly passing cookies, causing authenticated endpoints to return redirects (307) instead of the expected 403 Forbidden.
- **Affected tests**: Student → POST /api/rooms (expected 403), Parent → POST /api/leaves (expected 403), Superintendent → GET /api/dashboard/accounts (expected 403)
- **Root cause**: Likely a cookie-passing issue in the test helpers — the auth cookie from the sign-in response may not include all required cookies, or the `Origin` header mismatch.

### BUG-015: `/api/rooms` requires auth but should be public
- **Severity**: Medium
- **Found in**: Test 4 (Section 10 — Room Allocation)
- **Steps to reproduce**: `curl -s http://localhost:3001/api/rooms` without auth cookie
- **Expected**: 200 with rooms list (middleware lists `/api/rooms` as public)
- **Actual**: Returns 401 Unauthorized
- **Root cause**: The middleware whitelist allows `/api/rooms` through without redirect, but the route handler itself calls `requireAuth()` or `requireRole()`. The middleware only skips the cookie check — it doesn't bypass auth inside the handler.
- **Impact**: Public room availability page cannot load without login.

### BUG-016: `/api/interviews/slots` returns 307 redirect instead of 200
- **Severity**: Medium
- **Found in**: Test 4 (Section 14 — Interview Scheduling)
- **Steps to reproduce**: `curl -s http://localhost:3001/api/interviews/slots` without auth
- **Expected**: 200 with available interview slots (listed in manual guide as public)
- **Actual**: 307 redirect to `/login`
- **Root cause**: The route is not in the middleware's `publicPaths` list, so unauthenticated requests get redirected.
- **Fix**: Add `/api/interviews/slots` to `publicPaths` in `src/middleware.ts`, OR remove the public expectation from the manual testing guide.

### BUG-017: Test 4 API failures cascade from BUG-009 (connection pool exhaustion)
- **Severity**: High (test infrastructure)
- **Status**: Fixed on 2026-03-21
- **Description**: When running Test 4 after Tests 1-3, the PostgreSQL connection pool was exhausted. The sign-in API returned 500, cascading into 20/21 test failures.
- **Fix applied**: BUG-009 fix (React `cache()` + pool limits) resolved this. Test 4 went from 20 failures to 7.

### BUG-018: `GET /api/fees?summary=true` returns 500 Internal Error
- **Severity**: High
- **Found in**: Test 4 (Section 11 — Fee & Payment)
- **Steps to reproduce**: Login as student → `GET /api/fees?summary=true` with valid session cookie
- **Expected**: 200 with fee summary object `{ totalDue, totalPaid, totalPending, overdueFees }`
- **Actual**: `{"error":{"code":"INTERNAL_ERROR","message":"Something went wrong","status":500}}`
- **Impact**: Student fees page shows "Failed to load fee information" (also causes BUG-010)

### BUG-019: `POST /api/leaves` returns 500 Internal Error
- **Severity**: High
- **Found in**: Test 4 (Section 12 — Leave Management)
- **Steps to reproduce**: Login as student → `POST /api/leaves` with valid leave data `{"type":"HOME_VISIT","startTime":"2026-04-01T09:00:00Z","endTime":"2026-04-03T18:00:00Z","reason":"Test"}`
- **Expected**: 201 with created leave (status PENDING)
- **Actual**: `{"error":{"code":"INTERNAL_ERROR","message":"Something went wrong","status":500}}`
- **Impact**: Students cannot apply for leave

### BUG-020: `GET /api/notifications` and `/unread-count` return 500
- **Severity**: High
- **Found in**: Test 4 (Section 15 — Notifications)
- **Steps to reproduce**: Login as student → `GET /api/notifications` or `GET /api/notifications/unread-count`
- **Expected**: 200 with notifications list / `{ count: N }`
- **Actual**: `{"error":{"code":"INTERNAL_ERROR","message":"Something went wrong","status":500}}`
- **Impact**: Notification bell count and notification list broken for all users

### BUG-021: `POST /api/student/documents` returns 500
- **Severity**: Medium
- **Found in**: Test 4 (Section 13 — Document Management)
- **Steps to reproduce**: Login as student → `POST /api/student/documents` with empty body
- **Expected**: 400 validation error ("file and documentType are required")
- **Actual**: 500 Internal Error
- **Impact**: Document upload validation not working — server crashes instead of returning validation error

---

## Summary

| ID | Severity | Status | Title |
|----|----------|--------|-------|
| BUG-001 | Critical | Fixed | Public application form submission fails — API requires auth |
| BUG-002 | High | Fixed | No server-side role enforcement on dashboard pages |
| BUG-003 | High | Fixed | Sidebar links used wrong `/dashboard/` prefix |
| BUG-004 | Medium | Fixed | Parent dashboard fails to load student data |
| BUG-005 | Medium | Fixed | Track page shows "Processing..." for invalid tracking numbers |
| BUG-006 | Medium | Fixed | Better Auth trustedOrigins missing common ports |
| BUG-007 | Low | Closed (not a bug) | Slow SSR cold start — expected Next.js dev-mode compilation |
| BUG-008 | Low | Fixed | Accounts dashboard hydration mismatch + stray Logout button |
| BUG-009 | Critical | Fixed | PostgreSQL connection pool exhaustion — "too many clients" |
| BUG-010 | Medium | Fixed | Student Fees page "Failed to load fee information" error (fixed via BUG-018) |
| BUG-011 | Medium | Fixed | Student Room page shows error instead of empty state |
| BUG-012 | Medium | Fixed | Hindi translation not applying — stale message cache + router.refresh() |
| BUG-013 | Medium | Fixed | Cron endpoint returns 404 instead of 401 |
| BUG-014 | Medium | Fixed | Multiple API RBAC tests returning wrong status codes |
| BUG-015 | Medium | Fixed | `/api/rooms` requires auth but should be public |
| BUG-016 | Medium | Fixed | `/api/interviews/slots` returns 307 instead of 200 |
| BUG-017 | High | Fixed | Test 4 cascading failures from DB connection pool exhaustion |
| BUG-018 | High | Fixed | `GET /api/fees?summary=true` returns 500 (auth ID vs app UUID) |
| BUG-019 | High | Fixed | `POST /api/leaves` returns 500 (auth ID vs app UUID) |
| BUG-020 | High | Fixed | `GET /api/notifications` and `/unread-count` return 500 (auth ID vs app UUID) |
| BUG-021 | Medium | Fixed | `POST /api/student/documents` returns 500 instead of 400 |

**Open**: 0
**Fixed / Closed**: 21
