import { callOpenAI } from './openai';
import { callGroq } from './providers/groq';
import { callOpenRouter } from './providers/openrouter';
import { getProviderForModel, MODEL_FALLBACKS, getModelById } from './models';
import type { AICompletionResponse } from './types';

export class ModelRouterError extends Error {
  constructor(message: string, public readonly modelId: string, public readonly provider: string) {
    super(message);
    this.name = 'ModelRouterError';
  }
}

export async function callModel(
  prompt: string,
  modelId: string,
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const provider = getProviderForModel(modelId);

  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, modelId, maxTokens, temperature);
    case 'groq':
      return callGroq(prompt, modelId, maxTokens, temperature);
    case 'openrouter':
      return callOpenRouter(prompt, modelId, maxTokens, temperature);
    default:
      throw new ModelRouterError(`Unknown provider: ${provider}`, modelId, provider);
  }
}

export async function callWithFallback(
  prompt: string,
  modelId: string,
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const attemptedModels: string[] = [];
  let lastError: Error | null = null;

  const modelsToTry = [modelId, ...(MODEL_FALLBACKS[modelId] ?? [])];

  for (const model of modelsToTry) {
    if (attemptedModels.includes(model)) continue;
    attemptedModels.push(model);

    try {
      return await callModel(prompt, model, maxTokens, temperature);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[ModelRouter] Model ${model} failed: ${lastError.message}`);
    }
  }

  throw new ModelRouterError(
    `All models failed. Last error: ${lastError?.message}`,
    modelId,
    getProviderForModel(modelId)
  );
}
