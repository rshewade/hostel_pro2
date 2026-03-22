# Conventions — Hostel Pro 2

## Case Conventions (DB → API → Frontend)

### Layer Rules

| Layer | Convention | Example |
|-------|-----------|---------|
| PostgreSQL columns | `snake_case` | `created_at`, `full_name`, `student_user_id` |
| Drizzle schema TS keys | `camelCase` | `createdAt`, `fullName`, `studentUserId` |
| API JSON responses | `camelCase` | `{ "createdAt": "...", "fullName": "..." }` |
| API JSON request bodies | `camelCase` | `{ "fullName": "John", "applicantEmail": "j@x.com" }` |
| Zod schema keys | `camelCase` | `z.object({ fullName: z.string() })` |
| TypeScript interfaces | `camelCase` props | `interface User { fullName: string }` |
| React props | `camelCase` | `<UserCard fullName={user.fullName} />` |
| CSS classes | `kebab-case` | `status-badge`, `fee-card` |
| URL paths | `kebab-case` | `/api/leave-types`, `/api/blackout-dates` |
| URL query params | `camelCase` | `?userId=xxx&pageSize=10` |
| Enum values (everywhere) | `UPPER_SNAKE_CASE` | `SUBMITTED`, `BOYS_HOSTEL`, `HOME_VISIT` |
| Translation keys | `dot.camelCase` | `applications.statusBadge`, `common.saveButton` |
| Env vars | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `BETTER_AUTH_SECRET` |
| File names (code) | `kebab-case` | `leave-requests.ts`, `signed-urls.ts` |
| File names (components) | `PascalCase` | `ApplicationCard.tsx`, `PaymentFlowModal.tsx` |
| File names (tests) | `kebab-case.suffix` | `users.unit.test.ts`, `rooms.integration.test.ts` |

### Drizzle Schema Pattern

```typescript
// DB column = snake_case (first arg), TS property = camelCase (left side)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  applicantEmail: text('applicant_email'),
  studentUserId: uuid('student_user_id').references(() => users.id),
  currentStatus: applicationStatusEnum('current_status').default('SUBMITTED'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
```

### API Response Pattern

```typescript
// Service returns camelCase (from Drizzle)
const user = await db.select().from(users).where(eq(users.id, id));
// → { id: "...", fullName: "John", createdAt: "2026-..." }

// API returns exactly what the service returns (already camelCase)
return NextResponse.json({ data: user });
// → { "data": { "id": "...", "fullName": "John", "createdAt": "2026-..." } }
```

### Enum Pattern

```typescript
// DB enum (UPPER_SNAKE_CASE values)
export const applicationStatusEnum = pgEnum('application_status', [
  'DRAFT', 'SUBMITTED', 'REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'
]);

// Zod validation (same UPPER_SNAKE_CASE)
const updateStatusSchema = z.object({
  status: z.enum(['REVIEW', 'INTERVIEW', 'APPROVED', 'REJECTED']),
});

// API request (same UPPER_SNAKE_CASE)
// POST { "status": "APPROVED" }

// API response (same UPPER_SNAKE_CASE)
// { "data": { "currentStatus": "APPROVED" } }

// Frontend display (translate the enum value)
// t(`applications.status.${status}`) → "Approved" or "स्वीकृत"
```

### URL Path Pattern

```
/api/applications              → GET, POST
/api/applications/[id]         → GET, PATCH
/api/applications/[id]/status  → PATCH
/api/leave-types               → GET, POST, PUT, DELETE  (kebab-case)
/api/blackout-dates            → GET, POST, PUT, DELETE  (kebab-case)
/api/notification-rules        → GET, POST, PUT, DELETE  (kebab-case)
/api/dashboard/student         → GET
/api/admin/cron/data-retention → POST
```

### Query Parameter Pattern

```
GET /api/applications?page=1&limit=20&status=SUBMITTED&sortBy=createdAt&sortOrder=desc
                      ^^^^   ^^^^^   ^^^^^^            ^^^^^^           ^^^^^^^^^
                      camel  camel   UPPER_SNAKE       camelCase        camelCase
```

Service maps `sortBy=createdAt` → `ORDER BY created_at` internally.

### Pagination Response Pattern

