'use client'

import { useState } from 'react'
import { useErrorStore } from '@/lib/error-store'
import type { ToastItem } from '@/lib/types'

const BORDER_COLORS: Record<string, string> = {
  low: '#60A5FA',
  medium: '#FBBF24',
  high: '#FB923C',
}

const ICONS: Record<string, string> = {
  low: 'ℹ',
  medium: '⚠',
  high: '✖',
}

function Toast({ item }: { item: ToastItem }) {
  const { dismissToast } = useErrorStore()
  const [retrying, setRetrying] = useState(false)
  const [retryFailed, setRetryFailed] = useState(false)

  async function handleRetry() {
    if (!item.retryFn || retrying) return
    setRetrying(true)
    setRetryFailed(false)
    try {
      await item.retryFn()
      dismissToast(item.id)
    } catch {
      setRetryFailed(true)
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        background: '#1e1e1e',
        borderRadius: 6,
        borderLeft: `4px solid ${BORDER_COLORS[item.severity] ?? '#666'}`,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: '20px' }}>
        {ICONS[item.severity] ?? '•'}
      </span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, color: '#e0e0e0', lineHeight: '20px' }}>
          {item.message}
        </p>
        {retryFailed && (
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#f87171' }}>
            Retry failed
          </p>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          {item.retryFn && (
            <button
              onClick={handleRetry}
              disabled={retrying}
              style={{
                padding: '2px 10px',
                fontSize: 12,
                background: retrying ? '#555' : '#3b3b3b',
                color: '#e0e0e0',
                border: 'none',
                borderRadius: 3,
                cursor: retrying ? 'not-allowed' : 'pointer',
              }}
            >
              {retrying ? '…' : 'Retry'}
            </button>
          )}
          <button
            onClick={() => dismissToast(item.id)}
            style={{
              padding: '2px 10px',
              fontSize: 12,
              background: 'transparent',
              color: '#888',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const { toasts } = useErrorStore()

  if (toasts.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {toasts.map((t) => (
        <Toast key={t.id} item={t} />
      ))}
    </div>
  )
}
