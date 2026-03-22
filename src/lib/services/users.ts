import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { CreateUserProfileInput, UpdateProfileInput } from '@/lib/validations/users';

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function getUserByAuthId(authUserId: string) {
  const [user] = await db.select().from(users).where(eq(users.betterAuthUserId, authUserId));
  return user || null;
}

export async function createUserProfile(data: CreateUserProfileInput) {
  const [user] = await db.insert(users).values({
    betterAuthUserId: data.betterAuthUserId,
    role: data.role,
    vertical: data.vertical,
    fullName: data.fullName,
    email: data.email,
    mobile: data.mobile,
    parentMobile: data.parentMobile,
  }).returning();
  return user;
}

export async function updateUserProfile(userId: string, updates: UpdateProfileInput) {
  const [user] = await db.update(users).set(updates).where(eq(users.id, userId)).returning();
  if (!user) throw new NotFoundError('User not found');
  return user;
}

export async function userExists(authUserId: string): Promise<boolean> {
  const [user] = await db.select({ id: users.id }).from(users).where(eq(users.betterAuthUserId, authUserId));
  return !!user;
}

export async function listUsers(options: { role?: string; vertical?: string; page?: number; limit?: number }) {
  const { page = 1, limit = 20 } = options;
  const conditions = [];
  if (options.role) conditions.push(eq(users.role, options.role as any));
  if (options.vertical) conditions.push(eq(users.vertical, options.vertical as any));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const data = await db.select().from(users).where(where).limit(limit).offset((page - 1) * limit);
  const [countResult] = await db.select({ count: sql<number>`count(*)` }).from(users).where(where);
  return { data, total: Number(countResult.count) };
}
