import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { CreateUserProfileInput, UpdateProfileInput } from '@/lib/validations/users';

/**
 * Get user profile by app user ID.
 */
export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFoundError('User not found');
  return user;
}

/**
 * Get user profile by Better Auth user ID.
 */
export async function getUserByAuthId(authUserId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.betterAuthUserId, authUserId));
  return user || null;
}

/**
 * Create a new user profile in the app users table.
 */
export async function createUserProfile(data: CreateUserProfileInput) {
  const [user] = await db
    .insert(users)
    .values({
      betterAuthUserId: data.betterAuthUserId,
      role: data.role,
      vertical: data.vertical,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      parentMobile: data.parentMobile,
    })
    .returning();
  return user;
}

/**
 * Update user profile.
 */
export async function updateUserProfile(userId: string, updates: UpdateProfileInput) {
  const [user] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning();
  if (!user) throw new NotFoundError('User not found');
  return user;
}

/**
 * Check if a user profile exists for a Better Auth user ID.
 */
export async function userExists(authUserId: string): Promise<boolean> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.betterAuthUserId, authUserId));
  return !!user;
}

/**
 * List all users (for staff).
 */
export async function listUsers(options: {
  role?: string;
  vertical?: string;
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  let query = db.select().from(users);

  // Apply filters
  const conditions = [];
  if (options.role) {
    conditions.push(eq(users.role, options.role as any));
  }
  if (options.vertical) {
    conditions.push(eq(users.vertical, options.vertical as any));
  }

  if (conditions.length > 0) {
    const { and } = await import('drizzle-orm');
    query = query.where(and(...conditions)) as any;
  }

  const data = await (query as any).limit(limit).offset(offset);

  // Count total
  const { sql } = await import('drizzle-orm');
  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);
  const total = Number(countResult.count);

  return { data, total };
}
