import { callWithFallback } from '@/lib/model-router'
import { DEFAULT_MODEL, getModel } from '@/lib/models'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { GeneratedApp } from '@/lib/types'

export type { GeneratedApp }

function stripMarkdown(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export function validateSchema(raw: string): GeneratedApp | null {
  try {
    const cleaned = stripMarkdown(raw)
    const parsed = JSON.parse(cleaned) as GeneratedApp
    if (
      !parsed.frontend ||
      !Array.isArray(parsed.frontend.components) ||
      !Array.isArray(parsed.frontend.pages) ||
      !parsed.backend ||
      !Array.isArray(parsed.backend.routes) ||
      !parsed.database ||
      !Array.isArray(parsed.database.tables)
    ) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

type LogParams = {
  userId: string
  prompt: string
  success: boolean
  modelId: string
  provider: string
  latencyMs: number
  attempt: number
}

async function logGeneration(params: LogParams): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.from('ai_logs').insert({
      user_id:    params.userId,
      prompt:     params.prompt,
      model_id:   params.modelId,
      provider:   params.provider,
      success:    params.success,
      attempt:    params.attempt,
      latency_ms: params.latencyMs,
    })
  } catch (err) {
    console.error('logGeneration error:', err)
  }
}

export async function generateApp(
  userId: string,
  prompt: string,
  modelId?: string
): Promise<GeneratedApp & { modelUsed: string; costCents: number }> {
  const model = modelId ? getModel(modelId) ?? DEFAULT_MODEL : DEFAULT_MODEL

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await callWithFallback(model.id, prompt)
      const parsed = validateSchema(result.content)

      if (parsed) {
        await logGeneration({
          userId,
          prompt,
          success:   true,
          modelId:   result.modelId,
          provider:  result.provider,
          latencyMs: result.latencyMs,
          attempt,
        })

        return {
          ...parsed,
          modelUsed: result.modelId,
          costCents: model.costCents,
        }
      }

      await logGeneration({
        userId,
        prompt,
        success:   false,
        modelId:   result.modelId,
        provider:  result.provider,
        latencyMs: result.latencyMs,
        attempt,
      })
    } catch (err) {
      console.error(`Generation attempt ${attempt} failed:`, err)

      await logGeneration({
        userId,
        prompt,
        success:   false,
        modelId:   model.id,
        provider:  model.provider,
        latencyMs: 0,
        attempt,
      })
    }
  }

  throw new Error('Generation failed after 3 attempts')
}
