import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (accessToken) {
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
    }

    // Fallback: try SSR client for browser-set cookies
    const { createSupabaseServerClient } = await import('./supabase-server')
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.auth.getUser()
    return data.user
  } catch {
    return null
  }
}
