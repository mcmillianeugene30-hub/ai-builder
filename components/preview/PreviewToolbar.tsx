'use client'

import { useState } from 'react'

interface PreviewToolbarProps {
  hasErrors: boolean
  errorMessage: string | null
  lastCompiledAt: Date | null
  onRefresh: () => void
}

export function PreviewToolbar({
  hasErrors,
  errorMessage,
  lastCompiledAt,
  onRefresh,
}: PreviewToolbarProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const timeStr = lastCompiledAt
    ? `Compiled at ${lastCompiledAt.toLocaleTimeString()}`
    : ''

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: '1px solid #2a2a2a',
        background: '#1e1e1e',
        color: '#ccc',
        fontSize: 13,
        minHeight: 36,
      }}
    >
      <span style={{ fontWeight: 600 }}>Preview</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {timeStr && (
          <span style={{ fontSize: 12, opacity: 0.7 }}>{timeStr}</span>
        )}
        {hasErrors && (
          <div style={{ position: 'relative' }}>
            <span
              style={{
                background: '#c0392b',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 3,
                fontSize: 12,
                cursor: 'pointer',
              }}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              ⚠ Error
            </span>
            {showTooltip && errorMessage && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#333',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 4,
                  fontSize: 11,
                  whiteSpace: 'pre-wrap',
                  maxWidth: 300,
                  zIndex: 10,
                  marginBottom: 4,
                }}
              >
                {errorMessage}
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onRefresh}
        style={{
          background: '#333',
          border: '1px solid #444',
          color: '#ccc',
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
        }}
      >
        ↻ Refresh
      </button>
    </div>
  )
}
