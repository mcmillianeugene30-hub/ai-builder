import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { reportMeteredUsage } from '@/lib/stripe-helpers'
import { getPlanConfig } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { tokensUsed, model } = body as { tokensUsed?: number; model?: string }

    const supabase = await createSupabaseServerClient()
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, plan, status')
      .eq('user_id', user.id)
      .single()

    if (!sub?.stripe_customer_id || sub.status !== 'active') {
      return NextResponse.json({ error: 'No active paid subscription' }, { status: 403 })
    }

    const planConfig = getPlanConfig(sub.plan as 'starter' | 'pro' | 'premium' | 'enterprise')
    const ratePerToken = planConfig.aiRatePerToken ?? 0

    if (ratePerToken > 0 && tokensUsed) {
      await reportMeteredUsage(sub.stripe_customer_id, tokensUsed)
    }

    return NextResponse.json({ success: true, tokensUsed: tokensUsed ?? 0 })
  } catch (err) {
    console.error('Metered billing error:', err)
    return NextResponse.json({ error: 'Failed to report usage' }, { status: 500 })
  }
}
