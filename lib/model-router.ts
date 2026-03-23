import { callGroq } from '@/lib/providers/groq'
import { callOpenRouter } from '@/lib/providers/openrouter'
import { callOpenAI } from '@/lib/providers/openai'
import { FALLBACK_CHAIN, getModel } from '@/lib/models'
import type { ModelCallParams, ModelCallResult } from '@/lib/types'

const SYSTEM_PROMPT = `You are an expert app architect. Return ONLY valid JSON. No markdown. No explanation. No code blocks. Raw JSON only.`

export async function callModel(params: ModelCallParams): Promise<ModelCallResult> {
  switch (params.provider) {
    case 'groq':
      return callGroq(params)
    case 'openrouter':
      return callOpenRouter(params)
    case 'openai':
      return callOpenAI(params)
    default:
      throw new Error(`Unknown provider: ${params.provider}`)
  }
}

export async function callWithFallback(
  preferredModelId: string,
  prompt: string
): Promise<ModelCallResult> {
  const preferred = getModel(preferredModelId)

  // Build attempt list: preferred first, then fallback chain, deduplicated
  const seenIds = new Set<string>()
  const attemptList = []

  if (preferred) {
    attemptList.push(preferred)
    seenIds.add(preferred.id)
  }

  for (const model of FALLBACK_CHAIN) {
    if (!seenIds.has(model.id)) {
      attemptList.push(model)
      seenIds.add(model.id)
    }
  }

  let lastError = ''

  for (const model of attemptList) {
    try {
      return await callModel({
        modelId: model.id,
        provider: model.provider,
        prompt,
        systemPrompt: SYSTEM_PROMPT,
        maxTokens: 1500,
        temperature: 0,
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`Model ${model.id} failed:`, msg)
      lastError = msg
    }
  }

  throw new Error(`All models failed. Last error: ${lastError}`)
}
