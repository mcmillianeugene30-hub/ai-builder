import { redirect } from 'next/navigation'
import { supabaseBrowser } from './supabase-browser'

export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabaseBrowser().auth.signUp({ email, password })
  if (error) {
    return { error: error.message }
  }
  redirect('/login?message=check_email')
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabaseBrowser().auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    return { error: error.message }
  }
  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  await supabaseBrowser().auth.signOut()
  redirect('/login')
}