```json
{
  "data": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

All keys camelCase. Every list endpoint uses this exact shape.

### Error Response Pattern

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "status": 400,
    "details": [
      { "field": "fullName", "message": "Required" },
      { "field": "applicantEmail", "message": "Invalid email" }
    ]
  }
}
```

- `code`: UPPER_SNAKE_CASE
- `field`: camelCase (matches Zod schema keys)
- All wrapper keys: camelCase

---

## Common Pitfalls

### 1. Raw SQL must use snake_case
```typescript
// WRONG
db.execute(sql`SELECT * FROM users WHERE fullName = ${name}`);

// CORRECT
db.execute(sql`SELECT * FROM users WHERE full_name = ${name}`);
```

### 2. Triggers use snake_case
```sql
-- triggers.sql uses DB column names
NEW.current_status   -- NOT currentStatus
NEW.student_user_id  -- NOT studentUserId
NEW.updated_at       -- NOT updatedAt
```

### 3. Better Auth has its own schema
Better Auth creates its own tables (`user`, `session`, `account`, `verification`). Do NOT rename their columns. Our `users` table links via `betterAuthUserId`.

### 4. Zod must match API contract
```typescript
// If API expects camelCase body:
const createApplicationSchema = z.object({
  fullName: z.string().min(1),       // camelCase
  applicantEmail: z.string().email(), // camelCase
  dateOfBirth: z.string(),            // camelCase
});
// NOT full_name, NOT applicant_email
```

### 5. Frontend never transforms case
```typescript
// API returns camelCase, frontend uses it directly
const { data } = await apiGet<User>('/api/users/profile');
console.log(data.fullName);    // Already camelCase
console.log(data.createdAt);   // Already camelCase
// NEVER do: data.full_name or snakeToCamel(data)
```

### 6. Sorting query params map internally
```typescript
// Route handler receives camelCase
const sortBy = req.nextUrl.searchParams.get('sortBy'); // "createdAt"

// Service maps to Drizzle column (which knows the DB column)
const column = schema.users[sortBy as keyof typeof schema.users]; // maps to created_at internally
```

---

## Test Cases for Case Convention Enforcement

Every service and API route test suite MUST include these checks:

### T1: API Response Keys are camelCase
```typescript
it('returns camelCase keys in response', async () => {
  const res = await fetch('/api/users/profile', { headers: { Cookie: cookie } });
  const json = await res.json();
  const keys = Object.keys(json.data);

  // No snake_case keys
  keys.forEach(key => {
    expect(key).not.toMatch(/_[a-z]/); // No underscore followed by lowercase
  });

  // Specific camelCase keys present
  expect(json.data).toHaveProperty('fullName');
  expect(json.data).toHaveProperty('createdAt');
  expect(json.data).not.toHaveProperty('full_name');
  expect(json.data).not.toHaveProperty('created_at');
});
```

### T2: API Accepts camelCase Request Body
```typescript
it('accepts camelCase input and rejects snake_case', async () => {
  // camelCase → succeeds
  const res1 = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify({ fullName: 'Test', applicantEmail: 'a@b.com' }),
  });
  expect(res1.status).toBe(201);

  // snake_case → fails validation
  const res2 = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify({ full_name: 'Test', applicant_email: 'a@b.com' }),
  });
  expect(res2.status).toBe(400);
});
```

### T3: Enum Values are UPPER_SNAKE_CASE
```typescript
it('returns UPPER_SNAKE_CASE enum values', async () => {
  const res = await fetch(`/api/applications/${id}`, { headers: { Cookie: cookie } });
  const json = await res.json();

  expect(json.data.currentStatus).toMatch(/^[A-Z_]+$/); // UPPER_SNAKE only
  expect(['DRAFT','SUBMITTED','REVIEW','INTERVIEW','APPROVED','REJECTED','ARCHIVED'])
    .toContain(json.data.currentStatus);
});
```

