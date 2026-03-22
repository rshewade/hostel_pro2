---
name: testdb
description: Manage the hostel_pro2_test database — create, reset, push schema, apply triggers, seed fixtures, truncate, drop, and check status
user-invocable: true
---

# Test Database Management Skill

Manage the `hostel_pro2_test` database used for integration and API route tests.

## Connection Details

- **Container**: `accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6`
- **Host**: `localhost:5432`
- **Database**: `hostel_pro2_test`
- **User**: `db_user1`
- **Password**: `Raju987.`
- **TEST_DATABASE_URL**: `postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test`

## How to Run Commands

```bash
# SQL commands
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d hostel_pro2_test -c "<SQL>"

# Multi-line SQL
docker exec -i accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d hostel_pro2_test <<'SQL'
<statements>
SQL

# Commands against the server (not a specific DB) — use postgres database
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d postgres -c "<SQL>"
```

## Available Operations

When the user invokes `/testdb`, determine what they need:

### Setup & Lifecycle
- **`/testdb create`** — Create the `hostel_pro2_test` database if it doesn't exist
- **`/testdb drop`** — Drop the test database (ask for confirmation)
- **`/testdb recreate`** — Drop + create + push schema + apply triggers (full reset)
- **`/testdb status`** — Check if test DB exists, show table count, row counts

### Schema Management
- **`/testdb push`** — Push Drizzle schema to test database
- **`/testdb triggers`** — Apply custom triggers from `drizzle/custom/triggers.sql`
- **`/testdb diff`** — Compare test DB schema against main `hostel_pro2` schema

### Data Management
- **`/testdb truncate`** — Truncate all tables (preserving schema)
- **`/testdb seed`** — Run test fixture seeding (insert baseline test data)
- **`/testdb sample <table>`** — Show sample rows from a table in test DB
- **`/testdb count`** — Show row counts for all tables

### Inspection
- **`/testdb tables`** — List all tables in test DB
- **`/testdb describe <table>`** — Show columns, types, constraints
- **`/testdb query <SQL>`** — Run arbitrary query against test DB

## Implementation Details

### `/testdb create`
```bash
# Check if database exists
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'hostel_pro2_test'"

# Create if not exists
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d postgres -c "CREATE DATABASE hostel_pro2_test OWNER db_user1"
```

### `/testdb push`
Push Drizzle schema using the test database URL:
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && DATABASE_URL="postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test" bunx drizzle-kit push
```

### `/testdb triggers`
Apply custom triggers to test DB:
```bash
docker exec -i accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d hostel_pro2_test < /mnt/data/projects/devbox/hostel_pro2/drizzle/custom/triggers.sql
```

**Note**: If the triggers file doesn't exist yet (Phase 1 not complete), skip this step and inform the user.

### `/testdb truncate`
```sql
DO $$ DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
  END LOOP;
END $$;
```

### `/testdb recreate`
Run in sequence:
1. Drop database (if exists): `DROP DATABASE IF EXISTS hostel_pro2_test`
2. Create database: `CREATE DATABASE hostel_pro2_test OWNER db_user1`
3. Push Drizzle schema: `DATABASE_URL=...test bunx drizzle-kit push`
4. Apply triggers: pipe `triggers.sql` into psql
5. Report status

### `/testdb seed`
Run the test fixtures seeder if it exists:
```bash
cd /mnt/data/projects/devbox/hostel_pro2 && DATABASE_URL="postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test" bun run src/test/seed.ts
```

If `src/test/seed.ts` doesn't exist, inform the user it needs to be created.

### `/testdb diff`
Compare schemas between main and test DB:
```bash
# Dump both schemas (structure only)
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 pg_dump -U db_user1 -d hostel_pro2 --schema-only -s > /tmp/main_schema.sql
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 pg_dump -U db_user1 -d hostel_pro2_test --schema-only -s > /tmp/test_schema.sql
diff /tmp/main_schema.sql /tmp/test_schema.sql
```

### `/testdb status`
```sql
-- Check if DB exists
SELECT datname FROM pg_database WHERE datname = 'hostel_pro2_test';

-- If exists, show tables and row counts
SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

## Important Rules

1. **Never run against `hostel_pro2`** — all commands target `hostel_pro2_test` only
2. **Always use the test DATABASE_URL** when running Drizzle commands
3. **Truncate, not drop** for between-test cleanup — dropping recreates the whole DB which is slow
4. **`/testdb recreate`** is the nuclear option — use when schema has changed significantly
5. **If no arguments given** (`/testdb` alone), show status: DB exists? table count? row counts?
6. **For destructive operations** (drop, truncate), confirm with the user first
7. **All commands run from**: `/mnt/data/projects/devbox/hostel_pro2/`
