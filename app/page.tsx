"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GenerationControls } from "@/components/builder/GenerationControls";
import { GeneratedAppView } from "@/components/builder/GeneratedAppView";
import { fetchModels, fetchTemplates, generateApp, saveGeneratedProject } from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
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
  const [savingProject, setSavingProject] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

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
    setSaveMessage(null);

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

  async function handleSaveProject() {
    if (!result) return;
    setSavingProject(true);
    setSaveMessage(null);

    const projectName = `Scaffold ${new Date().toISOString().slice(0, 10)}`;
    const description = `Generated from prompt: ${prompt.slice(0, 120)}`;
    const response = await saveGeneratedProject(result, projectName, description);

    setSavingProject(false);
    if (response.error) {
      setSaveMessage(`Could not save project: ${response.error}`);
      return;
    }

    setSaveMessage("Project saved. Open Dashboard to deploy or manage it.");
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="max-w-5xl mx-auto py-12 px-4">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
            <h1 className="text-4xl font-bold">AI App Builder</h1>
            <div className="flex gap-2">
              <Link className="px-3 py-2 rounded border border-slate-600 hover:border-cyan-400" href={APP_ROUTES.login}>
                Login
              </Link>
              <Link className="px-3 py-2 rounded border border-slate-600 hover:border-cyan-400" href={APP_ROUTES.register}>
                Register
              </Link>
              <Link className="px-3 py-2 rounded bg-cyan-700 hover:bg-cyan-600" href={APP_ROUTES.dashboard}>
                Dashboard
              </Link>
            </div>
          </div>
          <p className="text-slate-400 mb-8">
            Generate scaffolds, save directly to projects, then deploy from the dashboard (live on your Vercel domain).
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
              <h2 className="text-lg font-semibold mb-3">Phase 1 progress</h2>
              <ul className="space-y-2 text-sm text-slate-300 list-disc pl-5">
                <li>Auth pages for login/register routes.</li>
                <li>Dashboard for projects + deploy operations.</li>
                <li>Save generated scaffold directly as a project.</li>
                <li>Deploy status visibility per project from dashboard.</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="p-4 mt-6 bg-red-900/40 border border-red-700 rounded-lg mb-6">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <h2 className="text-2xl font-bold">Generated Scaffold</h2>
                <button
                  onClick={handleSaveProject}
                  disabled={savingProject}
                  className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-sm font-semibold"
                >
                  {savingProject ? "Saving..." : "Save as Project"}
                </button>
                <Link className="text-sm text-cyan-300 underline" href={APP_ROUTES.dashboard}>
                  Open Dashboard
                </Link>
              </div>

              {saveMessage && <p className="text-sm text-cyan-300">{saveMessage}</p>}
              <GeneratedAppView data={result} meta={meta} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
