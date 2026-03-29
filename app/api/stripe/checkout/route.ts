import { NextRequest, NextResponse } from 'next/server';
import { getUser, getSupabaseClient } from '@/lib/supabase-server';
import { createStripeCustomer, createCheckoutSession } from '@/lib/stripe';
import { STRIPE_PRICE_IDS, type PlanName, type BillingCycle } from '@/lib/pricing';

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { plan, billingCycle } = body as { plan?: PlanName; billingCycle?: BillingCycle };
  if (!plan || !billingCycle) {
    return NextResponse.json({ error: 'plan and billingCycle are required' }, { status: 400 });
  }

  const priceId = STRIPE_PRICE_IDS[plan]?.[billingCycle];
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
  }

  // Get or create Stripe customer
  const supabase = getSupabaseClient();
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  let customerId = existingSub?.stripe_customer_id ?? null;

  if (!customerId) {
    customerId = await createStripeCustomer(user.email ?? '', user.id);
    if (!customerId) {
      return NextResponse.json({ error: 'Failed to create Stripe customer' }, { status: 500 });
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const checkoutUrl = await createCheckoutSession(
    customerId,
    priceId,
    `${appUrl}/billing/success`,
    `${appUrl}/pricing`
  );

  if (!checkoutUrl) {
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }

  return NextResponse.json({ data: { url: checkoutUrl } });
}
