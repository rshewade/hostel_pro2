import { NextRequest, NextResponse } from 'next/server';

/**
 * PUBLIC_PATHS — Single source of truth for paths that skip auth.
 * RULE: If a path is listed here, the route handler MUST NOT call requireAuth().
 * This prevents BUG-001 (public endpoint requiring auth) and BUG-015/016 (middleware vs handler out of sync).
 */
export const PUBLIC_PATHS = [
  '/api/auth',
  '/api/otp',
  '/api/health',
  '/api/applications', // POST only (public form submission)
  '/api/applications/track',
  '/apply',
  '/track',
  '/login',
  '/',
  '/about',
  '/contact',
  '/faq',
  '/facilities',
  '/gallery',
  '/news',
  '/trustees',
  '/donations',
  '/dpdp-policy',
  '/admissions',
] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, _next internals, and API routes handled by their own auth
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public paths — no auth check needed
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Protected paths — check for session cookie
  const sessionToken =
    request.cookies.get('better-auth.session_token')?.value ||
    request.cookies.get('__Secure-better-auth.session_token')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
