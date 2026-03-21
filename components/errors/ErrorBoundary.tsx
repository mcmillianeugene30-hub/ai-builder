'use client'
import { Component, type ReactNode } from 'react'
import { classifyUnknownError } from '@/lib/errors'
import type { AppError } from '@/lib/types'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: AppError | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error: classifyUnknownError(error),
    }
  }

  componentDidCatch(error: Error): void {
    const appError = classifyUnknownError(error)
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: appError.module,
        code: appError.code,
        message: appError.message,
        severity: appError.severity,
        context: appError.context,
        stack: appError.stack,
      }),
    })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ textAlign: 'center', color: '#fff', maxWidth: 480, padding: 40 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }}>
              App crashed
            </h1>
            <p style={{ fontSize: 16, color: '#ccc', margin: '0 0 24px' }}>
              {this.state.error.message}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 24px',
                fontSize: 14,
                background: '#e53935',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
