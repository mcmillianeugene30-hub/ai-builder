'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Subscription, BillingTransaction } from '@/lib/types'

const PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  premium: 'Premium',
  enterprise: 'Enterprise',
}

const STATUS_COLORS: Record<string, string> = {
  active: '#34D399',
  trialing: '#FBBF24',
  past_due: '#EF4444',
  canceled: '#6B7280',
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BillingPage() {
  const router = useRouter()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [transactions, setTransactions] = useState<BillingTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [portalLoading, setPortalLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/billing').then((r) => r.json()),
    ])
      .then(([json]) => {
        if (json.data) {
          setSub(json.data.subscription)
          setTransactions(json.data.transactions ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function openPortal() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const json = await res.json()
      if (json.data?.url) {
        window.location.href = json.data.url
      }
    } finally {
      setPortalLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
        Loading billing information…
      </div>
    )
  }

  return (
    <main style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Billing</h1>
        <Link href="/pricing" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Change plan
        </Link>
      </div>

      {sub ? (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f0f6fc' }}>
                {PLAN_LABELS[sub.plan] ?? sub.plan} Plan
              </p>
              <p style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: 2 }}>
                {sub.billing_cycle === 'annual' ? 'Annual billing' : 'Monthly billing'}
              </p>
            </div>
            <span style={{
              padding: '4px 12px',
              borderRadius: 20,
              fontSize: '0.8rem',
              fontWeight: 600,
              background: STATUS_COLORS[sub.status] ?? '#6b7280',
              color: '#fff',
            }}>
              {sub.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {sub.current_period_end && (
            <p style={{ fontSize: '0.85rem', color: '#8b949e' }}>
              {sub.status === 'canceled'
                ? `Access until ${formatDate(sub.current_period_end)}`
                : `Renews ${formatDate(sub.current_period_end)}`}
            </p>
          )}

          <button
            onClick={openPortal}
            disabled={portalLoading}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.25rem',
              background: portalLoading ? '#30363d' : '#2d3748',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: portalLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
            }}
          >
            {portalLoading ? 'Opening portal…' : 'Manage Subscription'}
          </button>
        </div>
      ) : (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#8b949e', marginBottom: '1rem' }}>No active subscription</p>
          <Link
            href="/pricing"
            style={{ padding: '0.5rem 1.5rem', background: '#6366f1', color: '#fff', borderRadius: 6, textDecoration: 'none', fontSize: '0.9rem' }}
          >
            View Plans
          </Link>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: '#f0f6fc' }}>Transaction History</h2>
      {transactions.length === 0 ? (
        <p style={{ color: '#666', fontSize: '0.9rem' }}>No transactions yet.</p>
      ) : (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d' }}>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 500 }}>Date</th>
                <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 500 }}>Description</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 500 }}>Amount</th>
                <th style={{ textAlign: 'right', padding: '0.75rem 1rem', color: '#8b949e', fontSize: '0.8rem', fontWeight: 500 }}>Credits</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={{ padding: '0.75rem 1rem', color: '#8b949e', fontSize: '0.875rem' }}>{formatDate(t.created_at)}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#c9d1d9', fontSize: '0.875rem' }}>{t.description}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#c9d1d9', fontSize: '0.875rem', textAlign: 'right' }}>
                    {t.amount ? formatCurrency(t.amount) : '—'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#34D399', fontSize: '0.875rem', textAlign: 'right' }}>
                    {t.credits ? `+${t.credits}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
