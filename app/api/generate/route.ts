import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI, validateSchema } from '@/lib/openai';
import { supabase } from '@/lib/supabase-server';
import type { GeneratedApp, AILogEntry } from '@/lib/types';
import { captureError, captureMessage } from '@/lib/monitoring';

const MAX_ATTEMPTS = 3;
const MODEL = 'gpt-4o-mini';

async function logAttempt(
  prompt: string,
  attempt: number,
  success: boolean,
  rawResponse: string | null,
  errorMessage: string | null
): Promise<void> {
  const entry: AILogEntry = {
    prompt,
    model: MODEL,
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
  let body: { prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string') {
    return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
  }

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let raw: string | null = null;
    let validated: GeneratedApp | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await callOpenAI(prompt);
      raw = response.content;
      validated = validateSchema(raw);

      if (validated) {
        await logAttempt(prompt, attempt, true, raw, null);
        captureMessage(`Generated app scaffold successfully on attempt ${attempt}`, "info");
        return NextResponse.json({ data: validated });
      } else {
        errorMessage = 'Schema validation failed';
        captureError(new Error(errorMessage), { prompt, attempt, raw });
        await logAttempt(prompt, attempt, false, raw, errorMessage);
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Attempt ${attempt} failed:`, errorMessage);
      captureError(err, { prompt, attempt });
      await logAttempt(prompt, attempt, false, raw, errorMessage);
    }
  }

  const finalError = new Error('Failed to generate valid scaffold after maximum attempts');
  captureError(finalError, { prompt });
  return NextResponse.json(
    { error: finalError.message },
    { status: 500 }
  );
}
