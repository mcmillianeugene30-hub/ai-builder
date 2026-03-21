'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import type { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const supabase = getSupabaseBrowser()
        if (!supabase) {
          if (mounted) { setLoading(false) }
          return
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          if (mounted) {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
          }
        })

        return () => {
          subscription.unsubscribe()
        }
      } catch (err) {
        console.error('AuthProvider error:', err)
        if (mounted) setLoading(false)
      }
    }

    init()

    return () => { mounted = false }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
