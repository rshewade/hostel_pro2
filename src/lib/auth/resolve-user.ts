import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/lib/errors';
import type { AuthSession } from './middleware';

/**
 * Maps Better Auth session.user.id to the application's users.id.
 *
 * EVERY service that needs a user ID MUST call this function.
 * NEVER use session.user.id directly — it's the Better Auth UUID,
 * not the application user UUID. (Prevents BUG-018/019/020)
 */
export async function resolveUserId(session: AuthSession): Promise<string> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.betterAuthUserId, session.user.id));

  if (!user) {
    throw new NotFoundError(
      'User profile not found for auth session. The auth user may not have an app profile yet.'
    );
  }

  return user.id;
}

/**
 * Get the full app user profile for a Better Auth session.
 */
export async function resolveUser(session: AuthSession) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.betterAuthUserId, session.user.id));

  if (!user) {
    throw new NotFoundError('User profile not found for auth session.');
  }

  return user;
}
