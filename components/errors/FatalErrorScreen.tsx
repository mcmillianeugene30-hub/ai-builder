'use client'

import { useErrorStore } from '@/lib/error-store'

export function FatalErrorScreen() {
  const { fatalError, clearFatal } = useErrorStore()

  if (!fatalError) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          color: '#fff',
          maxWidth: 480,
          padding: 40,
        }}
      >
        <div
          style={{
            fontSize: 56,
            marginBottom: 16,
            lineHeight: 1,
          }}
        >
          ✖
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 12px',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#ccc',
            margin: '0 0 8px',
            lineHeight: 1.5,
          }}
        >
          {fatalError.message}
        </p>
        <p
          style={{
            fontSize: 12,
            color: '#666',
            margin: '0 0 32px',
          }}
        >
          Error code: {fatalError.code}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
            Reload Page
          </button>
          <button
            onClick={() => {
              clearFatal()
              window.location.href = '/dashboard'
            }}
            style={{
              padding: '10px 24px',
              fontSize: 14,
              background: '#333',
              color: '#e0e0e0',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
