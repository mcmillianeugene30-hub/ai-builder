export type ModelProvider = 'openai' | 'groq' | 'openrouter';

export interface AIModel {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  supportsCache?: boolean;
}

export const MODELS: AIModel[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000 },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', contextWindow: 128000 },
  { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', contextWindow: 128000 },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', provider: 'groq', contextWindow: 128000 },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', contextWindow: 32768 },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini (OR)', provider: 'openrouter', contextWindow: 128000 },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', contextWindow: 200000 },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'openrouter', contextWindow: 2000000 },
];

export const MODEL_FALLBACKS: Record<string, string[]> = {
  'gpt-4o-mini': ['gpt-4o', 'llama-3.1-70b-versatile'],
  'gpt-4o': ['gpt-4-turbo', 'llama-3.1-70b-versatile'],
  'gpt-4-turbo': ['gpt-4o-mini', 'llama-3.1-70b-versatile'],
  'llama-3.1-70b-versatile': ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  'llama-3.1-8b-instant': ['mixtral-8x7b-32768', 'gpt-4o-mini'],
  'mixtral-8x7b-32768': ['llama-3.1-8b-instant', 'gpt-4o-mini'],
  'openai/gpt-4o-mini': ['anthropic/claude-3.5-sonnet', 'google/gemini-pro-1.5'],
  'anthropic/claude-3.5-sonnet': ['google/gemini-pro-1.5', 'openai/gpt-4o-mini'],
  'google/gemini-pro-1.5': ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o-mini'],
};

export function getModelById(id: string): AIModel | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getProviderForModel(modelId: string): ModelProvider {
  const model = getModelById(modelId);
  return model?.provider ?? 'openai';
}
