import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { createCheckoutSession, type PlanName, type BillingCycle } from '@/lib/stripe-helpers'
import { isValidPlan } from '@/lib/pricing'

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { plan, billingCycle } = body as { plan: PlanName; billingCycle: BillingCycle }

    if (!plan || !isValidPlan(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }
    if (!billingCycle || !['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 })
    }

    const result = await createCheckoutSession({
      userId: user.id,
      email: user.email!,
      plan,
      billingCycle,
    })

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
