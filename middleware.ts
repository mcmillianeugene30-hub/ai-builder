import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protected routes that require authentication
  const isProtected = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/projects')

  // Auth routes that should redirect to dashboard if already logged in
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Read the Supabase auth cookie
  const supabaseAuthCookie = request.cookies.get('sb-access-token')?.value ??
    request.cookies.get('supabase-auth-token')?.value ??
    request.cookies.getAll()
      .find((c) => c.name.includes('supabase') && (c.name.includes('access') || c.name.includes('auth')))
      ?.value ?? null

  if (isProtected && !supabaseAuthCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && supabaseAuthCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
