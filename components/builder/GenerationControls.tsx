import Link from "next/link";
import { API_ROUTES } from "@/lib/routes";
import type { ModelOption, PromptTemplateOption } from "@/lib/types";

const FALLBACK_MODEL: ModelOption = {
  id: "gpt-4o-mini",
  name: "GPT-4o Mini",
  provider: "openai",
  contextWindow: 128000,
};

interface GenerationControlsProps {
  prompt: string;
  setPrompt: (value: string) => void;
  models: ModelOption[];
  templates: PromptTemplateOption[];
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  selectedTemplateId: string;
  onSelectTemplate: (id: string) => void;
  maxTokens: number;
  setMaxTokens: (value: number) => void;
  temperature: number;
  setTemperature: (value: number) => void;
  loading: boolean;
  canSubmit: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

export function GenerationControls({
  prompt,
  setPrompt,
  models,
  templates,
  selectedModel,
  setSelectedModel,
  selectedTemplateId,
  onSelectTemplate,
  maxTokens,
  setMaxTokens,
  temperature,
  setTemperature,
  loading,
  canSubmit,
  onSubmit,
}: GenerationControlsProps) {
  const modelOptions = models.length > 0 ? models : [FALLBACK_MODEL];

  return (
    <form onSubmit={onSubmit} className="bg-slate-900/70 border border-slate-700 rounded-2xl p-5">
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
            {modelOptions.map((model) => (
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
            onChange={(e) => onSelectTemplate(e.target.value)}
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

      <div className="flex flex-wrap gap-2 mb-4 text-xs">
        <Link href={API_ROUTES.models} className="px-3 py-1 rounded border border-slate-600 text-slate-200 hover:border-cyan-400">
          Models API
        </Link>
        <Link href={API_ROUTES.templates} className="px-3 py-1 rounded border border-slate-600 text-slate-200 hover:border-cyan-400">
          Templates API
        </Link>
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold transition"
      >
        {loading ? "Generating..." : "Generate App Scaffold"}
      </button>
    </form>
  );
}
