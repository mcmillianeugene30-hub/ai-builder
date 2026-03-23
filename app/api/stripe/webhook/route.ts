import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  })

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createSupabaseServerClient()

  switch (stripeEvent.type) {
    case 'checkout.session.completed': {
      const session = stripeEvent.data.object as unknown as {
        id: string; subscription: string; customer_email: string
        metadata: { userId: string; plan: string }
      }

      const userId = session.metadata?.userId
      const plan = session.metadata?.plan

      if (!userId || !plan) break

      await supabase.from('subscriptions').upsert(
        { user_id: userId, plan, stripe_subscription_id: session.subscription, status: 'active', billing_cycle: 'monthly' },
        { onConflict: 'user_id' }
      )
      break
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = stripeEvent.data.object as unknown as {
        id: string; customer: string; status: string
        metadata: { userId?: string }
        current_period_start: number; current_period_end: number
      }

      const userId = sub.metadata?.userId
      if (!userId) break

      const statusMap: Record<string, string> = {
        active: 'active', trialing: 'trialing', past_due: 'past_due',
        canceled: 'canceled', unpaid: 'past_due',
      }

      await supabase
        .from('subscriptions')
        .update({
          status: statusMap[sub.status] ?? 'active',
          stripe_subscription_id: sub.id,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = stripeEvent.data.object as { id: string; metadata: { userId?: string } }
      const userId = sub.metadata?.userId
      if (!userId) break

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled', updated_at: new Date().toISOString() })
        .eq('user_id', userId)
      break
    }

    case 'invoice.payment_succeeded': {
      const invoice = stripeEvent.data.object as {
        customer: string
        amount_paid: number
      }

      const userId = (
        await supabase.from('subscriptions').select('user_id').eq('stripe_customer_id', invoice.customer).single()
      ).data?.user_id

      if (!userId) break

      await supabase.from('billing_transactions').insert({
        user_id: userId,
        type: 'purchase',
        description: 'Subscription payment',
        credits: Math.floor(invoice.amount_paid / 100),
        amount: invoice.amount_paid,
      })
      break
    }

    case 'invoice.payment_failed': {
      const invoice = stripeEvent.data.object as { customer: string }
      await supabase.from('subscriptions').update({ status: 'past_due' }).eq('stripe_customer_id', invoice.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}
