import type { AICompletionResponse } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are an app scaffold generator. Return ONLY valid JSON with no markdown. No explanation. The JSON must have these exact top-level keys: project_name, description, key_features, frontend, backend, database.`;

export async function callGroq(
  prompt: string,
  modelId: string = 'llama-3.1-70b-versatile',
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
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
    throw new Error(`Groq API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0]?.message?.content ?? '',
    model: modelId,
    provider: 'groq',
    usage: data.usage,
  };
}
