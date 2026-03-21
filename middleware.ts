import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  const PUBLIC_PATHS = ['/', '/login', '/register', '/auth/']
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/auth/'))
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/editor') || pathname.startsWith('/projects')

  // For now, let all requests through to see if the app loads
  const response = NextResponse.next()
  
  if (isProtected) {
    const supabaseCookie = request.cookies.getAll().find(c => c.name.includes('supabase'))
    if (!supabaseCookie) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
