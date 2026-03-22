import { headers } from 'next/headers';
import { cache } from 'react';
import { auth } from './index';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

type UserRole = 'STUDENT' | 'SUPERINTENDENT' | 'TRUSTEE' | 'ACCOUNTS' | 'PARENT';

export interface AuthSession {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role?: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  };
}

/**
 * Get the current session. Cached per-request via React cache()
 * to prevent duplicate DB queries in nested layouts (BUG-009 prevention).
 */
export const getSession = cache(async (): Promise<AuthSession | null> => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  return session as AuthSession | null;
});

/**
 * Require authentication. Throws UnauthorizedError if no session.
 * Use in API routes and server components for protected pages.
 */
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError('Authentication required');
  }
  return session;
}

/**
 * Require specific role(s). Throws ForbiddenError if user lacks the role.
 * Always call AFTER requireAuth().
 */
export function requireRole(session: AuthSession, allowedRoles: UserRole[]): void {
  const userRole = session.user.role as UserRole | undefined;
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new ForbiddenError(
      `Role '${userRole || 'unknown'}' is not authorized. Required: ${allowedRoles.join(', ')}`
    );
  }
}

/**
 * Check if the user has a staff role (superintendent, trustee, or accounts).
 */
export function isStaff(session: AuthSession): boolean {
  const role = session.user.role as UserRole | undefined;
  return role === 'SUPERINTENDENT' || role === 'TRUSTEE' || role === 'ACCOUNTS';
}

/**
 * Check if the user has an admin role (trustee or accounts).
 */
export function isAdmin(session: AuthSession): boolean {
  const role = session.user.role as UserRole | undefined;
  return role === 'TRUSTEE' || role === 'ACCOUNTS';
}
