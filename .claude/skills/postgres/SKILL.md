---
name: pg
description: Manage PostgreSQL database for hostel_pro2 — run queries, manage schema, create/drop databases, inspect tables, debug data issues
user-invocable: true
---

# PostgreSQL Management Skill

Manage the hostel_pro2 PostgreSQL database running in a Docker container.

## Connection Details

- **Container**: `accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6`
- **PostgreSQL Version**: 18
- **Host** (from host machine): `localhost:5432`
- **User**: `db_user1`
- **Password**: `Raju987.`
- **Database**: `hostel_pro2`
- **DATABASE_URL**: `postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2`

## How to Run Commands

There is no `psql` installed on the host. Always use `docker exec`:

```bash
docker exec accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d hostel_pro2 -c "<SQL>"
```

For multi-line SQL or scripts, use a heredoc:

```bash
docker exec -i accounts-automation-aadb-euaozw.1.ipljay5ckkzaqt5eapiaruru6 psql -U db_user1 -d hostel_pro2 <<'SQL'
SELECT * FROM users LIMIT 5;
SQL
```

## Available Operations

When the user invokes `/pg`, determine what they need from their message and execute accordingly:

### Query & Inspect
- **`/pg tables`** — List all tables with row counts
- **`/pg describe <table>`** — Show column names, types, constraints, indexes
- **`/pg query <SQL>`** — Run arbitrary SELECT query
- **`/pg enums`** — List all custom enum types and their values
- **`/pg indexes <table>`** — Show indexes on a table
- **`/pg relations`** — Show foreign key relationships between tables
- **`/pg size`** — Show database and table sizes

### Schema Management
- **`/pg migrate <file>`** — Run a SQL migration file against the database
- **`/pg dump-schema`** — Dump the current schema (no data) to stdout
- **`/pg triggers`** — List all triggers and their functions

### Data Operations
- **`/pg count <table>`** — Count rows in a table
- **`/pg sample <table>`** — Show 5 sample rows from a table
- **`/pg truncate <table>`** — Truncate a table (ask for confirmation first)

### Database Admin
- **`/pg databases`** — List all databases on the server
- **`/pg connections`** — Show active connections
- **`/pg status`** — Check if PostgreSQL is reachable and show version

### Drizzle Integration
- **`/pg drizzle-push`** — Run `bunx drizzle-kit push` to sync Drizzle schema to database
- **`/pg drizzle-generate`** — Run `bunx drizzle-kit generate` to create migration files
- **`/pg drizzle-studio`** — Launch Drizzle Studio for visual database management

## Implementation Notes

1. **Always use the `hostel_pro2` database** unless the user explicitly asks about another database.
2. **For destructive operations** (DROP, TRUNCATE, DELETE without WHERE, ALTER TABLE DROP COLUMN), always confirm with the user before executing.
3. **Format output nicely** — use `\x` (expanded display) for wide tables, or parse and present as markdown tables for readability.
4. **If no arguments are given** (`/pg` alone), show database status: version, table count, database size.
5. **For Drizzle commands**, run them from the project directory `/mnt/data/projects/devbox/hostel_pro2/`.

## Common Queries Reference

```sql
-- List all tables with row counts
SELECT schemaname, tablename,
  (SELECT count(*) FROM information_schema.columns c WHERE c.table_name = t.tablename) as columns
FROM pg_catalog.pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all enums
SELECT t.typname AS enum_name, array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
GROUP BY t.typname ORDER BY t.typname;

-- List all foreign keys
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';

-- List all triggers
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers WHERE trigger_schema = 'public';

-- Database size
SELECT pg_size_pretty(pg_database_size('hostel_pro2'));
```
