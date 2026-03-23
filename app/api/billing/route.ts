import { NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getPlanConfig } from '@/lib/pricing'
import { AI_MODELS } from '@/lib/models'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createSupabaseServerClient()

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('billing_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const planConfig = sub ? getPlanConfig(sub.plan as 'starter' | 'pro' | 'premium' | 'enterprise') : null

  return NextResponse.json({
    data: {
      subscription: sub,
      transactions: transactions ?? [],
      planConfig,
      availableModels: AI_MODELS,
    },
  })
}
