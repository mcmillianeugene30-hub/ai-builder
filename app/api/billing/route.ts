import { NextRequest, NextResponse } from 'next/server';
import { getUser, getSupabaseClient } from '@/lib/supabase-server';
import { getSubscription } from '@/lib/billing';

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const subscription = await getSubscription(user.id);
  const supabase = getSupabaseClient();
  const { data: transactions } = await supabase
    .from('billing_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({
    data: {
      subscription,
      transactions: transactions ?? [],
    },
  });
}
