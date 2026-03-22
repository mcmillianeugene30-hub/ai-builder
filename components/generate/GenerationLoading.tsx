'use client'

type GenerationLoadingProps = {
  prompt: string
}

export function GenerationLoading({ prompt }: GenerationLoadingProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1a1a2e',
        border: '1px solid #333',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: 480,
        width: '90%',
        textAlign: 'center',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: '4px solid #333',
          borderTopColor: '#6366f1',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1.5rem',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <h2 style={{ color: '#f0f6fc', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
          Generating your app…
        </h2>
        <p style={{ color: '#8b949e', fontSize: '0.9rem', marginBottom: '1rem' }}>
          AI is crafting a production-ready scaffold based on your prompt
        </p>
        <div style={{
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: 6,
          padding: '0.75rem',
          textAlign: 'left',
          maxHeight: 120,
          overflow: 'auto',
        }}>
          <p style={{ color: '#c9d1d9', fontSize: '0.8rem', fontStyle: 'italic', margin: 0 }}>
            "{prompt}"
          </p>
        </div>
        <p style={{ color: '#484f58', fontSize: '0.75rem', marginTop: '1rem' }}>
          This typically takes 15–30 seconds…
        </p>
      </div>
    </div>
  )
}
