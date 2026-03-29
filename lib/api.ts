"use client";

import {
  type GeneratedApp,
  type GenerationMeta,
  type ModelOption,
  type PromptTemplateOption,
} from "./types";

interface GenerateResponse {
  data?: GeneratedApp;
  meta?: GenerationMeta;
  error?: string;
}

interface ModelsResponse {
  data?: ModelOption[];
  error?: string;
}

interface TemplatesResponse {
  data?: PromptTemplateOption[];
  error?: string;
}

async function safeJsonParse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function generateApp(
  prompt: string,
  options?: { modelId?: string; maxTokens?: number; temperature?: number }
): Promise<GenerateResponse> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, ...options }),
    });

    const result = await safeJsonParse(response);

    if (!response.ok) {
      return { error: result.error || `Request failed with status ${response.status}` };
    }

    return { data: result.data, meta: result.meta };
  } catch (err) {
    console.error("API client error:", err);
    return { error: err instanceof Error ? err.message : "Failed to connect to server" };
  }
}

export async function fetchModels(): Promise<ModelsResponse> {
  try {
    const response = await fetch("/api/models");
    const result = await safeJsonParse(response);

    if (!response.ok) {
      return { error: result.error || `Failed to load models (${response.status})` };
    }

    return { data: result.data ?? [] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load models" };
  }
}

export async function fetchTemplates(): Promise<TemplatesResponse> {
  try {
    const response = await fetch("/api/templates");
    const result = await safeJsonParse(response);

    if (!response.ok) {
      return { error: result.error || `Failed to load templates (${response.status})` };
    }

    return { data: result.data ?? [] };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to load templates" };
  }
}
