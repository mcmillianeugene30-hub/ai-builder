import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/auth/callback',
]

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/signout',
  '/api/auth/callback',
]

const PROTECTED_PATTERNS = [
  '/dashboard',
  '/projects',
  '/editor',
]

function decodeSupabaseJWT(token: string): { sub: string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return { sub: payload.sub, email: payload.email }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public pages — always allow
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  // Public API auth routes — always allow
  if (PUBLIC_API_PATHS.includes(pathname)) {
    return NextResponse.next()
  }

  const isProtected =
    PROTECTED_PATTERNS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/api/') ||
    pathname === '/'

  if (!isProtected) return NextResponse.next()

  // Read the access token cookie
  const accessToken = req.cookies.get('sb-access-token')?.value

  if (!accessToken) {
    // No token — redirect to login
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Decode JWT locally (no network call needed)
  const payload = decodeSupabaseJWT(accessToken)

  if (!payload?.sub) {
    // Invalid token — clear cookies and redirect
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete('sb-access-token')
    res.cookies.delete('sb-refresh-token')
    return res
  }

  // User is authenticated — set user header and continue
  const response = NextResponse.next()
  response.headers.set('x-user-id', payload.sub)
  if (payload.email) response.headers.set('x-user-email', payload.email)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
