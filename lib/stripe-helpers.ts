import { getStripe } from './stripe';
import { supabase } from './supabase-server';
import { PLAN_FEATURES, type PlanName } from './pricing';

export async function handleSubscriptionActivated(
  subscriptionId: string,
  customerId: string
): Promise<void> {
  const sub = await getStripe().subscriptions.retrieve(subscriptionId);
  const userId = sub.metadata?.user_id;
  if (!userId) {
    console.error('[stripe-helpers] No user_id in subscription metadata');
    return;
  }

  const priceId = sub.items.data[0]?.price.id;
  const plan = inferPlanFromPriceId(priceId);
  if (!plan) {
    console.error('[stripe-helpers] Unknown price ID:', priceId);
    return;
  }

  const billingCycle = sub.items.data[0]?.price.recurring?.interval === 'year' ? 'annual' : 'monthly';

  const { error } = await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan,
    billing_cycle: billingCycle,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    current_period_start: new Date((sub as any).current_period_start * 1000).toISOString(),
    current_period_end: new Date((sub as any).current_period_end * 1000).toISOString(),
    status: 'active',
  }, { onConflict: 'user_id' });

  if (error) {
    console.error('[stripe-helpers] Error upserting subscription:', error);
    return;
  }

  await supabase.from('billing_transactions').insert({
    user_id: userId,
    type: 'subscription_payment',
    amount_cents: sub.items.data[0]?.price.unit_amount ?? 0,
    description: `${plan} ${billingCycle} subscription`,
    stripe_payment_intent_id: sub.latest_invoice as string ?? null,
    reference_id: subscriptionId,
  });
}

export async function handleSubscriptionCanceled(subscriptionId: string): Promise<void> {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscriptionId);
}

export async function handlePaymentSucceeded(
  customerId: string,
  amountCents: number,
  description: string,
  paymentIntentId: string
): Promise<void> {
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  const userId = sub?.user_id ?? null;

  await supabase.from('billing_transactions').insert({
    user_id: userId,
    type: 'subscription_payment',
    amount_cents: amountCents,
    description,
    stripe_payment_intent_id: paymentIntentId,
  });
}

function inferPlanFromPriceId(priceId: string): PlanName | null {
  const plans: PlanName[] = ['starter', 'pro', 'premium', 'enterprise'];
  for (const plan of plans) {
    const monthlyKey = `STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY`;
    const annualKey = `STRIPE_PRICE_${plan.toUpperCase()}_ANNUAL`;
    if (process.env[monthlyKey] === priceId || process.env[annualKey] === priceId) {
      return plan;
    }
  }
  return null;
}
