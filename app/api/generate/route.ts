import { NextRequest, NextResponse } from 'next/server';
import { validateSchema } from '@/lib/openai';
import { callWithFallback } from '@/lib/model-router';
import { getModelById } from '@/lib/models';
import { checkRateLimit } from '@/lib/rate-limit';
import { supabase } from '@/lib/supabase-server';
import type { GeneratedApp, AILogEntry } from '@/lib/types';
import { captureError, captureMessage } from '@/lib/monitoring';

const MAX_ATTEMPTS = 3;
const DEFAULT_MODEL = 'gpt-4o-mini';
const GENERATE_RATE_LIMIT = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;

async function logAttempt(
  prompt: string,
  attempt: number,
  success: boolean,
  rawResponse: string | null,
  errorMessage: string | null,
  model: string
): Promise<void> {
  const entry: AILogEntry = {
    prompt,
    model,
    success,
    attempt,
    raw_response: rawResponse,
    error_message: errorMessage,
  };

  const { error } = await supabase.from('ai_logs').insert(entry);
  if (error) {
    console.error('Failed to log to Supabase:', error);
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const rateLimit = checkRateLimit(ip, GENERATE_RATE_LIMIT, RATE_LIMIT_WINDOW_MS);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${rateLimit.retryAfterSeconds}s.` },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: { prompt?: string; modelId?: string; maxTokens?: number; temperature?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prompt, modelId, maxTokens, temperature } = body;
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  const selectedModel = modelId && getModelById(modelId) ? modelId : DEFAULT_MODEL;
  const selectedMaxTokens =
    typeof maxTokens === 'number' && maxTokens >= 300 && maxTokens <= 4000 ? maxTokens : 1500;
  const selectedTemperature =
    typeof temperature === 'number' && temperature >= 0 && temperature <= 1 ? temperature : 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let raw: string | null = null;
    let validated: GeneratedApp | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await callWithFallback(
        prompt,
        selectedModel,
        selectedMaxTokens,
        selectedTemperature
      );
      raw = response.content;
      validated = validateSchema(raw);

      if (validated) {
        await logAttempt(prompt, attempt, true, raw, null, response.model);
        captureMessage(`Generated app scaffold successfully on attempt ${attempt}`, 'info');
        return NextResponse.json({
          data: validated,
          meta: {
            model: response.model,
            provider: response.provider,
            usage: response.usage ?? null,
            attempt,
          },
        });
      } else {
        errorMessage = 'Schema validation failed';
        captureError(new Error(errorMessage), { prompt, attempt, raw });
        await logAttempt(prompt, attempt, false, raw, errorMessage, selectedModel);
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Attempt ${attempt} failed:`, errorMessage);
      captureError(err, { prompt, attempt });
      await logAttempt(prompt, attempt, false, raw, errorMessage, selectedModel);
    }
  }

  const finalError = new Error('Failed to generate valid scaffold after maximum attempts');
  captureError(finalError, { prompt });
  return NextResponse.json(
    { error: finalError.message },
    { status: 500 }
  );
}
