import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { handleSubscriptionActivated, handleSubscriptionCanceled, handlePaymentSucceeded } from '@/lib/stripe-helpers';
import Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id;
        await handleSubscriptionActivated(sub.id, customerId);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(sub.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const customerId = typeof pi.customer === 'string' ? pi.customer : pi.customer?.id ?? '';
        await handlePaymentSucceeded(
          customerId,
          pi.amount,
          `Payment ${pi.id}`,
          pi.id
        );
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payment - mark subscription as past_due
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id?: string } | null };
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id ?? '';
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id ?? '';
        if (subscriptionId) {
          const { getSupabaseClient } = await import('@/lib/supabase-server');
          const supabase = getSupabaseClient();
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', subscriptionId);
        }
        break;
      }
    }
  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err);
  }

  return NextResponse.json({ received: true });
}
