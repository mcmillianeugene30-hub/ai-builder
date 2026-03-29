"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { fetchModels, fetchTemplates, generateApp } from "@/lib/api";
import type {
  GeneratedApp,
  GenerationMeta,
  ModelOption,
  PromptTemplateOption,
} from "@/lib/types";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_MAX_TOKENS = 1500;
const DEFAULT_TEMPERATURE = 0;

function AppDisplay({ data, meta }: { data: GeneratedApp; meta: GenerationMeta | null }) {
  const frontendFiles = Object.keys(data.frontend.files);
  const backendFiles = Object.keys(data.backend.files);

  return (
    <div className="space-y-6">
      {meta && (
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4 text-sm text-slate-200">
          <h3 className="font-semibold text-cyan-300 mb-2">Generation Details</h3>
          <div className="grid sm:grid-cols-3 gap-2">
            <p>
              <span className="text-slate-400">Model:</span> {meta.model}
            </p>
            <p>
              <span className="text-slate-400">Provider:</span> {meta.provider}
            </p>
            <p>
              <span className="text-slate-400">Attempt:</span> {meta.attempt}
            </p>
          </div>
          {meta.usage?.total_tokens ? (
            <p className="mt-2 text-slate-300">
              Tokens: {meta.usage.prompt_tokens ?? 0} prompt + {meta.usage.completion_tokens ?? 0} output =
              {" "}
              {meta.usage.total_tokens} total
            </p>
          ) : null}
        </div>
      )}

      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-cyan-400 mb-2">Frontend</h3>
        <p>
          <span className="text-slate-400">Framework:</span> {data.frontend.framework}
        </p>
        <p>
          <span className="text-slate-400">Files ({frontendFiles.length}):</span>{" "}
          {frontendFiles.slice(0, 5).join(", ")}
          {frontendFiles.length > 5 ? "…" : ""}
        </p>
      </div>

      <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-green-400 mb-2">Backend</h3>
        <p>
          <span className="text-slate-400">Framework:</span> {data.backend.framework}
        </p>
        <p>
          <span className="text-slate-400">Files ({backendFiles.length}):</span>{" "}
          {backendFiles.slice(0, 5).join(", ")}
          {backendFiles.length > 5 ? "…" : ""}
        </p>
      </div>

      {data.database && (
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">Database</h3>
          <p>
            <span className="text-slate-400">Schema:</span> {data.database.schema ?? "None"}
          </p>
          <p>
            <span className="text-slate-400">Migrations ({data.database.migrations?.length ?? 0}):</span>{" "}
            {(data.database.migrations ?? []).slice(0, 3).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [models, setModels] = useState<ModelOption[]>([]);
  const [templates, setTemplates] = useState<PromptTemplateOption[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS);
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);

  const [result, setResult] = useState<GeneratedApp | null>(null);
  const [meta, setMeta] = useState<GenerationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [modelsResponse, templatesResponse] = await Promise.all([fetchModels(), fetchTemplates()]);

      if (modelsResponse.data) {
        setModels(modelsResponse.data);
      } else if (modelsResponse.error) {
        setError(modelsResponse.error);
      }

      if (templatesResponse.data) {
        setTemplates(templatesResponse.data);
      } else if (templatesResponse.error) {
        setError((prev) => prev ?? templatesResponse.error ?? null);
      }
    }

    loadData();
  }, []);

  const canSubmit = useMemo(() => !loading && prompt.trim().length > 0, [loading, prompt]);

  function applyTemplate(templateId: string) {
    setSelectedTemplateId(templateId);
    const template = templates.find((item) => item.id === templateId);
    if (template) {
      setPrompt(template.prompt);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setMeta(null);

    try {
      const response = await generateApp(prompt, {
        modelId: selectedModel,
        maxTokens,
        temperature,
      });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setResult(response.data);
        setMeta(response.meta ?? null);
      } else {
        setError("No scaffold data returned.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error while generating scaffold.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <h1 className="text-4xl font-bold text-center mb-2">AI App Builder</h1>
          <p className="text-slate-400 text-center mb-8">
            Faster prompt-to-scaffold workflow with starter templates, model controls, and generation telemetry.
          </p>

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5">
              <label className="block text-sm text-slate-300 mb-2" htmlFor="prompt">
                App prompt
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your app..."
                className="w-full p-4 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-4"
                rows={8}
                disabled={loading}
              />

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                    disabled={loading}
                  >
                    {(models.length > 0 ? models : [{ id: DEFAULT_MODEL, name: "GPT-4o Mini", provider: "openai", contextWindow: 128000 }]).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Starter template</label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => applyTemplate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                    disabled={loading}
                  >
                    <option value="">Custom prompt</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-5">
                <label className="text-sm text-slate-300">
                  Max tokens: <span className="text-cyan-300">{maxTokens}</span>
                  <input
                    type="range"
                    min={300}
                    max={4000}
                    step={100}
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="w-full mt-2"
                    disabled={loading}
                  />
                </label>

                <label className="text-sm text-slate-300">
                  Temperature: <span className="text-cyan-300">{temperature.toFixed(1)}</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.1}
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full mt-2"
                    disabled={loading}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
              >
                {loading ? "Generating..." : "Generate App Scaffold"}
              </button>
            </form>

            <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-lg font-semibold mb-3">Debug & UX checklist</h2>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                <li>Template picker to reduce blank-page friction.</li>
                <li>Model and token controls wired into `/api/generate` payload.</li>
                <li>Temperature slider to tune deterministic vs creative output.</li>
                <li>Safer submit flow with `try/finally` loading reset.</li>
                <li>Generation metadata display for debugging provider/model routing.</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="p-4 mt-6 bg-red-900/40 border border-red-700 rounded-lg mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Generated Scaffold</h2>
              <AppDisplay data={result} meta={meta} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
