import OpenAI from 'openai';
import type { AICompletionResponse, GeneratedApp } from './types';

const client = new OpenAI();

export async function callOpenAI(
  prompt: string,
  modelId: string = 'gpt-4o-mini',
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [
      {
        role: 'system',
        content:
          'You are an app scaffold generator. Return ONLY valid JSON with no markdown or explanation. ' +
          'Structure: { frontend: { framework, language, styling, components, features }, ' +
          'backend: { framework, language, apiRoutes, features }, ' +
          'database: { orm, entities, relations } }',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  return {
    content: response.choices[0].message.content ?? '',
    model: modelId,
    provider: 'openai',
    usage: response.usage ? {
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
      total_tokens: response.usage.total_tokens,
    } : undefined,
  };
}

export function validateSchema(raw: string): GeneratedApp | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed.frontend &&
      parsed.backend &&
      parsed.database &&
      typeof parsed.frontend.framework === 'string' &&
      typeof parsed.backend.framework === 'string' &&
      typeof parsed.database.orm === 'string'
    ) {
      return parsed as GeneratedApp;
    }
    return null;
  } catch {
    return null;
  }
}
