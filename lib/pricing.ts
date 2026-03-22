import type { PlanName, PlanFeatures } from './types'

export const PLAN_PRICES: Record<PlanName, {
  monthly: number
  annual: number | null
  monthlyInCents: number
  annualInCents: number | null
}> = {
  starter: {
    monthly: 5.99,
    monthlyInCents: 599,
    annual: 59.00,
    annualInCents: 5900,
  },
  pro: {
    monthly: 15.99,
    monthlyInCents: 1599,
    annual: 159.00,
    annualInCents: 15900,
  },
  premium: {
    monthly: 29.99,
    monthlyInCents: 2999,
    annual: 299.00,
    annualInCents: 29900,
  },
  enterprise: {
    monthly: 150.00,
    monthlyInCents: 15000,
    annual: null,
    annualInCents: null,
  },
}

export const PAY_AS_YOU_GO = {
  aiGeneration: {
    cents: 15,
    display: '$0.15',
    label: '$0.15 per request',
  },
  mobileBuild: {
    cents: 120,
    display: '$1.20',
    label: '$1.20 per build',
  },
  customDomain: {
    cents: 200,
    display: '$2.00',
    label: '$2.00 per month',
  },
} as const

export const PLAN_FEATURES: Record<PlanName, PlanFeatures> = {
  starter: {
    maxProjects: 3,
    maxUsers: 1,
    maxDomains: 0,
    mobileBuilds: false,
    prioritySupport: false,
  },
  pro: {
    maxProjects: -1,
    maxUsers: 3,
    maxDomains: 1,
    mobileBuilds: true,
    prioritySupport: false,
  },
  premium: {
    maxProjects: -1,
    maxUsers: 10,
    maxDomains: 3,
    mobileBuilds: true,
    prioritySupport: true,
  },
  enterprise: {
    maxProjects: -1,
    maxUsers: -1,
    maxDomains: -1,
    mobileBuilds: true,
    prioritySupport: true,
  },
}

export const PLAN_DESCRIPTIONS: Record<PlanName, string> = {
  starter: 'Essential features for personal use and small projects.',
  pro: 'Advanced features, higher limits, and collaboration tools.',
  premium: 'Priority support, dedicated limits, production-ready.',
  enterprise: 'Custom SLAs, dedicated account management, volume discounts.',
}
