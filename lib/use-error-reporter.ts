'use client'

import type { AppError } from './types'

export function useErrorReporter() {
  function reportError(error: AppError): void {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: error.module,
        code: error.code,
        message: error.message,
        severity: error.severity,
        context: error.context,
        stack: error.stack,
      }),
    })
  }

  return { reportError }
}
