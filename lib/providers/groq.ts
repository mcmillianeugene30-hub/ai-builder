import Groq from 'groq-sdk'
import type { ModelCallParams, ModelCallResult } from '@/lib/types'

function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY')
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

export async function callGroq(params: ModelCallParams): Promise<ModelCallResult> {
  const start = Date.now()
  const groq = getClient()

  const completion = await groq.chat.completions.create({
    model: params.modelId,
    messages: [
      { role: 'system', content: params.systemPrompt },
      { role: 'user', content: params.prompt },
    ],
    max_tokens: params.maxTokens,
    temperature: params.temperature,
  })

  const content = completion.choices[0]?.message?.content ?? ''

  if (!content) {
    throw new Error('Groq returned empty response')
  }

  return {
    content,
    modelId: params.modelId,
    provider: 'groq',
    latencyMs: Date.now() - start,
  }
}
