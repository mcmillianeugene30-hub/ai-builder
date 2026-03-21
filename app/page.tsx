import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#fff',
      padding: '0 24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 560 }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 16,
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 32px',
          fontSize: 28,
          fontWeight: 700,
        }}>
          ⚡
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>
          AI App Builder
        </h1>
        <p style={{ fontSize: 18, color: '#a1a1aa', margin: '0 0 48px', lineHeight: 1.6 }}>
          Describe your app in plain English. AI generates the scaffold.
          Edit, preview, and deploy — all in your browser.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/register"
            style={{
              padding: '14px 32px',
              background: '#6366f1',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
            }}
          >
            Get Started
          </a>
          <a
            href="/login"
            style={{
              padding: '14px 32px',
              background: 'transparent',
              color: '#a1a1aa',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              border: '1px solid #3f3f46',
            }}
          >
            Sign In
          </a>
        </div>
      </div>
    </main>
  )
}
