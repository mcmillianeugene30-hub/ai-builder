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
  response: GeneratedApp | null
  status: 'success' | 'failed' | 'retry'
  modelId: string
  provider: string
  latencyMs: number
}

async function logGeneration(params: LogParams): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()
    await supabase.from('ai_logs').insert({
      user_id: params.userId,
      prompt: params.prompt,
      response: params.response as object | null,
      status: params.status,
      model_id: params.modelId,
      provider: params.provider,
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

  for (let i = 0; i < 3; i++) {
    try {
      const result = await callWithFallback(model.id, prompt)
      const parsed = validateSchema(result.content)

      if (parsed) {
        await logGeneration({
          userId,
          prompt,
          response: parsed,
          status: 'success',
          modelId: result.modelId,
          provider: result.provider,
          latencyMs: result.latencyMs,
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
        response: null,
        status: 'retry',
        modelId: result.modelId,
        provider: result.provider,
        latencyMs: result.latencyMs,
      })
    } catch (err) {
      console.error(`Generation attempt ${i + 1} failed:`, err)
    }
  }

  throw new Error('Generation failed after 3 attempts')
}
