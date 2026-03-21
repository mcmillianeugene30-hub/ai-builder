import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

<<<<<<< HEAD
  return NextResponse.json({ success: true })
=======
  // Return JSON — client handles the redirect
  return NextResponse.json({ success: true, message: 'check_email' })
>>>>>>> 640877f (fix: resolve all 14 production issues)
}
