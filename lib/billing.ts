import { createSupabaseServerClient } from './supabase-server'
import { PLAN_FEATURES, PAY_AS_YOU_GO } from './pricing'
import type {
  Subscription,
  BillingTransaction,
  BillingTransactionType,
  AccessCheckResult,
  PlanFeatures,
} from './types'

const ADMIN_EMAILS: string[] = (
  process.env.ADMIN_EMAILS ?? ''
)
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean)

export function isAdmin(email: string): boolean {
  if (ADMIN_EMAILS.length === 0) return false
  return ADMIN_EMAILS.some(
    (a) => a.toLowerCase() === email.toLowerCase()
  )
}

export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error || !data) return null
    return data as Subscription
  } catch {
    return null
  }
}

export async function hasActiveSubscription(
  userId: string
): Promise<boolean> {
  const sub = await getSubscription(userId)
  if (!sub) return false
  return sub.status === 'active' || sub.status === 'trialing'
}

export async function checkAccess(
  userId: string,
  email: string
): Promise<AccessCheckResult> {
  if (isAdmin(email)) {
    return {
      allowed: true,
      isAdmin: true,
      plan: null,
      amountCents: 0,
      reason: null,
    }
  }

  const sub = await getSubscription(userId)

  if (!sub || (sub.status !== 'active' && sub.status !== 'trialing')) {
    return {
      allowed: false,
      isAdmin: false,
      plan: null,
      amountCents: 0,
      reason: 'No active subscription. Please subscribe to continue.',
    }
  }

  return {
    allowed: true,
    isAdmin: false,
    plan: sub.plan,
    amountCents: PAY_AS_YOU_GO.aiGeneration.cents,
    reason: null,
  }
}

export async function checkFeatureAccess(
  userId: string,
  email: string,
  feature: keyof PlanFeatures
): Promise<AccessCheckResult> {
  if (isAdmin(email)) {
    return { allowed: true, isAdmin: true, plan: null, amountCents: 0, reason: null }
  }

  const sub = await getSubscription(userId)

  if (!sub || (sub.status !== 'active' && sub.status !== 'trialing')) {
    return {
      allowed: false,
      isAdmin: false,
      plan: null,
      amountCents: 0,
      reason: 'No active subscription.',
    }
  }

  const features = PLAN_FEATURES[sub.plan]
  const value = features[feature]

  if (typeof value === 'boolean' && !value) {
    return {
      allowed: false,
      isAdmin: false,
      plan: sub.plan,
      amountCents: 0,
      reason: `Your ${sub.plan} plan does not include ${feature}. Upgrade to access this feature.`,
    }
  }

  return {
    allowed: true,
    isAdmin: false,
    plan: sub.plan,
    amountCents: 0,
    reason: null,
  }
}

export async function recordCharge(params: {
  userId: string
  type: BillingTransactionType
  amountCents: number
  description: string
  referenceId?: string
  stripePaymentIntentId?: string
}): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase
      .from('billing_transactions')
      .insert({
        user_id: params.userId,
        type: params.type,
        amount_cents: params.amountCents,
        description: params.description,
        reference_id: params.referenceId ?? null,
        stripe_payment_intent_id: params.stripePaymentIntentId ?? null,
      })

    if (error) {
      console.error('recordCharge failed:', error)
    }
  } catch (err) {
    console.error('recordCharge error:', err)
  }
}

export async function listTransactions(
  userId: string,
  limit = 20
): Promise<BillingTransaction[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data as BillingTransaction[]
  } catch {
    return []
  }
}
