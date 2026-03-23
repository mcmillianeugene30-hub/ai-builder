'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { AIModel } from '@/lib/types'

const PROVIDER_LABELS: Record<string, string> = {
  groq: 'Groq (Recommended)',
  openrouter: 'OpenRouter',
  openai: 'OpenAI',
}

export default function GeneratePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [models, setModels] = useState<AIModel[]>([])
  const [defaultModelId, setDefaultModelId] = useState('')
  const [selectedModelId, setSelectedModelId] = useState('')
  const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [modelUsed, setModelUsed] = useState('')

  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        setModels(data.data.models)
        setDefaultModelId(data.data.defaultModelId)
        setSelectedModelId(data.data.defaultModelId)
      })
      .catch(() => {
        setError('Failed to load models')
      })
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
    setStatus('generating')
    setError('')
    setModelUsed('')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, modelId: selectedModelId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Generation failed')
        setStatus('error')
        return
      }

      if (data.meta?.modelUsed) setModelUsed(data.meta.modelUsed)
      setStatus('success')
      router.push(`/editor?projectId=${data.data.projectId}`)
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#c9d1d9', padding: '48px 24px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#f0f6fc', marginBottom: 8 }}>
            Generate App
          </h1>
          <p style={{ color: '#8b949e' }}>
            Describe your app and AI will scaffold the full stack — frontend, backend, and database.
          </p>
        </div>

        {/* Prompt */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#f0f6fc' }}>
            App Description
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A project management tool with teams, tasks, and deadlines"
            rows={5}
            style={{
              width: '100%',
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: 6,
              color: '#f0f6fc',
              padding: '12px 16px',
              fontSize: 15,
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
            disabled={status === 'generating'}
          />
        </div>

        {/* Model Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, color: '#f0f6fc' }}>
            AI Model
          </label>

          {models.length === 0 ? (
            <div style={{ color: '#8b949e', padding: '16px 0' }}>Loading models...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(grouped).map(([provider, providerModels]) => (
                <div key={provider}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#8b949e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}>
                    {PROVIDER_LABELS[provider] ?? provider}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {providerModels.map((model) => (
                      <label
                        key={model.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 14px',
                          background: selectedModelId === model.id ? '#1f6feb22' : '#161b22',
                          border: `1px solid ${selectedModelId === model.id ? '#1f6feb' : '#30363d'}`,
                          borderRadius: 6,
                          cursor: 'pointer',
                          transition: 'border-color 0.15s',
                        }}
                      >
                        <input
                          type="radio"
                          name="model"
                          value={model.id}
                          checked={selectedModelId === model.id}
                          onChange={() => setSelectedModelId(model.id)}
                          disabled={status === 'generating'}
                          style={{ accentColor: '#1f6feb' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600, color: '#f0f6fc' }}>{model.displayName}</span>
                            {model.isDefault && (
                              <span style={{ fontSize: 10, background: '#238636', color: '#fff', padding: '1px 6px', borderRadius: 10 }}>
                                DEFAULT
                              </span>
                            )}
                            {model.id === 'gpt-4o' && (
                              <span style={{ fontSize: 10, background: '#f0b429', color: '#000', padding: '1px 6px', borderRadius: 10 }}>
                                ⭐ PREMIUM
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>
                            ${(model.costCents / 100).toFixed(2)}/gen · {model.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GPT-4o cost warning */}
          {isGpt4o && (
            <div style={{
              marginTop: 12,
              padding: '12px 16px',
              background: '#f0b42922',
              border: '1px solid #f0b429',
              borderRadius: 6,
              color: '#f0b429',
              fontSize: 14,
            }}>
              ⚠️ GPT-4o costs <strong>$0.30 per generation</strong> (vs $0.15 for other models).
            </div>
          )}

          {/* Model description */}
          {selectedModel && (
            <div style={{ marginTop: 12, fontSize: 13, color: '#8b949e', paddingLeft: 4 }}>
              {selectedModel.description}
            </div>
          )}
        </div>

        {/* Status messages */}
        {status === 'generating' && (
          <div style={{
            padding: '12px 16px',
            background: '#1f6feb22',
            border: '1px solid #1f6feb',
            borderRadius: 6,
            color: '#79c0ff',
            marginBottom: 24,
            fontSize: 14,
          }}>
            Step 1: Generating with {selectedModel?.displayName ?? 'AI'}…
          </div>
        )}

        {status === 'error' && error && (
          <div style={{
            padding: '12px 16px',
            background: '#f8514922',
            border: '1px solid #f85149',
            borderRadius: 6,
            color: '#f85149',
            marginBottom: 24,
            fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={status === 'generating' || !prompt.trim()}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: status === 'generating' ? '#1f6feb88' : '#1f6feb',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 16,
            fontWeight: 600,
            cursor: status === 'generating' || !prompt.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {status === 'generating'
            ? `Generating with ${selectedModel?.displayName}…`
            : `Generate with ${selectedModel?.displayName ?? 'AI'}`}
        </button>

        {status === 'success' && modelUsed && (
          <div style={{ marginTop: 16, fontSize: 13, color: '#3fb950', textAlign: 'center' }}>
            Generated using {modelUsed}. Redirecting to editor…
          </div>
        )}
      </div>
    </div>
  )
}
