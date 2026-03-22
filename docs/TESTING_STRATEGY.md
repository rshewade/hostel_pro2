# Testing Strategy — Hostel Pro

## Testing Pyramid

```
        ╱  Visual  ╲           Playwright CLI screenshots
       ╱  (Layer 4)  ╲         Cross-browser, responsive, baseline comparison
      ──────────────────
      ╱    E2E Tests    ╲      Playwright Test (browser automation)
     ╱    (Layer 3)      ╲     Critical user flows, multi-page journeys
    ──────────────────────
    ╱  Integration Tests   ╲   Vitest + real PostgreSQL
   ╱      (Layer 2)         ╲  API routes, service→DB, auth flows
  ──────────────────────────
  ╱      Unit Tests           ╲  Vitest + jsdom (frontend) / node (backend)
 ╱        (Layer 1)            ╲ Services, utils, Zod schemas, components
─────────────────────────────────
```

| Layer | Tool | Runs Against | Speed | Count Target |
|-------|------|-------------|-------|-------------|
| 1 — Unit | Vitest | In-memory / jsdom | Fast (<5s total) | ~500+ |
| 2 — Integration | Vitest | Real PostgreSQL | Medium (~30s) | ~100+ |
| 3 — E2E | Playwright Test | Dev server + browser | Slow (~2min) | ~30-50 |
| 4 — Visual | Playwright CLI | Dev server + browser | Slow (~1min) | Per-page baselines |

---

## Layer 1: Unit Tests

### What to test
- **Service functions**: Business logic in isolation (mock DB at this layer only for pure logic tests)
- **Zod schemas**: Validation accepts/rejects correctly
- **Utility functions**: Crypto helpers, date formatting, URL signing, receipt generation
- **React components**: Rendering, props, user interactions, conditional display
- **Auth helpers**: Role checks, permission logic

### Tools
- **Vitest** — test runner
- **@testing-library/react** + **@testing-library/user-event** — component tests
- **jsdom** — browser environment for component tests

### File structure & naming
```
src/
├── lib/
│   ├── services/
│   │   ├── users.ts
│   │   └── __tests__/
│   │       └── users.unit.test.ts        ← unit tests (logic only, DB mocked)
│   ├── auth/
│   │   └── __tests__/
│   │       └── rbac.unit.test.ts
│   └── storage/
│       └── __tests__/
│           └── signed-urls.unit.test.ts
├── components/
│   ├── ApplicationCard.tsx
│   └── __tests__/
│       └── ApplicationCard.test.tsx      ← component tests
└── types/
    └── __tests__/
        └── schemas.unit.test.ts          ← Zod schema tests
```

### Naming convention
- `*.unit.test.ts` — unit tests (no DB, no network)
- `*.test.tsx` — component tests (jsdom)

### Example: Zod schema test
```typescript
import { describe, it, expect } from 'vitest';
import { createApplicationSchema } from '@/lib/services/applications';

describe('createApplicationSchema', () => {
  it('accepts valid input', () => {
    expect(createApplicationSchema.safeParse({
      fullName: 'John Doe',
      phone: '+919876543210',
      course: 'B.Tech',
    }).success).toBe(true);
  });

  it('rejects missing fullName', () => {
    expect(createApplicationSchema.safeParse({
      phone: '+919876543210',
    }).success).toBe(false);
  });

  it('rejects invalid phone format', () => {
    expect(createApplicationSchema.safeParse({
      fullName: 'John',
      phone: '123',
    }).success).toBe(false);
  });
});
```

### Example: Component test
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationCard } from '@/components/ApplicationCard';

describe('ApplicationCard', () => {
  const mockApp = {
    id: '1',
    fullName: 'John Doe',
    status: 'pending',
    trackingNumber: 'HP-2026-001',
  };

  it('renders application details', () => {
    render(<ApplicationCard application={mockApp} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('HP-2026-001')).toBeInTheDocument();
  });

  it('shows status badge', () => {
    render(<ApplicationCard application={mockApp} />);
    expect(screen.getByText('pending')).toBeInTheDocument();
  });
});
```

---

## Layer 2: Integration Tests

### What to test
- **Service functions → real DB**: CRUD operations, query correctness, constraint enforcement
- **API routes end-to-end**: HTTP request → route handler → service → DB → HTTP response
- **Auth flows**: Session creation, OTP verify, role-based access
- **Status transitions**: Application lifecycle, payment states, leave approvals
- **Triggers**: `updated_at` auto-update, status transition validation, room occupancy

### Tools
- **Vitest** — test runner
- **Real PostgreSQL** — same instance, separate `hostel_pro2_test` database
- **Drizzle** — schema push to test DB before suite runs

### Database strategy

**Use a dedicated test database** — never mock the DB for integration tests.

```
Production DB:  hostel_pro2        (port 5432)
Test DB:        hostel_pro2_test   (port 5432, same server)
```

Setup:
```typescript
// src/test/setup.ts
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const TEST_DATABASE_URL = 'postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test';

