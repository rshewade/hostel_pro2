/**
 * Auth test helpers — creates REAL Better Auth sessions for testing.
 * Used by API integration tests to test with actual auth middleware (not mocked).
 * Will be populated after Phase 2 (Auth) when Better Auth is configured.
 */

// Placeholder — implemented in Phase 2
export async function createTestSession(
  _role: string
): Promise<{ cookie: string; userId: string }> {
  throw new Error(
    'createTestSession not yet implemented — requires Phase 2 (Auth)'
  );
}

export async function getAuthCookie(_role: string): Promise<string> {
  const { cookie } = await createTestSession(_role);
  return cookie;
}
