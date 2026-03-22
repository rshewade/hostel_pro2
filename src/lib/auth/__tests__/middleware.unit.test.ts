import { describe, it, expect } from 'vitest';
import { requireRole } from '../middleware';
import { ForbiddenError } from '@/lib/errors';
import type { AuthSession } from '../middleware';

function makeSession(role: string): AuthSession {
  return {
    user: { id: 'auth-id-1', email: 'test@test.com', name: 'Test', role },
    session: { id: 'sess-1', userId: 'auth-id-1', expiresAt: new Date(Date.now() + 86400000) },
  };
}

describe('requireRole', () => {
  it('passes when user has allowed role', () => {
    const session = makeSession('STUDENT');
    expect(() => requireRole(session, ['STUDENT'])).not.toThrow();
  });

  it('passes when user role is one of multiple allowed', () => {
    const session = makeSession('TRUSTEE');
    expect(() => requireRole(session, ['SUPERINTENDENT', 'TRUSTEE'])).not.toThrow();
  });

  it('throws ForbiddenError when role is not allowed', () => {
    const session = makeSession('STUDENT');
    expect(() => requireRole(session, ['SUPERINTENDENT'])).toThrow(ForbiddenError);
  });

  it('throws ForbiddenError when role is undefined', () => {
    const session = makeSession('');
    (session.user as any).role = undefined;
    expect(() => requireRole(session, ['STUDENT'])).toThrow(ForbiddenError);
  });

  it('error message includes role name and required roles', () => {
    const session = makeSession('PARENT');
    try {
      requireRole(session, ['SUPERINTENDENT', 'TRUSTEE']);
    } catch (err) {
      expect(err).toBeInstanceOf(ForbiddenError);
      expect((err as ForbiddenError).message).toContain('PARENT');
      expect((err as ForbiddenError).message).toContain('SUPERINTENDENT');
    }
  });
});
