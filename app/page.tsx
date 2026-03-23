"use client";

import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { generateApp } from "@/lib/api";
import type { GeneratedApp } from "@/lib/types";

function AppDisplay({ data }: { data: GeneratedApp }) {
  const frontendFiles = Object.keys(data.frontend.files);
  const backendFiles = Object.keys(data.backend.files);
  const frontendFeatures = frontendFiles.slice(0, 3);
  const backendFeatures = backendFiles.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Frontend</h3>
        <p><span className="text-slate-400">Framework:</span> {data.frontend.framework}</p>
        <p><span className="text-slate-400">Files ({frontendFiles.length}):</span> {frontendFiles.slice(0, 5).join(", ")}{frontendFiles.length > 5 ? "…" : ""}</p>
        <p><span className="text-slate-400">Features:</span> {frontendFeatures.join(", ")}</p>
      </div>

      <div className="bg-slate-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Backend</h3>
        <p><span className="text-slate-400">Framework:</span> {data.backend.framework}</p>
        <p><span className="text-slate-400">Files ({backendFiles.length}):</span> {backendFiles.slice(0, 5).join(", ")}{backendFiles.length > 5 ? "…" : ""}</p>
        <p><span className="text-slate-400">Features:</span> {backendFeatures.join(", ")}</p>
      </div>

      {data.database && (
        <div className="bg-slate-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Database</h3>
          <p><span className="text-slate-400">Schema:</span> {data.database.schema ?? "None"}</p>
          <p><span className="text-slate-400">Migrations ({data.database.migrations?.length ?? 0}):</span> {(data.database.migrations ?? []).slice(0, 3).join(", ")}</p>
        </div>
      )}
    </div>
  );
}

function GenerateButton({ prompt, disabled }: { prompt: string; disabled: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || !prompt.trim()}
      className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold transition"
    >
      {disabled ? "Generating..." : "Generate App Scaffold"}
    </button>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GeneratedApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await generateApp(prompt);

    setLoading(false);

    if (response.error) {
      setError(response.error);
    } else if (response.data) {
      setResult(response.data);
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto py-16 px-4">
          <h1 className="text-4xl font-bold text-center mb-2">AI App Generator</h1>
          <p className="text-slate-400 text-center mb-8">Describe your app and get a full scaffold</p>

          <form onSubmit={handleSubmit} className="mb-8">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your app... (e.g., 'A task management app with users, projects, and comments')"
              className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-4"
              rows={4}
              disabled={loading}
            />
            <div className="flex justify-center">
              <GenerateButton prompt={prompt} disabled={loading} />
            </div>
          </form>

          {error && (
            <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg mb-6">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {result && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Generated Scaffold</h2>
              <AppDisplay data={result} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
