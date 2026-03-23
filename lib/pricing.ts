// ============================================================
// Pricing — Single Source of Truth
// All prices MUST be imported from this file only.
// ============================================================

export type PlanName = 'starter' | 'pro' | 'premium' | 'enterprise';
export type BillingCycle = 'monthly' | 'annual';

export const PLAN_PRICES: Record<PlanName, { monthly: number; annual: number }> = {
  starter: { monthly: 599, annual: 4799 },
  pro: { monthly: 1599, annual: 12799 },
  premium: { monthly: 2999, annual: 23999 },
  enterprise: { monthly: 0, annual: 0 },
};

export const PLAN_FEATURES: Record<PlanName, {
  projectsLimit: number;
  aiGenerationsPerMonth: number;
  mobileBuildsPerMonth: number;
  customDomains: number;
  realtimeCollaborators: number;
  prioritySupport: boolean;
  advancedModels: boolean;
}> = {
  starter: {
    projectsLimit: 5,
    aiGenerationsPerMonth: 20,
    mobileBuildsPerMonth: 2,
    customDomains: 0,
    realtimeCollaborators: 1,
    prioritySupport: false,
    advancedModels: false,
  },
  pro: {
    projectsLimit: 25,
    aiGenerationsPerMonth: 100,
    mobileBuildsPerMonth: 10,
    customDomains: 2,
    realtimeCollaborators: 5,
    prioritySupport: true,
    advancedModels: true,
  },
  premium: {
    projectsLimit: -1, // unlimited
    aiGenerationsPerMonth: -1,
    mobileBuildsPerMonth: 50,
    customDomains: 5,
    realtimeCollaborators: -1,
    prioritySupport: true,
    advancedModels: true,
  },
  enterprise: {
    projectsLimit: -1,
    aiGenerationsPerMonth: -1,
    mobileBuildsPerMonth: -1,
    customDomains: -1,
    realtimeCollaborators: -1,
    prioritySupport: true,
    advancedModels: true,
  },
};

export const PLAN_DESCRIPTIONS: Record<PlanName, string> = {
  starter: 'Perfect for getting started with AI-powered app building',
  pro: 'For growing teams that need more power and flexibility',
  premium: 'For power users and agencies with advanced requirements',
  enterprise: 'Custom pricing for large-scale deployments',
};

export const STRIPE_PRICE_IDS: Record<PlanName, { monthly: string | null; annual: string | null }> = {
  starter: {
    monthly: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? null,
    annual: process.env.STRIPE_PRICE_STARTER_ANNUAL ?? null,
  },
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? null,
    annual: process.env.STRIPE_PRICE_PRO_ANNUAL ?? null,
  },
  premium: {
    monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null,
    annual: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? null,
  },
  enterprise: {
    monthly: null,
    annual: null,
  },
};

export const PAY_AS_YOU_GO = {
  aiGeneration: 20,      // cents per generation
  mobileBuild: 150,     // cents per mobile build
  customDomain: 200,    // cents per custom domain
};
