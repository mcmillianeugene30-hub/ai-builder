'use client';

import { useCallback } from 'react';
import { addError } from './error-store';
import type { AppErrorCode } from './errors';

export function useErrorHandler() {
  return useCallback((code: AppErrorCode, message: string) => {
    addError(code, message);
  }, []);
}
