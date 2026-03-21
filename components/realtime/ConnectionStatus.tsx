'use client'

interface ConnectionStatusProps {
  isConnected: boolean
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white">
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: isConnected ? '#34D399' : '#6b7280',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      <span style={{ opacity: 0.8 }}>
        {isConnected ? 'Live' : 'Connecting…'}
      </span>
    </div>
  )
}
