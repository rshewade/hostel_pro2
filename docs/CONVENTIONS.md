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
