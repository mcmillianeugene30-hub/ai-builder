"use client";

import { useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { generateApp } from "@/lib/api";
import { createProject, seedProjectFromAI } from "@/lib/projects";
import { useRouter } from "next/navigation";
import type { GeneratedApp } from "@/lib/types";

function GeneratedAppDisplay({ data }: { data: GeneratedApp }) {
  const frontendFiles = Object.keys(data.frontend.files);
  const backendFiles = Object.keys(data.backend.files);

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Frontend</h3>
            <p className="text-sm text-slate-400">{data.frontend.framework}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Files</p>
            <p className="text-white font-medium">{frontendFiles.length} files</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Features</p>
            <p className="text-white font-medium">{frontendFiles.slice(0, 3).join(", ")}{frontendFiles.length > 3 ? "..." : ""}</p>
          </div>
        </div>
        <div className="mt-4 max-h-48 overflow-y-auto">
          {frontendFiles.slice(0, 5).map((file) => (
            <div key={file} className="flex items-center gap-2 text-sm text-slate-400 py-1">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {file}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Backend</h3>
            <p className="text-sm text-slate-400">{data.backend.framework}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Files</p>
            <p className="text-white font-medium">{backendFiles.length} files</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Features</p>
            <p className="text-white font-medium">{backendFiles.slice(0, 3).join(", ")}{backendFiles.length > 3 ? "..." : ""}</p>
          </div>
        </div>
      </div>

      {data.database && (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Database</h3>
              <p className="text-sm text-slate-400">{data.database.schema ?? "Custom Schema"}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Migrations</p>
            <p className="text-white font-medium">{data.database.migrations?.length ?? 0} migrations</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<GeneratedApp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  async function handleCreateProject() {
    if (!result) return;

    setSaving(true);
    try {
      const { name, description, files } = seedProjectFromAI(result, "user-id");
      const project = await createProject("user-id", name, description);

      if (project) {
        await fetch(`/api/projects/${project.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files }),
        });

        router.push(`/projects/${project.id}`);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-900 text-white">
        <header className="bg-slate-850 border-b border-slate-700">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center cursor-pointer" onClick={() => router.push("/projects")}>
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold">AI App Builder</h1>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => router.push("/projects")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  My Projects
                </button>
                <button onClick={() => router.push("/billing")} className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                  Billing
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold text-white mb-4">
              Build apps with AI
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Describe your app in plain English and get a complete, production-ready scaffold with frontend, backend, and database.
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 mb-8">
            <form onSubmit={handleSubmit}>
              <label htmlFor="prompt" className="block text-sm font-medium text-slate-300 mb-3">
                What would you like to build?
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A task management app with users, projects, tasks, and comments. Users should be able to create projects, add tasks, and invite team members..."
                className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-4 resize-y min-h-[120px] text-lg"
                disabled={loading}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Powered by GPT-4o, Claude, and Llama
                </div>
                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Generate App
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-medium text-red-300">Generation failed</h3>
                  <p className="text-red-400/80 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Generated Scaffold</h3>
                <button
                  onClick={handleCreateProject}
                  disabled={saving}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Project
                    </>
                  )}
                </button>
              </div>
              <GeneratedAppDisplay data={result} />
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
