"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GenerationControls } from "@/components/builder/GenerationControls";
import { GeneratedAppView } from "@/components/builder/GeneratedAppView";
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
      }

      if (templatesResponse.data) {
        setTemplates(templatesResponse.data);
      }

      const loadError = modelsResponse.error ?? templatesResponse.error;
      if (loadError) {
        setError(loadError);
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
    if (!canSubmit) return;

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

      if (!response.data) {
        setError("No scaffold data returned.");
        return;
      }

      setResult(response.data);
      setMeta(response.meta ?? null);
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
            <GenerationControls
              prompt={prompt}
              setPrompt={setPrompt}
              models={models}
              templates={templates}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={applyTemplate}
              maxTokens={maxTokens}
              setMaxTokens={setMaxTokens}
              temperature={temperature}
              setTemperature={setTemperature}
              loading={loading}
              canSubmit={canSubmit}
              onSubmit={handleSubmit}
            />

            <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5">
              <h2 className="text-lg font-semibold mb-3">Debug & UX checklist</h2>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                <li>Template picker reduces blank-page friction.</li>
                <li>Generation controls map directly to API payload options.</li>
                <li>Model/template API route links verify button destinations.</li>
                <li>Submit flow uses guarded state transitions and reset logic.</li>
                <li>Generation metadata exposes provider/model routing behavior.</li>
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
              <GeneratedAppView data={result} meta={meta} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
