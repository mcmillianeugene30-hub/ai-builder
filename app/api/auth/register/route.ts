import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { signUp } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    await signUp(email, password)
    return NextResponse.json({ success: true, message: 'check_email' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