// Create test DB connection
export const testDb = drizzle(postgres(TEST_DATABASE_URL));

// Global setup — run once before all tests
export async function setup() {
  // Push schema to test DB
  // (handled by drizzle-kit push with test DATABASE_URL)
}

// Per-test cleanup — truncate all tables
export async function cleanDb() {
  await testDb.execute(sql`
    DO $$ DECLARE
      r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
}
```

### File structure & naming
```
src/
├── lib/services/
│   └── __tests__/
│       ├── users.unit.test.ts            ← Layer 1 (logic only)
│       └── users.integration.test.ts     ← Layer 2 (real DB)
├── app/api/
│   └── __tests__/
│       ├── users.api.test.ts             ← API route tests
│       ├── applications.api.test.ts
│       ├── payments.api.test.ts
│       └── auth.api.test.ts
└── test/
    ├── setup.ts                          ← DB connection, global setup
    ├── cleanup.ts                        ← Table truncation
    ├── fixtures.ts                       ← Factory functions for test data
    └── helpers.ts                        ← Auth helpers, request builders
```

### Naming convention
- `*.integration.test.ts` — service + DB tests
- `*.api.test.ts` — API route integration tests

### Test data factories
```typescript
// src/test/fixtures.ts
import { db } from '@/test/setup';
import { users, applications } from '@/lib/db/schema';

export async function createTestUser(overrides = {}) {
  const [user] = await db.insert(users).values({
    fullName: 'Test User',
    phone: '+919876543210',
    role: 'student',
    vertical: 'boys',
    authUserId: crypto.randomUUID(),
    ...overrides,
  }).returning();
  return user;
}

export async function createTestApplication(userId: string, overrides = {}) {
  const [app] = await db.insert(applications).values({
    userId,
    trackingNumber: `HP-TEST-${Date.now()}`,
    status: 'draft',
    academicYear: '2026-27',
    ...overrides,
  }).returning();
  return app;
}
```

### Example: Service integration test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { testDb, cleanDb } from '@/test/setup';
import { createTestUser } from '@/test/fixtures';
import { findById, updateRole } from '@/lib/services/users';
import { NotFoundError, ForbiddenError } from '@/lib/errors';

describe('UsersService (integration)', () => {
  beforeEach(async () => { await cleanDb(); });

  it('finds a user by id', async () => {
    const user = await createTestUser({ fullName: 'Alice' });
    const found = await findById(user.id);
    expect(found.fullName).toBe('Alice');
  });

  it('throws NotFoundError for missing user', async () => {
    await expect(findById(crypto.randomUUID()))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('prevents students from changing their own role', async () => {
    const student = await createTestUser({ role: 'student' });
    await expect(updateRole(student.id, 'superintendent', { actorRole: 'student' }))
      .rejects.toBeInstanceOf(ForbiddenError);
  });
});
```

### Example: API route test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { cleanDb } from '@/test/setup';
import { createTestUser } from '@/test/fixtures';
import { getTestSessionCookie } from '@/test/helpers';

const BASE = 'http://localhost:3000';

describe('GET /api/applications', () => {
  beforeEach(async () => { await cleanDb(); });

  it('returns 401 without auth', async () => {
    const res = await fetch(`${BASE}/api/applications`);
    expect(res.status).toBe(401);
  });

  it('returns only own applications for student', async () => {
    const student = await createTestUser({ role: 'student' });
    const cookie = await getTestSessionCookie(student);

    const res = await fetch(`${BASE}/api/applications`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.every((a: any) => a.userId === student.id)).toBe(true);
  });

  it('returns all applications for superintendent', async () => {
    const super_ = await createTestUser({ role: 'superintendent' });
    const cookie = await getTestSessionCookie(super_);

    const res = await fetch(`${BASE}/api/applications`, {
      headers: { Cookie: cookie },
    });
    expect(res.status).toBe(200);
  });
});
```

---

## Layer 3: E2E Tests (Playwright Test)

### What to test
- **Critical user journeys** — the flows that, if broken, mean the app is unusable
- **Multi-step flows** — login → navigate → fill form → submit → verify
- **Cross-role flows** — student submits, superintendent reviews, trustee approves

### Critical flows to cover

| # | Flow | Steps | Roles |
|---|------|-------|-------|
| 1 | **Login/OTP** | Enter phone → receive OTP → verify → land on dashboard | All |
| 2 | **Application submission** | Login → new application → fill form → upload docs → submit | Student |
| 3 | **Application review** | Login → view pending → review → approve/reject | Superintendent |
| 4 | **Room allocation** | Login → select student → assign room → verify occupancy | Superintendent |
| 5 | **Fee payment** | Login → view fees → pay via Razorpay → verify receipt | Student |
| 6 | **Leave request** | Login → request leave → approve → check calendar | Student + Super |
| 7 | **Document management** | Upload → view → download via signed URL → bulk download | Student + Super |
| 8 | **Dashboard data** | Login as each role → verify dashboard shows correct data | All roles |
| 9 | **Parent portal** | Login as parent → view child's status, fees, leave | Parent |
| 10 | **Trustee oversight** | Login → view reports → audit trail | Trustee |

### Tools
- **Playwright Test** (`@playwright/test`) — browser automation
- **3 browsers**: Chromium, Firefox, WebKit
- **Config**: `playwright.config.ts`

### File structure
```
e2e/
├── playwright.config.ts
├── fixtures/
│   ├── auth.fixture.ts              ← Login helpers, session setup
│   └── data.fixture.ts              ← Seed test data via API
├── pages/                            ← Page Object Model
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── applications.page.ts
│   ├── rooms.page.ts
│   ├── fees.page.ts
│   └── leaves.page.ts
├── tests/
│   ├── auth.e2e.test.ts
│   ├── application-flow.e2e.test.ts
│   ├── payment-flow.e2e.test.ts
│   ├── room-allocation.e2e.test.ts
│   ├── leave-flow.e2e.test.ts
│   ├── document-management.e2e.test.ts
│   └── dashboard.e2e.test.ts
└── global-setup.ts                   ← Start dev server, seed DB
```

### Naming convention
- `*.e2e.test.ts` — E2E tests (Playwright Test)

### Page Object Model pattern
```typescript
// e2e/pages/login.page.ts
import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async enterPhone(phone: string) {
    await this.page.fill('[data-testid="phone-input"]', phone);
    await this.page.click('[data-testid="send-otp"]');
  }

  async enterOtp(otp: string) {
    await this.page.fill('[data-testid="otp-input"]', otp);
    await this.page.click('[data-testid="verify-otp"]');
  }

  async expectDashboard() {
    await expect(this.page).toHaveURL(/dashboard/);
  }
}
```

### Example: E2E test
```typescript
// e2e/tests/application-flow.e2e.test.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ApplicationsPage } from '../pages/applications.page';

test.describe('Application Submission Flow', () => {
  test('student submits a new application', async ({ page }) => {
    // Login as student
    const login = new LoginPage(page);
    await login.goto();
    await login.enterPhone('+919876543210');
    await login.enterOtp('123456'); // Test OTP
    await login.expectDashboard();

    // Navigate to applications
    const apps = new ApplicationsPage(page);
    await apps.goto();
    await apps.clickNewApplication();

    // Fill form
    await apps.fillPersonalDetails({
      fullName: 'Test Student',
      course: 'B.Tech',
      year: '2nd',
    });
    await apps.uploadDocument('aadhar', 'test-fixtures/aadhar.pdf');
    await apps.submit();

    // Verify
    await expect(apps.successMessage).toBeVisible();
    await expect(apps.trackingNumber).toHaveText(/HP-2026-/);
  });
});
```

---

## Layer 4: Visual Testing (Playwright CLI)

### What to test
- **Every page at 3 breakpoints** — desktop (1280x720), tablet (768x1024), mobile (375x812)
- **Dark mode** — all pages
- **Cross-browser** — critical pages in Chromium, Firefox, WebKit
- **Baseline comparison** — detect visual regressions after changes

### Managed by
- **`/visual-test` skill** + **`visual-tester` agent**
- Uses `bunx playwright screenshot` CLI (not Playwright Test)

### Baseline workflow
```
1. Build a page → run `/visual-test responsive <page>`
2. Review screenshots → approve as baseline
3. After changes → run `/visual-test compare <page>`
4. Review diff → update baseline or fix regression
```

### Output structure
```
.visual-tests/
├── baselines/            ← Approved reference screenshots (committed to git)
│   ├── dashboard-student-desktop.png
│   ├── dashboard-student-tablet.png
│   └── dashboard-student-mobile.png
├── screenshots/          ← Current captures (gitignored)
├── cross-browser/        ← Browser comparison (gitignored)
└── pdfs/                 ← PDF exports (gitignored)
```

---

## Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    // Default: unit + component tests (fast)
    include: ['src/**/*.unit.test.ts', 'src/**/*.test.tsx'],

    environment: 'jsdom',
    setupFiles: ['./src/test/vitest.setup.ts'],
    globals: true,

    // Integration tests run separately
    // bun run test:integration
    // Uses: src/**/*.integration.test.ts, src/**/*.api.test.ts
  },
});
```

```typescript
// vitest.integration.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  test: {
    include: ['src/**/*.integration.test.ts', 'src/**/*.api.test.ts'],
    environment: 'node',
    setupFiles: ['./src/test/integration.setup.ts'],
    globals: true,
    pool: 'forks',          // Isolate tests that share DB
    poolOptions: {
      forks: { singleFork: true },  // Sequential to avoid DB conflicts
    },
  },
});
```

---

## Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,           // Sequential — shared DB state
  retries: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['iPhone 14'] } },
  ],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});
```

