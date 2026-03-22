import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { AuthSession } from './middleware';

/**
 * Maps Better Auth session.user.id to the application's users.id.
 * EVERY service needing a user ID MUST call this.
 * NEVER use session.user.id directly. (Prevents BUG-018/019/020)
 */
export async function resolveUserId(session: AuthSession): Promise<string> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.betterAuthUserId, session.user.id));
  if (!user) {
    throw new NotFoundError('User profile not found for auth session.');
  }
  return user.id;
}

/**
 * Get full app user profile for a Better Auth session.
 */
export async function resolveUser(session: AuthSession) {
  const [user] = await db.select().from(users).where(eq(users.betterAuthUserId, session.user.id));
  if (!user) throw new NotFoundError('User profile not found for auth session.');
  return user;
}
