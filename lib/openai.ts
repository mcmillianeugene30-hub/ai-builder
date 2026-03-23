import OpenAI from "openai";
import type { GeneratedApp, AICompletionResponse } from "./types";

const client = new OpenAI();

const SYSTEM_PROMPT =
  "You are an app scaffolding AI. Return ONLY valid JSON. No markdown. No explanation.\n" +
  "Schema: { frontend: { framework: string, files: Record<string,string> }, " +
  "backend: { framework: string, files: Record<string,string> }, " +
  "database?: { schema?: string, migrations?: string[] } }";

export async function generateAppScaffold(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0,
  });

  return response.choices[0].message.content ?? "";
}

// Backward-compatible wrapper for model-router.ts
export async function callOpenAI(
  prompt: string,
  modelId: string = "gpt-4o-mini",
  maxTokens: number = 1500,
  temperature: number = 0
): Promise<AICompletionResponse> {
  const response = await client.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    max_tokens: maxTokens,
    temperature,
  });

  return {
    content: response.choices[0].message.content ?? "",
    model: modelId,
    provider: "openai",
    usage: response.usage
      ? {
          prompt_tokens: response.usage.prompt_tokens,
          completion_tokens: response.usage.completion_tokens,
          total_tokens: response.usage.total_tokens,
        }
      : undefined,
  };
}

export function validateSchema(raw: string): GeneratedApp | null {
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.frontend === "object" &&
      typeof parsed.backend === "object"
    ) {
      return parsed as GeneratedApp;
    }
    return null;
  } catch {
    return null;
  }
}
