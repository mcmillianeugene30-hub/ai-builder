import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isAdmin, hasActiveSubscription } from '@/lib/billing'

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/signout',
  '/api/auth/callback',
  '/api/billing',
  '/api/generate',
]

const PROTECTED_PATTERNS = [
  '/dashboard',
  '/projects',
  '/editor',
]

async function getUserFromRequest(req: NextRequest) {
  const accessToken = req.cookies.get('sb-access-token')?.value
  if (!accessToken) return null
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { cookie: `sb-access-token=${accessToken}` } },
        auth: { persistSession: false },
      }
    )
    const { data } = await supabase.auth.getUser()
    return data.user
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public API auth routes without session check
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow pricing and billing pages — users need to reach these to subscribe
  if (pathname === '/pricing' || pathname.startsWith('/billing')) {
    return NextResponse.next()
  }

  // Allow login, register, auth callback
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth/')

  if (isAuthPage) {
    return NextResponse.next()
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const user = await getUserFromRequest(req)

  // Not logged in — redirect to login
  if (!user) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Auth pages → redirect to dashboard if logged in
  if (isAuthPage && user) {
    const dashUrl = req.nextUrl.clone()
    dashUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashUrl)
  }

  // Check subscription for protected app routes
  const isProtected = PROTECTED_PATTERNS.some((p) =>
    pathname.startsWith(p)
  )

  if (isProtected) {
    const email = user.email ?? ''
    const admin = isAdmin(email)

    if (!admin) {
      const hasActive = await hasActiveSubscription(user.id)
      if (!hasActive) {
        const pricingUrl = req.nextUrl.clone()
        pricingUrl.pathname = '/pricing'
        pricingUrl.searchParams.set('reason', 'subscription_required')
        return NextResponse.redirect(pricingUrl)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
