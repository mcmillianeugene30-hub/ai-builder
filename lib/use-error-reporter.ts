'use client';

import { useCallback } from 'react';

export function useErrorReporter() {
  return useCallback(
    async (error: Error, context?: Record<string, unknown>) => {
      try {
        await fetch('/api/errors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            context,
          }),
        });
      } catch {
        // Silently fail — do not disrupt UX for error reporting failures
      }
    },
    []
  );
}
