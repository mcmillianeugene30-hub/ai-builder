'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GenerationLoading } from './GenerationLoading'

type GeneratedApp = {
  frontend: {
    framework: string
    components: string[]
    pages: string[]
  }
  backend: {
    routes: { method: string; path: string; description: string }[]
  }
  database: {
    tables: { name: string; columns: { name: string; type: string }[] }[]
  }
}

type GenerateModalProps = {
  onClose: () => void
}

const EXAMPLE_PROMPTS = [
  'A task management app with users, projects, and comments',
  'A recipe sharing platform with ratings and categories',
  'A real-time chat app with rooms and direct messages',
  'An inventory tracker with suppliers and stock alerts',
]

export function GenerateModal({ onClose }: GenerateModalProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<{ projectId: string } | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Generation failed')
      }

      setGenerated({ projectId: json.data.projectId })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setLoading(false)
    }
  }

  if (loading && !generated) {
    return <GenerationLoading prompt={prompt} />
  }

  if (generated) {
    router.push(`/editor?projectId=${generated.projectId}`)
    return null
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: 12,
        padding: '2rem',
        maxWidth: 600,
        width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#f0f6fc', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Generate App
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the app you want to build…"
          rows={5}
          style={{
            width: '100%',
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: 8,
            padding: '0.75rem',
            color: '#c9d1d9',
            fontSize: '0.9rem',
            resize: 'vertical',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#6366f1' }}
          onBlur={(e) => { e.target.style.borderColor = '#30363d' }}
        />

        <div style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
          <p style={{ color: '#484f58', fontSize: '0.75rem', marginBottom: '0.5rem' }}>
            Try an example:
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                style={{
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: 16,
                  padding: '0.25rem 0.75rem',
                  color: '#8b949e',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {example.split(' ').slice(0, 3).join(' ')}…
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid #ef4444',
            borderRadius: 6,
            padding: '0.75rem',
            color: '#f87171',
            fontSize: '0.85rem',
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: 6,
              color: '#c9d1d9',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim()}
            style={{
              padding: '0.5rem 1.25rem',
              background: prompt.trim() ? '#6366f1' : '#30363d',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: prompt.trim() ? 'pointer' : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            Generate App →
          </button>
        </div>
      </div>
    </div>
  )
}
