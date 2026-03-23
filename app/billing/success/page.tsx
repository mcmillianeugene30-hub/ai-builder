import Link from 'next/link'

export default function BillingSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
      color: '#c9d1d9',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        background: 'rgba(52, 211, 153, 0.15)',
        border: '3px solid #34D399',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2rem',
        margin: '0 auto 2rem',
      }}>
        ✓
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f0f6fc', marginBottom: '1rem' }}>
        Subscription Activated!
      </h1>

      <p style={{ fontSize: '1.1rem', color: '#8b949e', maxWidth: 480, marginBottom: '2.5rem', lineHeight: 1.6 }}>
        Your plan is now active. You have full access to all features.
        A receipt has been sent to your email.
      </p>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link
          href="/dashboard"
          style={{ padding: '0.75rem 2rem', background: '#6366f1', color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
        >
          Go to Dashboard
        </Link>
        <Link
          href="/billing"
          style={{ padding: '0.75rem 2rem', background: 'transparent', color: '#8b949e', borderRadius: 8, textDecoration: 'none', border: '1px solid #30363d', fontWeight: 600 }}
        >
          View Billing
        </Link>
      </div>
    </main>
  )
}
