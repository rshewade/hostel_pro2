import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql, eq } from 'drizzle-orm';
import { users } from '@/lib/db/schema';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://db_user1:Raju987.@localhost:5432/hostel_pro2_test';
const testClient = postgres(TEST_DB_URL, { max: 3 });
const testDb = drizzle(testClient);

// Monkey-patch db for services
import * as dbModule from '@/lib/db';
Object.defineProperty(dbModule, 'db', { value: testDb, writable: true });

import { getUserById, createUserProfile, getUserByAuthId, userExists } from '../users';

async function cleanDb() {
  await testDb.execute(sql`TRUNCATE TABLE users CASCADE`);
}

describe('UsersService (integration)', () => {
  beforeEach(async () => { await cleanDb(); });
  afterAll(async () => { await testClient.end(); });

  it('creates a user and retrieves by ID', async () => {
    const user = await createUserProfile({
      betterAuthUserId: crypto.randomUUID(),
      role: 'STUDENT',
      vertical: 'BOYS',
      fullName: 'Test Student',
      mobile: '+919876543210',
    });

    expect(user).toHaveProperty('id');
    expect(user.fullName).toBe('Test Student');
    expect(user.role).toBe('STUDENT');

    // camelCase keys from Drizzle (T6 convention)
    expect(user).toHaveProperty('fullName');
    expect(user).toHaveProperty('createdAt');
    expect(user).not.toHaveProperty('full_name');
    expect(user).not.toHaveProperty('created_at');

    const found = await getUserById(user.id);
    expect(found.fullName).toBe('Test Student');
  });

  it('throws NotFoundError for missing user', async () => {
    await expect(getUserById(crypto.randomUUID())).rejects.toThrow('User not found');
  });

  it('getUserByAuthId returns null for missing auth ID', async () => {
    const result = await getUserByAuthId(crypto.randomUUID());
    expect(result).toBeNull();
  });

  it('userExists returns false then true', async () => {
    const authId = crypto.randomUUID();
    expect(await userExists(authId)).toBe(false);

    await createUserProfile({
      betterAuthUserId: authId, role: 'STUDENT', fullName: 'Test', mobile: '+910000000000',
    });
    expect(await userExists(authId)).toBe(true);
  });
});
