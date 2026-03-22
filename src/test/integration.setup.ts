import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test';

const testClient = postgres(TEST_DATABASE_URL, { max: 5 });
export const testDb = drizzle(testClient);

/**
 * Truncate all tables in the test database.
 * Call in beforeEach to ensure test isolation.
 */
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

/**
 * Close the test database connection.
 * Call in afterAll to prevent connection leaks.
 */
export async function closeDb() {
  await testClient.end();
}