### T4: Pagination Response Shape
```typescript
it('returns standardized pagination with camelCase keys', async () => {
  const res = await fetch('/api/applications?page=1&limit=10', { headers: { Cookie: cookie } });
  const json = await res.json();

  expect(json).toHaveProperty('data');
  expect(json).toHaveProperty('pagination');
  expect(json.pagination).toHaveProperty('total');
  expect(json.pagination).toHaveProperty('page');
  expect(json.pagination).toHaveProperty('limit');
  expect(json.pagination).toHaveProperty('totalPages');

  // No snake_case pagination keys
  expect(json.pagination).not.toHaveProperty('total_pages');
  expect(json.pagination).not.toHaveProperty('page_size');
});
```

### T5: Error Response Shape
```typescript
it('returns camelCase error with UPPER_SNAKE code', async () => {
  const res = await fetch('/api/applications', {
    method: 'POST',
    body: JSON.stringify({}), // empty body
  });
  const json = await res.json();

  expect(json.error.code).toMatch(/^[A-Z_]+$/);        // UPPER_SNAKE
  expect(json.error).toHaveProperty('message');          // camelCase
  expect(json.error).toHaveProperty('status');           // camelCase
  expect(json.error).not.toHaveProperty('status_code');  // NOT snake_case
});
```

### T6: Drizzle Select Returns camelCase
```typescript
it('service returns camelCase properties from DB', async () => {
  const user = await createUser({ fullName: 'Test User' });
  const found = await findById(user.id);

  expect(found).toHaveProperty('fullName');     // camelCase
  expect(found).toHaveProperty('createdAt');    // camelCase
  expect(found).not.toHaveProperty('full_name');
  expect(found).not.toHaveProperty('created_at');
});
```

### T7: Query Params camelCase to snake_case Mapping
```typescript
it('sorts by camelCase param mapped to DB column', async () => {
  await createTestUser(db, { fullName: 'Zebra' });
  await createTestUser(db, { fullName: 'Alpha' });

  const res = await fetch('/api/users?sortBy=fullName&sortOrder=asc', {
    headers: { Cookie: staffCookie },
  });
  const json = await res.json();

  expect(json.data[0].fullName).toBe('Alpha');
  expect(json.data[1].fullName).toBe('Zebra');
});
```

### T8: Translation Key Convention
```typescript
it('translation keys use dot.camelCase notation', async () => {
  const enCommon = JSON.parse(fs.readFileSync('messages/en/common.json', 'utf8'));

  // Check all keys at every level
  function checkKeys(obj: Record<string, unknown>, path = '') {
    for (const key of Object.keys(obj)) {
      // Keys should be camelCase (no underscores, no hyphens, no spaces)
      expect(key).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        checkKeys(obj[key] as Record<string, unknown>, `${path}.${key}`);
      }
    }
  }
  checkKeys(enCommon);
});
```

---

## Design Verification Tests

Every page and component must pass design verification before a task or phase can be marked complete. Violations are **blocking** — notify via Slack and do not proceed.

### Blocking Rule

**No task or phase advances until ALL design tests pass.** If any test below fails:
1. Fix the violation
2. Re-run the test
3. Only then mark task as done

If the violation cannot be fixed immediately:
- Send Slack notification: `❌ *Design violation* — {file}: {violation description}`
- Mark task as `blocked` in taskmaster
- Do NOT proceed to next task

### D1: Responsive Layout — 3 Breakpoints

Every page must render correctly at desktop, tablet, and mobile.

```typescript
// e2e/tests/design-responsive.e2e.test.ts
const BREAKPOINTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
];

for (const bp of BREAKPOINTS) {
  test(`${pageName} renders at ${bp.name} (${bp.width}x${bp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto(pageUrl);
    await page.waitForLoadState('networkidle');

    // No horizontal overflow
    const body = await page.evaluate(() => document.body.scrollWidth);
    const viewport = await page.evaluate(() => window.innerWidth);
    expect(body).toBeLessThanOrEqual(viewport + 1); // 1px tolerance

    // No elements overflowing viewport
    const overflow = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const overflowing: string[] = [];
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth + 5) {
          overflowing.push(`${el.tagName}.${el.className}: right=${rect.right}`);
        }
      });
      return overflowing;
    });
    expect(overflow).toEqual([]);

    // Screenshot for visual review
    await page.screenshot({ path: `.visual-tests/screenshots/${pageName}-${bp.name}.png`, fullPage: true });
  });
}
```

### D2: No Hardcoded Strings (i18n Compliance)

Every user-facing string must use `t()` translation calls.

```typescript
// src/test/design/i18n-compliance.test.ts
import { glob } from 'glob';
import fs from 'fs';

