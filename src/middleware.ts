import { NextRequest, NextResponse } from 'next/server';

export const PUBLIC_PATHS = [
  '/api/auth', '/api/otp', '/api/health',
  '/api/applications', '/api/applications/track',
  '/apply', '/track', '/login',
  '/', '/about', '/contact', '/faq', '/facilities',
  '/gallery', '/news', '/trustees', '/donations', '/dpdp-policy', '/admissions',
] as const;

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }
  if (isPublicPath(pathname)) return NextResponse.next();

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

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