---

## NPM Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:integration": "vitest run --config vitest.integration.config.ts",
    "test:e2e": "bunx playwright test",
    "test:e2e:ui": "bunx playwright test --ui",
    "test:visual": "echo 'Use /visual-test skill or visual-tester agent'",
    "test:all": "bun run test:unit && bun run test:integration && bun run test:e2e",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## When to Write Tests

### During Migration (Phase-by-Phase)

| Phase | Tests to Write | Layer |
|-------|---------------|-------|
| Phase 1 — Schema | Schema verification tests (tables, columns, constraints, triggers) | Integration |
| Phase 2 — Auth | OTP send/verify, session management, RBAC checks | Unit + Integration |
| Phase 3 — Services | Unit test per service function + integration test per service | Unit + Integration |
| Phase 4 — Storage | Upload, download, delete, signed URL generation/verification | Unit + Integration |
| Phase 5 — API Routes | One `*.api.test.ts` per route group (auth, 401, 403, happy path) | Integration |
| Phase 6 — Frontend | Component tests for migrated components + visual baselines | Unit + Visual |
| Phase 6A — i18n | Translation completeness, locale switching, both-language rendering | Unit + E2E + Visual |
| Phase 8 — Testing | E2E tests for critical flows, gap filling | E2E |

### Rule: No Phase Merges Without Tests

