'use client'

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import type { AppError, ToastItem } from './types'

type ErrorState = {
  toasts: ToastItem[]
  fatalError: AppError | null
}

type ErrorAction =
  | { type: 'ADD_ERROR'; error: AppError }
  | { type: 'DISMISS_TOAST'; id: string }
  | { type: 'CLEAR_FATAL' }

const DURATION: Record<string, number | null> = {
  low: 4000,
  medium: 7000,
  high: null,
  fatal: null,
}

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const toast: ToastItem = {
        id: action.error.id,
        message: action.error.message,
        severity: action.error.severity,
        retryFn: action.error.retryFn,
      }

      let toasts = [toast, ...state.toasts]

      if (toasts.length > 5) {
        toasts = toasts.slice(0, 5)
      }

      return {
        ...state,
        toasts,
        fatalError: action.error.isFatal ? action.error : state.fatalError,
      }
    }
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      }
    case 'CLEAR_FATAL':
      return { ...state, fatalError: null }
    default:
      return state
  }
}

type ErrorContextValue = {
  toasts: ToastItem[]
  fatalError: AppError | null
  addError: (error: AppError) => void
  dismissToast: (id: string) => void
  clearFatal: () => void
}

const ErrorContext = createContext<ErrorContextValue | null>(null)

const initialState: ErrorState = {
  toasts: [],
  fatalError: null,
}

const dispatchRef = { current: null as React.Dispatch<ErrorAction> | null }

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [state, dispatchFn] = useReducer(errorReducer, initialState)
  dispatchRef.current = dispatchFn

  const addError = useCallback((error: AppError) => {
    dispatchRef.current?.({ type: 'ADD_ERROR', error })

    const duration = DURATION[error.severity]
    if (duration !== null) {
      setTimeout(() => {
        dispatchRef.current?.({ type: 'DISMISS_TOAST', id: error.id })
      }, duration)
    }
  }, [])

  const dismissToast = useCallback((id: string) => {
    dispatchRef.current?.({ type: 'DISMISS_TOAST', id })
  }, [])

  const clearFatal = useCallback(() => {
    dispatchRef.current?.({ type: 'CLEAR_FATAL' })
  }, [])

  return (
    <ErrorContext.Provider
      value={{
        toasts: state.toasts,
        fatalError: state.fatalError,
        addError,
        dismissToast,
        clearFatal,
      }}
    >
      {children}
    </ErrorContext.Provider>
  )
}

export function useErrorStore(): ErrorContextValue {
  const ctx = useContext(ErrorContext)
  if (!ctx) throw new Error('useErrorStore must be used inside ErrorProvider')
  return ctx
}
