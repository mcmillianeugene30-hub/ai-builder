"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createProject,
  fetchDeployments,
  listProjects,
  signOut,
  triggerDeployment,
} from "@/lib/api";
import { APP_ROUTES } from "@/lib/routes";
import type { Project } from "@/lib/types";

interface DeployState {
  [projectId: string]: {
    loading?: boolean;
    error?: string;
    latestStatus?: string;
    latestUrl?: string | null;
  };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);
  const [deployState, setDeployState] = useState<DeployState>({});

  async function loadProjects() {
    setLoading(true);
    setError(null);

    const response = await listProjects();
    if (response.error) {
      setError(response.error);
      setProjects([]);
    } else {
      setProjects(response.data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const totalFiles = useMemo(
    () => projects.reduce((sum, project) => sum + (project.files?.length ?? 0), 0),
    [projects]
  );

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreating(true);
    const response = await createProject(newProjectName.trim(), "Created from Dashboard");
    setCreating(false);

    if (response.error) {
      setError(response.error);
      return;
    }

    setNewProjectName("");
    await loadProjects();
  }

  async function handleDeploy(projectId: string) {
    setDeployState((prev) => ({ ...prev, [projectId]: { ...prev[projectId], loading: true, error: undefined } }));

    const trigger = await triggerDeployment(projectId);
    if (trigger.error) {
      setDeployState((prev) => ({ ...prev, [projectId]: { ...prev[projectId], loading: false, error: trigger.error } }));
      return;
    }

    const statuses = await fetchDeployments(projectId);
    const latest = statuses.data?.[0];

    setDeployState((prev) => ({
      ...prev,
      [projectId]: {
        ...prev[projectId],
        loading: false,
        latestStatus: latest?.status ?? "queued",
        latestUrl: latest?.url ?? null,
      },
    }));
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = APP_ROUTES.login;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Project Dashboard</h1>
            <p className="text-slate-400 text-sm">Manage projects, trigger deployments, and monitor status.</p>
          </div>
          <div className="flex gap-2">
            <Link className="px-3 py-2 rounded border border-slate-600 hover:border-cyan-400" href={APP_ROUTES.home}>
              New generation
            </Link>
            <button className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        <section className="grid sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-slate-400 text-sm">Total Projects</p>
            <p className="text-2xl font-semibold">{projects.length}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-slate-400 text-sm">Tracked Files</p>
            <p className="text-2xl font-semibold">{totalFiles}</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <p className="text-slate-400 text-sm">Environment</p>
            <p className="text-2xl font-semibold">Vercel Live</p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold mb-3">Create project</h2>
          <form onSubmit={handleCreateProject} className="flex gap-2">
            <input
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="My new app"
              className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2"
            />
            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 px-4 py-2 font-semibold"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </form>
        </section>

        {error && <p className="text-red-300">{error}</p>}

        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
          <h2 className="text-lg font-semibold mb-3">Projects</h2>
          {loading ? (
            <p className="text-slate-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-slate-400">No projects yet. Create one or save a generated scaffold from home.</p>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const status = deployState[project.id];

                return (
                  <div key={project.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-sm text-slate-400">{project.description || "No description"}</p>
                      </div>
                      <button
                        onClick={() => handleDeploy(project.id)}
                        disabled={status?.loading}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 px-3 py-2 text-sm font-semibold"
                      >
                        {status?.loading ? "Deploying..." : "Deploy"}
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Files: {project.files?.length ?? 0}</p>

                    {status?.error && <p className="text-red-300 text-sm mt-2">{status.error}</p>}
                    {status?.latestStatus && (
                      <p className="text-sm mt-2">
                        Status: <span className="text-cyan-300">{status.latestStatus}</span>
                        {status.latestUrl ? (
                          <>
                            {" "}•{" "}
                            <a href={status.latestUrl} target="_blank" className="text-cyan-300 underline" rel="noreferrer">
                              Open deployment
                            </a>
                          </>
                        ) : null}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
