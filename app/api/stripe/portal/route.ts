import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { createBillingPortalSession } from '@/lib/stripe';
import { supabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  const customerId = subscription?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const portalUrl = await createBillingPortalSession(customerId, `${appUrl}/billing`);

  if (!portalUrl) {
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }

  return NextResponse.json({ data: { url: portalUrl } });
}
