import { getProviders, getAvailableProviders } from './ai-providers'

export type GeneratedApp = {
  frontend: {
    framework: string
    components: string[]
    pages: string[]
  }
  backend: {
    routes: {
      method: string
      path: string
      description: string
    }[]
  }
  database: {
    tables: {
      name: string
      columns: {
        name: string
        type: string
        nullable: boolean
      }[]
    }[]
  }
}

function stripMarkdown(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function validateSchema(raw: string): GeneratedApp | null {
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

const SYSTEM_PROMPT = `You are a JSON-only machine. Return ONLY valid JSON. No markdown. No code fences. No explanation. Start with { and end with }.

Return this exact JSON structure:
{
  "frontend": {
    "framework": "string",
    "components": ["string"],
    "pages": ["string"]
  },
  "backend": {
    "routes": [
      { "method": "string", "path": "string", "description": "string" }
    ]
  },
  "database": {
    "tables": [
      {
        "name": "string",
        "columns": [
          { "name": "string", "type": "string", "nullable": boolean }
        ]
      }
    ]
  }
}`

function getErrorMessage(err: unknown, provider: string): string {
  if (typeof err !== 'object' || err === null) return `${provider} request failed`

  const obj = err as Record<string, unknown>

  // OpenAI-style errors
  if ('status' in obj && typeof obj.status === 'number') {
    const status = obj.status as number
    const message = (obj.message as string) ?? `HTTP ${status}`
    if (status === 429) return 'AI quota exceeded. Try again in a moment.'
    if (status === 401) return `${provider} API key is invalid.`
    if (status === 403) return `${provider} access forbidden.`
    return `${provider} error (${status}): ${message}`
  }

  // Groq / OpenRouter fetch errors
  if (typeof obj.message === 'string') return `${provider}: ${obj.message}`
  return `${provider} request failed`
}

export async function generateApp(
  prompt: string
): Promise<{ data?: GeneratedApp; error?: string; provider?: string }> {
  const providers = getProviders()

  if (providers.length === 0) {
    return { error: 'No AI providers configured. Add at least one API key (OpenAI, Groq, OpenRouter, or Gemini).' }
  }

  const availableProviders = getAvailableProviders()
  console.log(`[generate] Available providers: ${availableProviders.join(', ')}`)

  // Try each provider, 1 attempt each
  for (const provider of providers) {
    console.log(`[generate] Trying ${provider.name}...`)
    try {
      const raw = await provider.generate(prompt, SYSTEM_PROMPT)
      const validated = validateSchema(raw)
      if (validated) {
        console.log(`[generate] Success using ${provider.name}`)
        return { data: validated, provider: provider.name }
      }
      console.error(`[generate] ${provider.name} returned invalid schema`)
    } catch (err) {
      const msg = getErrorMessage(err, provider.name)
      console.error(`[generate] ${provider.name} failed: ${msg}`)
      // If it's a hard auth error (bad key), don't try other providers — they're also not configured
      if (msg.includes('invalid') || msg.includes('forbidden') || msg.includes('401') || msg.includes('403')) {
        return { error: msg }
      }
    }
  }

  return {
    error: `All AI providers failed. Available: ${availableProviders.join(', ')}. Add API keys in Vercel environment variables.`,
  }
}
