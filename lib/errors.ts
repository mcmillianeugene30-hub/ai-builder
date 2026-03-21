import type { AppError, ErrorModule, ErrorSeverity } from './types'

export function createAppError(params: {
  module: ErrorModule
  code: string
  message: string
  severity: ErrorSeverity
  isFatal?: boolean
  context?: Record<string, unknown>
  error?: unknown
  retryFn?: () => Promise<void>
}): AppError {
  const stack =
    params.error instanceof Error ? params.error.stack : undefined

  return {
    id: crypto.randomUUID(),
    module: params.module,
    code: params.code,
    message: params.message,
    severity: params.severity,
    isFatal: params.isFatal ?? false,
    context: params.context,
    stack,
    timestamp: new Date(),
    retryFn: params.retryFn,
  }
}

export function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'module' in value &&
    'code' in value &&
    'message' in value
  )
}

export function formatErrorMessage(error: AppError): string {
  return `[${error.module}] ${error.message} (Code: ${error.code})`
}

export function classifyUnknownError(error: unknown): AppError {
  if (isAppError(error)) return error

  if (error instanceof Error) {
    return createAppError({
      module: 'SYSTEM',
      code: 'UNKNOWN_ERROR',
      message: error.message,
      severity: 'high',
      isFatal: false,
      error,
    })
  }

  return createAppError({
    module: 'SYSTEM',
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    severity: 'high',
    isFatal: false,
  })
}
