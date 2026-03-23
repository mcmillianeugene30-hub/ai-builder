import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    });
  }
  return _stripe;
}

export async function createStripeCustomer(email: string, userId: string): Promise<string | null> {
  const customer = await getStripe().customers.create({
    email,
    metadata: { user_id: userId },
  });
  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<string | null> {
  const session = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return session.url;
}

export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string | null> {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session.url;
}

export async function reportMeteredUsage(
  priceId: string,
  customerId: string,
  quantity: number = 1
): Promise<void> {
  // Note: Stripe API changed in newer versions - this feature needs migration
  // Using fetch to call Stripe API directly as fallback
  try {
    const response = await fetch(
      `https://api.stripe.com/v1/usage_records`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          subscription_item: priceId,
          quantity: quantity.toString(),
          timestamp: Math.floor(Date.now() / 1000).toString(),
          action: 'increment',
        }),
      }
    );
    if (!response.ok) {
      const error = await response.text();
      console.error('[stripe] Metred usage API failed:', error);
    }
  } catch (err) {
    console.error('[stripe] Metred usage reporting failed:', err);
  }
}

export async function getSubscription(subscriptionId: string) {
  return getStripe().subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  return getStripe().subscriptions.cancel(subscriptionId);
}
