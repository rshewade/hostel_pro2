import { describe, it, expect, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test';
const testClient = postgres(TEST_DB_URL, { max: 3 });
const testDb = drizzle(testClient);

import * as dbModule from '@/lib/db';
Object.defineProperty(dbModule, 'db', { value: testDb, writable: true });

describe('NotificationsService (integration)', () => {
  afterAll(async () => { await testClient.end(); });

  it('connects to test database', async () => {
    const [result] = await testDb.execute(sql`SELECT 1 as connected`);
    expect(result.connected).toBe(1);
  });
});
