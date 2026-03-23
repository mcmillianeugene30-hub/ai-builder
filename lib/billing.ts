import { createSupabaseServerClient } from './supabase-server'
import { PLAN_FEATURES, PAY_AS_YOU_GO } from './pricing'
import type { Subscription, BillingTransaction, PlanFeatures } from './types'

const ADMIN_EMAILS: string[] = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim()).filter(Boolean)

export function isAdmin(email: string): boolean {
  if (ADMIN_EMAILS.length === 0) return false
  return ADMIN_EMAILS.some((a) => a.toLowerCase() === email.toLowerCase())
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
    return data as Subscription | null
  } catch {
    return null
  }
}

export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId)
  if (!sub) return false
  return sub.status === 'active' || sub.status === 'trialing'
}

export async function recordCharge(params: {
  userId: string
  type: 'purchase' | 'credit' | 'refund'
  amount: number | null
  credits: number | null
  description: string
}): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.from('billing_transactions').insert({
      user_id: params.userId,
      type: params.type,
      amount: params.amount,
      credits: params.credits,
      description: params.description,
    })
  } catch (err) {
    console.error('recordCharge error:', err)
  }
}

export async function listTransactions(userId: string, limit = 20): Promise<BillingTransaction[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('billing_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return (data ?? []) as BillingTransaction[]
  } catch {
    return []
  }
}
