import Link from 'next/link'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d1117', color: '#c9d1d9' }}>
      <div style={{ maxWidth: 640, padding: '2rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, background: '#2563eb', borderRadius: 16, margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
          ⚡
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          AI App Builder
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#8b949e', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          Describe your app in plain English. AI generates a complete scaffold — code editor, preview, and one-click deploy to Vercel.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href="/register"
            style={{ padding: '0.75rem 2rem', background: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem' }}
          >
            Get started free
          </Link>
          <Link
            href="/login"
            style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#8b949e', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '1rem', border: '1px solid #30363d' }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