Every phase must include its tests before being considered complete:
- **Services**: At minimum, 1 unit test per exported function + 1 integration test per CRUD operation
- **API routes**: At minimum, test auth (401), authorization (403), and happy path (200)
- **Components**: At minimum, render test + key interaction test
- **i18n**: Every page renders without missing keys in both `en` and `hi`; language toggle works; visual baselines in both locales
- **After Phase 6/6A**: Visual baselines for all pages in both languages

---

## Agent Responsibilities

| Agent | Test Responsibility |
|-------|-------------------|
| **backend-dev** | Writes unit + integration tests alongside services and API routes |
| **frontend-dev** | Writes component tests alongside components, requests visual tests |
| **qa-tester** | Reviews test coverage, fills gaps, writes E2E tests, runs full suite |
| **visual-tester** | Captures visual baselines, runs regression comparisons |
| **architect** | Reviews test strategy, ensures coverage standards are met |
| **devops** | Sets up test DB, CI pipeline for running all test layers |

---

## CI Pipeline Order

```
1. Lint                          (bun run lint)
2. Type Check                    (bun run typecheck)
3. Unit Tests                    (bun run test:unit)
4. Integration Tests             (bun run test:integration)
     └─ requires: test DB setup
5. Build                         (bun run build)
6. E2E Tests                     (bun run test:e2e)
     └─ requires: built app + test DB
7. Visual Regression (optional)  (manual via /visual-test compare)
```

**CI fails on**: lint errors, type errors, any test failure.
**CI warns on**: coverage drop below threshold.

---

## Coverage Targets

| Layer | Target | Enforcement |
|-------|--------|------------|
| Unit (services) | 80% line coverage | CI warning below threshold |
| Unit (components) | 70% line coverage | CI warning |
| Integration (API) | Every route has auth + happy path test | Review checklist |
| E2E | All 10 critical flows | Review checklist |
| Visual | Baseline for every page | Review checklist |

Coverage is a guide, not a gate — meaningful tests matter more than hitting a number.
