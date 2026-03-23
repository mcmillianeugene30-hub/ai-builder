import type { AppErrorCode } from './errors';

export interface ErrorState {
  code: AppErrorCode;
  message: string;
  timestamp: number;
}

let errors: ErrorState[] = [];
const listeners: Set<() => void> = new Set();

export function addError(code: AppErrorCode, message: string): void {
  errors = [...errors, { code, message, timestamp: Date.now() }];
  listeners.forEach((l) => l());
}

export function clearError(timestamp: number): void {
  errors = errors.filter((e) => e.timestamp !== timestamp);
  listeners.forEach((l) => l());
}

export function getErrors(): ErrorState[] {
  return [...errors];
}

export function subscribeErrors(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
