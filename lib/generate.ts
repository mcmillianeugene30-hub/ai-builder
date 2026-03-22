import { getOpenAI } from './openai'

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

async function callAI(prompt: string): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a JSON-only machine. Return ONLY valid JSON. No markdown. No code fences. No explanation. Start with { and end with }',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4000,
    temperature: 0,
  })
  return response.choices[0]!.message.content!
}

export async function generateApp(
  prompt: string
): Promise<{ data?: GeneratedApp; error?: string }> {
  const systemPrompt = `Given the following app description, generate a complete project scaffold in JSON format.

Return ONLY this exact JSON structure — no markdown, no code fences, nothing else:
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

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callAI(`${systemPrompt}\n\nUser: ${prompt}`)
      const validated = validateSchema(raw)
      if (validated) {
        return { data: validated }
      }
      console.error(`Attempt ${attempt}: Invalid schema, raw:`, raw.slice(0, 200))
    } catch (err: unknown) {
      // Surface OpenAI-specific errors immediately — don't retry
      if (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        typeof (err as Record<string, unknown>).status === 'number'
      ) {
        const status = (err as { status: number }).status
        const message =
          (err as { message?: string }).message ?? 'OpenAI request failed'

        if (status === 429) {
          return { error: 'OpenAI quota exceeded. Please check your plan and billing at platform.openai.com' }
        }
        if (status === 401) {
          return { error: 'OpenAI API key is invalid. Check your OPENAI_API_KEY environment variable.' }
        }
        if (status === 403) {
          return { error: 'OpenAI request forbidden. Check your API key permissions.' }
        }
        console.error(`OpenAI error ${status}: ${message}`)
      } else {
        console.error(`Attempt ${attempt} failed:`, err)
      }
    }
  }

  return { error: 'Failed to generate valid output after 3 attempts' }
}
