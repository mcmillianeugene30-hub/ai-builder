import type { ModelCallParams, ModelCallResult } from '@/lib/types'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function requireOpenRouterKey(): string {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('Missing OPENROUTER_API_KEY')
  }
  return process.env.OPENROUTER_API_KEY
}

export async function callOpenRouter(params: ModelCallParams): Promise<ModelCallResult> {
  const start = Date.now()
  const apiKey = requireOpenRouterKey()

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://ai-builder.vercel.app',
      'X-Title': 'AI Builder',
    },
    body: JSON.stringify({
      model: params.modelId,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.prompt },
      ],
      max_tokens: params.maxTokens,
      temperature: params.temperature,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const content = data.choices?.[0]?.message?.content ?? ''

  if (!content) {
    throw new Error('OpenRouter returned empty response')
  }

  return {
    content,
    modelId: params.modelId,
    provider: 'openrouter',
    latencyMs: Date.now() - start,
  }
}
