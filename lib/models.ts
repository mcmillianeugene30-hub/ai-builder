import type { AIProviderType, AIModel } from '@/lib/types'

export const AI_MODELS: AIModel[] = [
  // ─── GROQ (free tier, fast) ────────────────────────────────────────────────
  {
    id: 'llama-3.1-70b-versatile',
    displayName: 'Llama 3.1 70B',
    provider: 'groq',
    costCents: 15,
    isDefault: true,
    description: 'Fast and capable. Best for most apps.',
  },
  {
    id: 'llama-3.1-8b-instant',
    displayName: 'Llama 3.1 8B',
    provider: 'groq',
    costCents: 15,
    isDefault: false,
    description: 'Fastest response. Good for simple apps.',
  },
  {
    id: 'deepseek-r1-distill-llama-70b',
    displayName: 'DeepSeek R1',
    provider: 'groq',
    costCents: 15,
    isDefault: false,
    description: 'Strong reasoning. Good for complex logic.',
  },

  // ─── OPENROUTER (free tier pool) ──────────────────────────────────────────
  {
    id: 'mistralai/mistral-7b-instruct',
    displayName: 'Mistral 7B',
    provider: 'openrouter',
    costCents: 15,
    isDefault: false,
    description: 'Lightweight and efficient.',
  },
  {
    id: 'google/gemma-2-9b-it:free',
    displayName: 'Gemma 2 9B',
    provider: 'openrouter',
    costCents: 15,
    isDefault: false,
    description: 'Google model, strong instruction following.',
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct',
    displayName: 'Llama 3.2 3B',
    provider: 'openrouter',
    costCents: 15,
    isDefault: false,
    description: 'Ultra fast, minimal cost.',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    displayName: 'Qwen 2.5 72B',
    provider: 'openrouter',
    costCents: 15,
    isDefault: false,
    description: 'Large model, strong code generation.',
  },

  // ─── OPENAI (premium) ──────────────────────────────────────────────────────
  {
    id: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    provider: 'openai',
    costCents: 15,
    isDefault: false,
    description: 'OpenAI quality at standard price.',
  },
  {
    id: 'gpt-4o',
    displayName: 'GPT-4o',
    provider: 'openai',
    costCents: 30,
    isDefault: false,
    description: 'Highest quality. Best for complex apps. $0.30/gen.',
  },
]

export const DEFAULT_MODEL = AI_MODELS.find((m) => m.isDefault)!

export function getModel(modelId: string): AIModel | null {
  return AI_MODELS.find((m) => m.id === modelId) ?? null
}

export function getModelsByProvider(provider: AIProviderType): AIModel[] {
  return AI_MODELS.filter((m) => m.provider === provider)
}

export const FALLBACK_CHAIN: AIModel[] = [
  AI_MODELS.find((m) => m.id === 'llama-3.1-70b-versatile')!,
  AI_MODELS.find((m) => m.id === 'mistralai/mistral-7b-instruct')!,
  AI_MODELS.find((m) => m.id === 'gpt-4o-mini')!,
]
