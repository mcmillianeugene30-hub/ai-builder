'use client'

import { useErrorStore } from './error-store'
import { useErrorReporter } from './use-error-reporter'
import { classifyUnknownError } from './errors'
import type { AppError } from './types'

export function useErrorHandler() {
  const { addError } = useErrorStore()
  const { reportError } = useErrorReporter()

  function handleError(error: unknown, retryFn?: () => Promise<void>): void {
    const appError = classifyUnknownError(error)
    if (retryFn) {
      appError.retryFn = retryFn
    }
    addError(appError)
    reportError(appError)
  }

  return { handleError }
}
