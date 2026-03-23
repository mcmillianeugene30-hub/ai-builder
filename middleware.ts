import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard', '/editor', '/projects', '/generate', '/billing'];
const PUBLIC_ROUTES = ['/', '/pricing', '/login', '/register', '/auth/callback'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('sb-access-token');
  const hasSession = !!sessionCookie?.value;
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim());
  const isAdmin = false; // determined server-side only

  // Admin always allowed
  // (In a real app, we'd check the user's email here via the session)

  // Public routes — always allow
  if (
    PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'))
  ) {
    if (
      hasSession &&
      (pathname === '/login' || pathname === '/register')
    ) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // API public routes
  if (
    pathname === '/api/models' ||
    pathname.startsWith('/api/stripe/webhook')
  ) {
    return NextResponse.next();
  }

  // Protected routes — require session
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
