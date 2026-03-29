export const APP_ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
} as const;

export const API_ROUTES = {
  authLogin: "/api/auth/login",
  authRegister: "/api/auth/register",
  authSignout: "/api/auth/signout",
  projects: "/api/projects",
  generate: "/api/generate",
  deploy: "/api/deploy",
  deployStatus: "/api/deploy/status",
  storage: "/api/storage",
  errors: "/api/errors",
  models: "/api/models",
  templates: "/api/templates",
  billing: "/api/billing",
  billingVerifySession: "/api/billing/verify-session",
  stripeCheckout: "/api/stripe/checkout",
  stripePortal: "/api/stripe/portal",
  stripeWebhook: "/api/stripe/webhook",
} as const;
