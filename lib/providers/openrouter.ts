import type { AICompletionResponse } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are an app scaffold generator. Return ONLY valid JSON with no markdown. No explanation. The JSON must have these exact top-level keys: project_name, description, key_features, frontend, backend, database.`;

export async function callOpenRouter(
  prompt: string,
  modelId: string = 'openai/gpt-4o-mini',
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://aiappbuild.zo.computer',
      'X-Title': 'AI App Builder',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content ?? '',
    model: modelId,
    provider: 'openrouter',
    usage: data.usage,
  };
}