test('no hardcoded English strings in components', () => {
  const files = glob.sync('src/components/**/*.tsx');
  const violations: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, i) => {
      // Skip imports, comments, className, data-testid, console
      if (line.match(/^\s*(import|\/\/|\/\*|\*)/)) return;
      if (line.match(/className|data-testid|console\.|aria-label/)) return;

      // Detect JSX text content: >Some Text<
      const match = line.match(/>\s*([A-Z][a-z][^<{]*)\s*</);
      if (match && !line.includes('t(') && !line.includes('{t(')) {
        violations.push(`${file}:${i + 1}: "${match[1].trim()}"`);
      }
    });
  }

  if (violations.length > 0) {
    console.error('Hardcoded strings found:\n' + violations.join('\n'));
  }
  expect(violations).toEqual([]);
});
```

### D3: No Broken Links or Dead Routes

Every `<Link>` and navigation href must resolve to an existing page.

```typescript
// e2e/tests/design-links.e2e.test.ts
test('all internal links resolve (no 404s)', async ({ page }) => {
  await page.goto('/');
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href^="/"]'))
      .map(a => (a as HTMLAnchorElement).href)
      .filter((href, i, arr) => arr.indexOf(href) === i); // unique
  });

  const broken: string[] = [];
  for (const link of links) {
    const res = await page.goto(link);
    if (res && res.status() >= 400) {
      broken.push(`${link} → ${res.status()}`);
    }
  }

  expect(broken).toEqual([]);
});
```

### D4: Sidebar Links Match Route Structure

No `/dashboard/` prefix. Every link resolves.

```typescript
// src/components/__tests__/Sidebar.design.test.tsx
import { render, screen } from '@testing-library/react';

const ROLES = ['STUDENT', 'SUPERINTENDENT', 'TRUSTEE', 'ACCOUNTS', 'PARENT'];

