import { createSupabaseServerClient } from './supabase-server'
import { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}
