import { supabase } from './supabase-server';
import { PLAN_FEATURES, type PlanName } from './pricing';
import type { Subscription } from './types';

export async function checkAccess(
  userId: string,
  action: 'generate' | 'deploy' | 'storage'
): Promise<{ allowed: boolean; error?: string }> {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[billing] Error checking subscription:', error);
    return { allowed: false, error: 'Failed to verify subscription' };
  }

  if (!subscription) {
    return { allowed: false, error: 'No active subscription found' };
  }

  const plan = subscription.plan as PlanName;
  const features = PLAN_FEATURES[plan];

  if (action === 'generate') {
    if (features.aiGenerationsPerMonth === -1) return { allowed: true };
    // Check usage this month
    const periodStart = new Date(subscription.current_period_start ?? Date.now());
    const { count } = await supabase
      .from('billing_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'ai_generation')
      .gte('created_at', periodStart.toISOString());

    if ((count ?? 0) >= features.aiGenerationsPerMonth) {
      return { allowed: false, error: 'AI generation limit reached for this month' };
    }
  }

  if (action === 'deploy') {
    if (features.projectsLimit === -1) return { allowed: true };
    const { count } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if ((count ?? 0) >= features.projectsLimit) {
      return { allowed: false, error: 'Project limit reached for your plan' };
    }
  }

  return { allowed: true };
}

export async function recordCharge(
  userId: string,
  type: 'ai_generation' | 'mobile_build' | 'custom_domain',
  amountCents: number,
  description: string
): Promise<void> {
  await supabase.from('billing_transactions').insert({
    user_id: userId,
    type,
    amount_cents: amountCents,
    description,
  });
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[billing] Error fetching subscription:', error);
    return null;
  }

  return data as Subscription | null;
}