for (const role of ROLES) {
  test(`${role} sidebar has no /dashboard/ prefix links`, () => {
    render(<Sidebar role={role} />);
    const links = screen.getAllByRole('link');

    links.forEach(link => {
      const href = link.getAttribute('href');
      expect(href).not.toMatch(/^\/dashboard\//); // BUG-003 prevention
      expect(href).toBeTruthy();
    });
  });
}
```

### D5: Empty States Show Messages, Not Errors

Pages with no data must show informational empty states, never error banners.

```typescript
// e2e/tests/design-empty-states.e2e.test.ts
const EMPTY_STATE_PAGES = [
  { url: '/parent', role: 'PARENT', description: 'parent with no students' },
  { url: '/student/room', role: 'STUDENT', description: 'student with no room' },
  { url: '/student/fees', role: 'STUDENT', description: 'student with no fees' },
  { url: '/student/leave', role: 'STUDENT', description: 'student with no leaves' },
  { url: '/student/documents', role: 'STUDENT', description: 'student with no documents' },
];

for (const { url, role, description } of EMPTY_STATE_PAGES) {
  test(`${description} shows empty state, not error`, async ({ page }) => {
    await loginAs(page, role); // fresh user, no data
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // No error banners visible
    const errorBanner = page.locator('[data-testid="error-banner"], .text-red-500, [role="alert"]');
    await expect(errorBanner).toHaveCount(0);

    // Empty state message visible
    const emptyState = page.locator('[data-testid="empty-state"], .empty-state');
    await expect(emptyState).toBeVisible();
  });
}
```

### D6: Form Validation Shows Errors Correctly

Every form must show field-level errors inline, not just a toast.

```typescript
// e2e/tests/design-form-validation.e2e.test.ts
test('application form shows field-level validation errors', async ({ page }) => {
  await page.goto('/apply/boys-hostel/form');

  // Submit empty form
  await page.click('[data-testid="submit-button"]');

  // Field-level errors visible (not just a toast)
  const fieldErrors = page.locator('[data-testid*="error"], .field-error, [role="alert"]');
  const count = await fieldErrors.count();
  expect(count).toBeGreaterThan(0);

  // Errors are near their fields (not all at top of page)
  const firstError = fieldErrors.first();
  const errorBox = await firstError.boundingBox();
  expect(errorBox).not.toBeNull();
  expect(errorBox!.y).toBeGreaterThan(100); // Not at very top of page
});
```

### D7: Loading States — No Blank Screens

Every page must show a loading state during data fetches, never a blank screen.

```typescript
// e2e/tests/design-loading.e2e.test.ts
test('dashboard shows loading skeleton before data loads', async ({ page }) => {
  // Slow down API responses
  await page.route('/api/**', route => {
    setTimeout(() => route.continue(), 1000);
  });

  await loginAs(page, 'STUDENT');
  await page.goto('/student');

  // Loading indicator visible immediately
  const skeleton = page.locator('[data-testid="loading-skeleton"], .skeleton, .animate-pulse');
  await expect(skeleton.first()).toBeVisible();

  // After data loads, skeleton disappears
  await page.waitForResponse('/api/dashboard/student');
  await expect(skeleton.first()).not.toBeVisible({ timeout: 5000 });
});
```

### D8: Track Page State Machine (BUG-005 Prevention)

Track page must never show infinite spinner. All states must resolve.

```typescript
// e2e/tests/design-track-page.e2e.test.ts
test('valid tracking number shows result', async ({ page }) => {
  await page.goto('/track');
  await page.fill('[data-testid="tracking-input"]', 'BH-2026-0001');
  await page.fill('[data-testid="mobile-input"]', '+919876543210');
  await page.click('[data-testid="track-button"]');

  // Must resolve within 5 seconds (not infinite spinner)
  await expect(page.locator('[data-testid="track-result"], [data-testid="track-not-found"]'))
    .toBeVisible({ timeout: 5000 });
});

test('invalid tracking number shows not-found, not infinite spinner', async ({ page }) => {
  await page.goto('/track');
  await page.fill('[data-testid="tracking-input"]', 'INVALID-0000');
  await page.fill('[data-testid="mobile-input"]', '+919876543210');
  await page.click('[data-testid="track-button"]');

  // Must show not-found within 5 seconds
  await expect(page.locator('[data-testid="track-not-found"]'))
    .toBeVisible({ timeout: 5000 });

  // Spinner must NOT be visible
  await expect(page.locator('[data-testid="loading-spinner"]'))
    .not.toBeVisible();
});
```

### D9: Auth Flow — Login and Role Redirect

Each role logs in and lands on the correct dashboard.

```typescript
// e2e/tests/design-auth-flow.e2e.test.ts
const ROLE_DASHBOARDS = [
  { email: 'student@test.com', password: 'Test1234!', expectedUrl: '/student' },
  { email: 'super@test.com', password: 'Test1234!', expectedUrl: '/superintendent' },
  { email: 'trustee@test.com', password: 'Test1234!', expectedUrl: '/trustee' },
  { email: 'accounts@test.com', password: 'Test1234!', expectedUrl: '/accounts' },
  { email: 'parent@test.com', password: 'Test1234!', expectedUrl: '/parent' },
];

for (const { email, password, expectedUrl } of ROLE_DASHBOARDS) {
  test(`${email} redirects to ${expectedUrl}`, async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');

    await page.waitForURL(`**${expectedUrl}`, { timeout: 10000 });
    expect(page.url()).toContain(expectedUrl);
  });
}
```

### D10: Cross-Role Access Denied

Accessing another role's dashboard returns redirect or 403.

```typescript
// e2e/tests/design-role-enforcement.e2e.test.ts
const CROSS_ROLE_TESTS = [
  { loginAs: 'student@test.com', tryAccess: '/superintendent', expectRedirect: true },
  { loginAs: 'student@test.com', tryAccess: '/trustee', expectRedirect: true },
  { loginAs: 'super@test.com', tryAccess: '/student', expectRedirect: true },
  { loginAs: 'parent@test.com', tryAccess: '/accounts', expectRedirect: true },
];

