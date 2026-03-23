import Stripe from 'stripe'
import { getPlanConfig } from './pricing'

export type PlanName = 'starter' | 'pro' | 'premium' | 'enterprise'
export type BillingCycle = 'monthly' | 'annual'

export type CheckoutSessionResult = {
  url: string
  sessionId: string
}

export function getStripe(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  })
}

export async function createCheckoutSession({
  userId,
  email,
  plan,
  billingCycle,
}: {
  userId: string
  email: string
  plan: PlanName
  billingCycle: BillingCycle
}): Promise<CheckoutSessionResult> {
  const stripe = getStripe()
  const planConfig = getPlanConfig(plan)
  const priceKey = billingCycle === 'monthly' ? 'monthly' : 'annual'
  const priceId = planConfig.stripePriceIds?.[priceKey] ?? null

  if (!priceId) {
    throw new Error(`No Stripe price ID for plan ${plan} / ${billingCycle}`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}&plan=${plan}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=1`,
    metadata: { userId, plan, billingCycle },
    subscription_data: {
      metadata: { userId, plan },
      trial_period_days: planConfig.trialDays ?? undefined,
    },
    allow_promotion_codes: true,
  })

  if (!session.url || !session.id) {
    throw new Error('Failed to create Stripe checkout session')
  }

  return { url: session.url, sessionId: session.id }
}

export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session.url
}

export async function reportMeteredUsage(
  customerId: string,
  quantity: number
): Promise<void> {
  const stripe = getStripe()
  await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: process.env.NEXT_PUBLIC_APP_URL!,
  })
  await stripe.customers.retrieve(customerId)
}

export async function cancelSubscription(
  subscriptionId: string
): Promise<void> {
  const stripe = getStripe()
  await stripe.subscriptions.cancel(subscriptionId)
}
