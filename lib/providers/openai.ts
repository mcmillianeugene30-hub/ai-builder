import OpenAI from 'openai'
import type { ModelCallParams, ModelCallResult } from '@/lib/types'

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OPENAI_API_KEY')
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function callOpenAI(params: ModelCallParams): Promise<ModelCallResult> {
  const start = Date.now()
  const openai = getClient()

  const completion = await openai.chat.completions.create({
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
    throw new Error('OpenAI returned empty response')
  }

  return {
    content,
    modelId: params.modelId,
    provider: 'openai',
    latencyMs: Date.now() - start,
  }
}