for (const { loginAs: email, tryAccess, expectRedirect } of CROSS_ROLE_TESTS) {
  test(`${email} cannot access ${tryAccess}`, async ({ page }) => {
    await login(page, email, 'Test1234!');
    await page.goto(tryAccess);

    if (expectRedirect) {
      await page.waitForURL('**/login**', { timeout: 5000 });
      expect(page.url()).toContain('login');
    }
  });
}
```

### D11: Application Form Email Required (CHANGE-3)

Email field is always visible and mandatory on application form.

```typescript
// e2e/tests/design-application-form.e2e.test.ts
test('email field is visible and required on all verticals', async ({ page }) => {
  const verticals = ['boys-hostel', 'girls-ashram', 'dharamshala'];

  for (const v of verticals) {
    await page.goto(`/apply/${v}/contact`);
    const emailInput = page.locator('[data-testid="email-input"], input[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('required', '');
  }
});
```

### D12: Language Toggle Works (BUG-012 Prevention)

Switching language changes content without stale cache.

```typescript
// e2e/tests/design-i18n-toggle.e2e.test.ts
test('language toggle switches content to Hindi', async ({ page }) => {
  await page.goto('/');

  // Get English content
  const englishText = await page.locator('h1').first().textContent();

  // Click Hindi toggle
  await page.click('[data-testid="language-toggle"]');
  await page.waitForLoadState('networkidle');

  // Content must change (not same English text)
  const hindiText = await page.locator('h1').first().textContent();
  expect(hindiText).not.toBe(englishText);

  // Hindi characters present
  expect(hindiText).toMatch(/[\u0900-\u097F]/); // Devanagari range
});

test('language persists across navigation', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="language-toggle"]'); // Switch to Hindi
  await page.waitForLoadState('networkidle');

  // Navigate to another page
  await page.goto('/about');
  await page.waitForLoadState('networkidle');

  // Still Hindi
  const text = await page.locator('h1').first().textContent();
  expect(text).toMatch(/[\u0900-\u097F]/);
});
```

### D13: Visual Baseline Comparison

Every page must have baselines and must not regress.

```typescript
// e2e/tests/design-visual-regression.e2e.test.ts
test('dashboard matches visual baseline', async ({ page }) => {
  await loginAs(page, 'STUDENT');
  await page.goto('/student');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot('student-dashboard.png', {
    maxDiffPixelRatio: 0.01, // 1% tolerance
    fullPage: true,
  });
});
```

---

## Notification Rules for Design Violations

All design test failures trigger Slack notifications. These are **blocking** — the task/phase cannot advance.

| Test Failed | Notification |
|-------------|-------------|
| D1 (responsive) | `❌ *Design violation* — \`{page}\` overflows at {breakpoint}` |
| D2 (i18n) | `❌ *Design violation* — \`{file}:{line}\` hardcoded string: "{text}"` |
| D3 (dead links) | `❌ *Design violation* — broken link: \`{href}\` → {status}` |
| D4 (sidebar) | `❌ *Design violation* — sidebar link has /dashboard/ prefix: \`{href}\`` |
| D5 (empty state) | `❌ *Design violation* — \`{page}\` shows error instead of empty state` |
| D6 (form errors) | `❌ *Design violation* — \`{form}\` has no field-level validation errors` |
| D7 (loading) | `❌ *Design violation* — \`{page}\` shows blank screen during load` |
| D8 (track page) | `❌ *Design violation* — track page stuck in loading state (BUG-005)` |
| D9 (auth flow) | `❌ *Design violation* — \`{role}\` login does not redirect to \`{dashboard}\`` |
| D10 (role access) | `❌ *Design violation* — \`{role}\` can access \`{otherDashboard}\` (BUG-002)` |
| D11 (email req) | `❌ *Design violation* — email field not required on \`{vertical}\` (CHANGE-3)` |
| D12 (i18n toggle) | `❌ *Design violation* — language toggle does not switch content (BUG-012)` |
| D13 (visual) | `❌ *Design violation* — \`{page}\` visual regression detected (>{threshold}% diff)` |

### Phase Completion Gate — Design Checks

In addition to the standard phase gate (`typecheck → lint → unit → integration → build`), Phase 6+ must also pass:

```bash
# After standard phase:gate
bun run test:e2e -- --grep "design-"    # All D1-D13 tests
bun run test:unit -- --grep "i18n"      # T8 translation keys
bun run test:unit -- --grep "hardcoded" # D2 hardcoded strings scan
```

**All must pass. Zero tolerance for design violations after Phase 6.**
