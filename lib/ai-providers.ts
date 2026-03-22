// ─── Unified AI Provider Interface ─────────────────────────────────────────────

export interface AIProvider {
  name: string
  generate(prompt: string, systemPrompt: string): Promise<string>
  isAvailable(): boolean
}

// ─── OpenAI Provider ───────────────────────────────────────────────────────────

export class OpenAIProvider implements AIProvider {
  name = 'OpenAI'

  private get client() {
    const { default: OpenAI } = require('openai')
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  }

  isAvailable() {
    return Boolean(process.env.OPENAI_API_KEY)
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4000,
      temperature: 0,
    })
    return response.choices[0]!.message.content!
  }
}

// ─── Groq Provider (Free fast models) ─────────────────────────────────────────

export class GroqProvider implements AIProvider {
  name = 'Groq'

  private get baseURL() {
    return 'https://api.groq.com/openai/v1'
  }

  private get apiKey() {
    return process.env.GROQ_API_KEY
  }

  isAvailable() {
    return Boolean(this.apiKey)
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices[0]!.message.content!
  }
}

// ─── OpenRouter Provider (Free models) ────────────────────────────────────────

export class OpenRouterProvider implements AIProvider {
  name = 'OpenRouter'

  private get baseURL() {
    return 'https://openrouter.ai/api/v1'
  }

  private get apiKey() {
    return process.env.OPENROUTER_API_KEY
  }

  isAvailable() {
    return Boolean(this.apiKey)
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-builder.vercel.app',
        'X-Title': 'AI App Builder',
      },
      body: JSON.stringify({
        // Use free models only
        model: 'google/gemini-2.0-flash-thinking-exp-01-21',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: 4000,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`OpenRouter error ${response.status}: ${err}`)
    }

    const data = await response.json()
    return data.choices[0]!.message.content!
  }
}

// ─── Google Gemini Provider (Free tier) ────────────────────────────────────────

export class GeminiProvider implements AIProvider {
  name = 'Gemini'

  private get apiKey() {
    return process.env.GEMINI_API_KEY
  }

  isAvailable() {
    return Boolean(this.apiKey)
  }

  async generate(prompt: string, systemPrompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemPrompt}\n\nUser: ${prompt}` },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 4000,
            temperature: 0,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Gemini error ${response.status}: ${err}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('Gemini returned empty response')
    return text
  }
}

// ─── Provider Registry ────────────────────────────────────────────────────────

let _providers: AIProvider[] | null = null

export function getProviders(): AIProvider[] {
  if (!_providers) {
    _providers = [
      new OpenAIProvider(),
      new GroqProvider(),
      new OpenRouterProvider(),
      new GeminiProvider(),
    ].filter((p) => p.isAvailable())
  }
  return _providers
}

export function getAvailableProviders(): string[] {
  return getProviders().map((p) => p.name)
}
