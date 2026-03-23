import { callWithFallback } from './model-router';
import { validateSchema } from './validate';
import { supabase } from './supabase-server';
import type { GeneratedApp, AILogStatus } from './types';

const MAX_ATTEMPTS = 3;

interface LogEntry {
  user_id: string | null;
  prompt: string;
  response: Record<string, unknown> | null;
  status: AILogStatus;
  attempt: number;
  model_id: string | null;
  provider: string | null;
  latency_ms: number | null;
}

async function insertLog(entry: LogEntry): Promise<void> {
  const { error } = await supabase.from('ai_logs').insert([entry]);
  if (error) {
    console.error('[generate] Failed to insert ai_logs row:', error.message);
  }
}

export async function generateApp(
  prompt: string,
  modelId: string = 'gpt-4o-mini',
  userId: string | null = null
): Promise<{ data?: GeneratedApp; error?: string }> {
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const start = Date.now();
    let raw = '';
    let callSuccess = false;

    try {
      const result = await callWithFallback(prompt, modelId);
      raw = result.content;
      callSuccess = true;
    } catch (err) {
      const latencyMs = Date.now() - start;
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[generate] attempt ${attempt} OpenAI call failed:`, lastError);

      await insertLog({
        user_id: userId,
        prompt,
        response: null,
        status: 'failed',
        attempt,
        model_id: modelId,
        provider: 'openai',
        latency_ms: latencyMs,
      });

      if (attempt === MAX_ATTEMPTS) {
        return { error: `OpenAI call failed after ${MAX_ATTEMPTS} attempts: ${lastError}` };
      }
      continue;
    }

    const validated = validateSchema(raw);
    const latencyMs = Date.now() - start;

    if (validated) {
      await insertLog({
        user_id: userId,
        prompt,
        response: validated as unknown as Record<string, unknown>,
        status: 'success',
        attempt,
        model_id: modelId,
        provider: 'openai',
        latency_ms: latencyMs,
      });
      return { data: validated };
    }

    console.error(`[generate] attempt ${attempt} Schema validation failed for raw output`);

    await insertLog({
      user_id: userId,
      prompt,
      response: null,
      status: 'retry',
      attempt,
      model_id: modelId,
      provider: 'openai',
      latency_ms: latencyMs,
    });

    lastError = 'Schema validation failed';
  }

  return { error: `Failed after ${MAX_ATTEMPTS} attempts: ${lastError}` };
}
