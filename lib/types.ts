import { GeneratedApp } from './generate'

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
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Project | null
  old: Project | null
}

export type Deployment = {
  id: string
  project_id: string
  user_id: string
  vercel_id: string
  status: "queued" | "building" | "ready" | "error" | "canceled"
  url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type DeploymentResult = {
  deployment: Deployment
  liveUrl: string | null
}

export type ErrorSeverity = "low" | "medium" | "high" | "fatal"

export type ErrorModule =
  | "AI_ENGINE" | "AUTH" | "PROJECTS" | "EDITOR"
  | "PREVIEW" | "STORAGE" | "REALTIME" | "DEPLOY" | "SYSTEM"

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
