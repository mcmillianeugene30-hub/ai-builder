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

function validateSchema(raw: string): GeneratedApp | null {
  try {
    const parsed = JSON.parse(raw) as GeneratedApp
    if (
      !parsed.frontend ||
      !parsed.backend ||
      !parsed.database
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
          'You are a JSON-only machine. Return ONLY valid JSON. No markdown. No explanation.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0,
  })
  return response.choices[0]!.message.content!
}

export async function generateApp(
  prompt: string
): Promise<{ data?: GeneratedApp; error?: string }> {
  const systemPrompt = `Given the following app description, generate a complete project scaffold in JSON format.

Return ONLY this exact JSON structure, nothing else:
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
      console.error(`Attempt ${attempt}: Invalid schema, retrying...`)
    } catch (err) {
      console.error(`Attempt ${attempt} failed:`, err)
    }
  }

  return { error: 'Failed to generate valid output after 3 attempts' }
}
