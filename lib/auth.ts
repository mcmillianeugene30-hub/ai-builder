'use client'

import { supabaseBrowser } from './supabase-browser'

export async function signUp(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabaseBrowser.auth.signUp({ email, password })
  if (error) {
    return { error: error.message }
  }
  window.location.href = '/login?message=check_email'
  return { error: null }
}

export async function signIn(
  email: string,
  password: string
): Promise<{ error: string | null }> {
  const { error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    return { error: error.message }
  }
  window.location.href = '/dashboard'
  return { error: null }
}

export async function signOut(): Promise<void> {
  await supabaseBrowser.auth.signOut()
  window.location.href = '/login'
}
