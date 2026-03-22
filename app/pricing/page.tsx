import Link from 'next/link'
import { getUser } from '@/lib/get-user'
import { getSubscription } from '@/lib/billing'
import { PLAN_PRICES, PLAN_DESCRIPTIONS, PLAN_FEATURES, PAY_AS_YOU_GO } from '@/lib/pricing'
import type { PlanName } from '@/lib/types'

const PLAN_ORDER: PlanName[] = ['starter', 'pro', 'premium', 'enterprise']

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function PlanFeaturesList({ plan }: { plan: PlanName }) {
  const f = PLAN_FEATURES[plan]
  const items = [
    f.maxProjects === -1 ? 'Unlimited projects' : `${f.maxProjects} projects`,
    f.maxUsers === -1 ? 'Unlimited team members' : `${f.maxUsers} team member${f.maxUsers !== 1 ? 's' : ''}`,
    f.maxDomains === -1
      ? 'Unlimited custom domains'
      : f.maxDomains === 0
      ? 'No custom domains'
      : `${f.maxDomains} custom domain${f.maxDomains !== 1 ? 's' : ''}`,
    f.mobileBuilds ? 'Mobile builds included' : 'No mobile builds',
    f.prioritySupport ? 'Priority support' : 'Community support',
  ]

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', flex: 1 }}>
      {items.map((item) => (
        <li
          key={item}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 10,
            fontSize: '0.9rem',
            color: '#8b949e',
          }}
        >
          <span style={{ color: f.mobileBuilds || item.includes('domains') || item.includes('members') || item.includes('projects') ? '#34D399' : '#6b7280', fontSize: '1rem' }}>
            {item.startsWith('Unlimited') || item.includes('included') || (!item.includes('No') && !item.includes('Community')) ? '✓' : '✗'}
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

function PlanCard({
  plan,
  isCurrentPlan,
  userEmail,
}: {
  plan: PlanName
  isCurrentPlan: boolean
  userEmail: string | null
}) {
  const prices = PLAN_PRICES[plan]
  const isEnterprise = plan === 'enterprise'

  return (
    <div
      style={{
        border: isCurrentPlan ? '2px solid #6366f1' : '1px solid #30363d',
        borderRadius: 12,
        padding: '1.5rem',
        background: isCurrentPlan ? '#1e1f3d' : '#161b22',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#6366f1',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '2px 12px',
            borderRadius: 12,
            whiteSpace: 'nowrap',
          }}
        >
          Current Plan
        </div>
      )}

      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isEnterprise ? '#fbbf24' : '#8b949e',
          }}
        >
          {plan}
        </span>
      </div>

      <div style={{ marginBottom: 4 }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, color: '#f0f6fc' }}>
          {formatPrice(prices.monthlyInCents)}
        </span>
        <span style={{ color: '#8b949e', fontSize: '0.9rem' }}>/mo</span>
      </div>

      {prices.annualInCents !== null && (
        <div style={{ fontSize: '0.85rem', color: '#34D399', marginBottom: 12 }}>
          {formatPrice(prices.annualInCents)}/yr — save 16%
        </div>
      )}

      <p style={{ fontSize: '0.875rem', color: '#8b949e', marginBottom: 8 }}>
        {PLAN_DESCRIPTIONS[plan]}
      </p>

      <PlanFeaturesList plan={plan} />

      {isEnterprise ? (
        <a
          href="mailto:support@ai-builder.com?subject=Enterprise Plan Inquiry"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.6rem',
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: 8,
            color: '#8b949e',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginTop: 'auto',
          }}
        >
          Contact Us
        </a>
      ) : isCurrentPlan ? (
        <Link
          href="/billing"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.6rem',
            background: '#30363d',
            border: 'none',
            borderRadius: 8,
            color: '#c9d1d9',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginTop: 'auto',
          }}
        >
          Manage Plan
        </Link>
      ) : (
        <Link
          href={`/billing?plan=${plan}`}
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '0.6rem',
            background: '#6366f1',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            marginTop: 'auto',
          }}
        >
          Subscribe
        </Link>
      )}
    </div>
  )
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await searchParams
  const user = await getUser()

  let currentPlan: PlanName | null = null
  if (user) {
    const sub = await getSubscription(user.id)
    currentPlan = sub?.plan ?? null
  }

  const showBanner = reason === 'subscription_required'

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#010409',
        color: '#c9d1d9',
        padding: '0 1rem',
      }}
    >
      {/* Banner */}
      {showBanner && (
        <div
          style={{
            background: 'rgba(239,68,68,0.15)',
            borderBottom: '1px solid #ef4444',
            padding: '0.75rem 1rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#f87171',
          }}
        >
          A subscription is required to access the builder. Choose a plan below to get started.
        </div>
      )}

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: '0 auto', paddingTop: 64, paddingBottom: 48, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 800,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Simple, transparent pricing
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#8b949e', maxWidth: 600, margin: '0 auto' }}>
          Pay-as-you-go on top of your plan. No hidden fees. No free tier.
        </p>
      </div>

      {/* Plan cards */}
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          paddingBottom: 64,
        }}
      >
        {PLAN_ORDER.map((plan) => (
          <PlanCard
            key={plan}
            plan={plan}
            isCurrentPlan={currentPlan === plan}
            userEmail={user?.email ?? null}
          />
        ))}
      </div>

      {/* Pay-as-you-go section */}
      <div
        style={{
          maxWidth: 700,
          margin: '0 auto',
          paddingBottom: 80,
        }}
      >
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '0.5rem',
            color: '#f0f6fc',
          }}
        >
          Pay-as-you-go{' '}
          <span style={{ fontSize: '0.875rem', fontWeight: 400, color: '#8b949e' }}>
            — all plans
          </span>
        </h2>
        <p style={{ textAlign: 'center', color: '#8b949e', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Every request is charged on top of your subscription. No included allowances.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            {
              label: 'AI Generation',
              desc: 'OpenAI GPT-4o-mini per request',
              price: PAY_AS_YOU_GO.aiGeneration,
            },
            {
              label: 'Mobile Build',
              desc: 'CI/CD and artifact hosting',
              price: PAY_AS_YOU_GO.mobileBuild,
            },
            {
              label: 'Custom Domain',
              desc: 'Per domain per month',
              price: PAY_AS_YOU_GO.customDomain,
            },
          ].map(({ label, desc, price }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 1.25rem',
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#f0f6fc', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>{desc}</div>
              </div>
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#60a5fa',
                  fontFamily: 'monospace',
                }}
              >
                {price.display}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', paddingBottom: 32, fontSize: '0.8rem', color: '#484f58' }}>
        Questions? Email{' '}
        <a href="mailto:support@ai-builder.com" style={{ color: '#6366f1' }}>
          support@ai-builder.com
        </a>
      </div>
    </main>
  )
}
