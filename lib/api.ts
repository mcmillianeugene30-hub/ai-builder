"use client";

import { type GeneratedApp } from "./types";

interface GenerateResponse {
  data?: GeneratedApp;
  error?: string;
}

export async function generateApp(prompt: string): Promise<GenerateResponse> {
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || `Request failed with status ${response.status}` };
    }

    return { data: result.data };
  } catch (err) {
    console.error("API client error:", err);
    return { error: err instanceof Error ? err.message : "Failed to connect to server" };
  }
}
