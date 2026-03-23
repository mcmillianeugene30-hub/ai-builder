// ─── Project & Editor ──────────────────────────────────────────────────────────

export type ProjectFile = {
  name: string
  path: string
  content: string
  language: string
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string | null
  files: ProjectFile[]
  created_at: string
  updated_at: string
}

export type CreateProjectInput = {
  name: string
  description?: string
  files?: ProjectFile[]
}

export type UpdateProjectInput = {
  name?: string
  description?: string
  files?: ProjectFile[]
}

// ─── AI Generation ─────────────────────────────────────────────────────────────

export type GeneratedApp = {
  frontend: {
    framework: string
    components: string[]
    pages: string[]
  }
  backend: {
    routes: {
      method: string
      path: string
      description: string
    }[]
  }
  database: {
    tables: {
      name: string
      columns: { name: string; type: string; nullable: boolean }[]
    }[]
  }
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export type StoredAsset = {
  name: string
  path: string
  size: number
  mimeType: string
  signedUrl: string
  createdAt: string
}

export type UploadAssetInput = {
  userId: string
  projectId: string
  file: File
}

// ─── Realtime / Collaboration ─────────────────────────────────────────────────

export type Collaborator = {
  userId: string
  email: string
  avatarUrl: string | null
  activeFileIndex: number
  lastSeenAt: string
  color: string
}

export type PresenceState = {
  [userId: string]: Collaborator
}

export type RealtimePayload = {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  new: Project | null
  old: Project | null
}

// ─── Deployment ────────────────────────────────────────────────────────────────

export type Deployment = {
  id: string
  project_id: string
  user_id: string
  vercel_id: string
  status: 'queued' | 'building' | 'ready' | 'error' | 'canceled'
  url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type DeploymentResult = {
  deployment: Deployment
  liveUrl: string | null
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'fatal'

export type ErrorModule =
  | 'AI_ENGINE' | 'AUTH' | 'PROJECTS' | 'EDITOR'
  | 'PREVIEW' | 'STORAGE' | 'REALTIME' | 'DEPLOY' | 'SYSTEM' | 'BILLING'

export type AppError = {
  id: string
  module: ErrorModule
  code: string
  message: string
  severity: ErrorSeverity
  isFatal: boolean
  context?: Record<string, unknown>
  stack?: string
  timestamp: Date
  retryFn?: () => Promise<void>
}

export type ToastItem = {
  id: string
  message: string
  severity: ErrorSeverity
  retryFn?: () => Promise<void>
  dismissedAt?: Date
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type PlanName = 'starter' | 'pro' | 'premium' | 'enterprise'

export type PlanFeatures = {
  maxProjects: number
  maxUsers: number
  maxDomains: number
  mobileBuilds: boolean
  prioritySupport: boolean
}

export type Subscription = {
  id: string
  user_id: string
  plan: PlanName
  billing_cycle: 'monthly' | 'annual'
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  current_period_start: string | null
  current_period_end: string | null
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  created_at: string
  updated_at: string
}

export type BillingTransaction = {
  id: string
  user_id: string
  type: 'purchase' | 'credit' | 'refund'
  description: string
  credits: number | null
  amount: number | null
  created_at: string
}
