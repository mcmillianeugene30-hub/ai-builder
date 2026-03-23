'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AIModel } from '@/lib/types'
import { GenerationLoading } from './GenerationLoading'

type GenerateModalProps = {
  onClose: () => void
}

const EXAMPLE_PROMPTS = [
  'A task management app with users, projects, and comments',
  'A recipe sharing platform with ratings and categories',
  'A real-time chat app with rooms and direct messages',
  'An inventory tracker with suppliers and stock alerts',
]

const PROVIDER_LABELS: Record<string, string> = {
  groq: 'Groq',
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
}

export function GenerateModal({ onClose }: GenerateModalProps) {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generated, setGenerated] = useState<{ projectId: string; modelUsed?: string } | null>(null)
  const [models, setModels] = useState<AIModel[]>([])
  const [defaultModelId, setDefaultModelId] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        setModels(data.data.models)
        setDefaultModelId(data.data.defaultModelId)
        setSelectedModelId(data.data.defaultModelId)
      })
      .catch(() => {})
  }, [])

  const selectedModel = models.find((m) => m.id === selectedModelId)
  const isGpt4o = selectedModelId === 'gpt-4o'

  const grouped = models.reduce<Record<string, AIModel[]>>((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model)
    return acc
  }, {})

  async function handleGenerate() {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelId: selectedModelId }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        throw new Error(json.error || 'Generation failed')
      }

      setGenerated({
        projectId: json.data.projectId,
        modelUsed: json.meta?.modelUsed,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
      setLoading(false)
    }
  }

  if (loading && !generated) {
    return <GenerationLoading prompt={prompt} modelName={selectedModel?.displayName} />
  }

  if (generated) {
    router.push(`/editor?projectId=${generated.projectId}`)
    return null
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        background: '#0d1117', border: '1px solid #30363d', borderRadius: 12,
        padding: '2rem', maxWidth: 600, width: '100%',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#f0f6fc', fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
            Generate App
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}>×</button>
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the app you want to build…"
          rows={4}
          style={{
            width: '100%', background: '#161b22', border: '1px solid #30363d',
            borderRadius: 8, padding: '0.75rem', color: '#c9d1d9',
            fontSize: '0.9rem', resize: 'vertical', fontFamily: 'inherit',
            boxSizing: 'border-box', outline: 'none',
          }}
        />

        <div style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
          <p style={{ color: '#484f58', fontSize: '0.75rem', marginBottom: '0.5rem' }}>Try an example:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {EXAMPLE_PROMPTS.map((example) => (
              <button key={example} onClick={() => setPrompt(example)} style={{
                background: '#161b22', border: '1px solid #30363d', borderRadius: 16,
                padding: '0.25rem 0.75rem', color: '#8b949e', fontSize: '0.75rem', cursor: 'pointer',
              }}>
                {example.split(' ').slice(0, 3).join(' ')}…
              </button>
            ))}
          </div>
        </div>

        {/* Model selector */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <label style={{ fontSize: '0.8rem', color: '#8b949e', fontWeight: 500 }}>Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              style={{
                flex: 1,
                background: '#161b22',
                border: '1px solid #30363d',
                borderRadius: 6,
                color: '#c9d1d9',
                padding: '6px 10px',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {Object.entries(grouped).map(([provider, providerModels]) => (
                <optgroup key={provider} label={PROVIDER_LABELS[provider] ?? provider}>
                  {providerModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.displayName} (${(model.costCents / 100).toFixed(2)})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {isGpt4o && (
            <div style={{
              fontSize: '0.75rem',
              color: '#f0b429',
              background: '#f0b42918',
              border: '1px solid #f0b42944',
              borderRadius: 4,
              padding: '4px 8px',
            }}>
              ⚠️ GPT-4o costs $0.30/gen (vs $0.15 for other models)
            </div>
          )}
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444',
            borderRadius: 6, padding: '0.75rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '0.5rem 1.25rem', background: 'transparent',
            border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', cursor: 'pointer', fontSize: '0.9rem',
          }}>Cancel</button>
          <button onClick={handleGenerate} disabled={!prompt.trim()} style={{
            padding: '0.5rem 1.25rem',
            background: prompt.trim() ? '#6366f1' : '#30363d',
            border: 'none', borderRadius: 6, color: '#fff',
            cursor: prompt.trim() ? 'pointer' : 'not-allowed', fontSize: '0.9rem', fontWeight: 500,
          }}>
            Generate{selectedModel ? ` with ${selectedModel.displayName}` : ''} →
          </button>
        </div>
      </div>
    </div>
  )
}
