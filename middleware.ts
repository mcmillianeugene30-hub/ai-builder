import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/editor') ||
    pathname.startsWith('/projects') ||
    pathname.startsWith('/api/') ||
    pathname === '/'

  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname.startsWith('/auth/')

  if (isProtected && !isAuthPage) {
    const user = await getUserFromRequest(req)
    if (!user) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = '/login'
      return NextResponse.redirect(loginUrl)
    }
  }

  if (isAuthPage) {
    const user = await getUserFromRequest(req)
    if (user) {
      const dashUrl = req.nextUrl.clone()
      dashUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
