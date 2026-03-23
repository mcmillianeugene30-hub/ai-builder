import type { ErrorSeverity } from './types';

export type AppErrorCode =
  | 'AUTH_REQUIRED'
  | 'INVALID_REQUEST'
  | 'SCHEMA_VALIDATION_FAILED'
  | 'AI_GENERATION_FAILED'
  | 'PROJECT_NOT_FOUND'
  | 'SUBSCRIPTION_REQUIRED'
  | 'DEPLOYMENT_FAILED'
  | 'STORAGE_ERROR'
  | 'BILLING_ERROR'
  | 'STRIPE_ERROR'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMITED';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly status: number = 500,
    public readonly severity: ErrorSeverity = 'medium'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export function getErrorStatus(code: AppErrorCode): number {
  switch (code) {
    case 'AUTH_REQUIRED':
    case 'PROJECT_NOT_FOUND':
      return 404;
    case 'INVALID_REQUEST':
    case 'SCHEMA_VALIDATION_FAILED':
      return 400;
    case 'SUBSCRIPTION_REQUIRED':
      return 402;
    case 'RATE_LIMITED':
      return 429;
    default:
      return 500;
  }
}

export function getErrorResponse(err: unknown): { error: string; code: AppErrorCode } {
  if (isAppError(err)) {
    return { error: err.message, code: err.code };
  }
  if (err instanceof Error) {
    return { error: err.message, code: 'INTERNAL_ERROR' };
  }
  return { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' };
}
