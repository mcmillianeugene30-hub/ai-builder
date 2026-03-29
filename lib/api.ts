"use client";

import {
  type GeneratedApp,
  type GenerationMeta,
  type ModelOption,
  type Project,
  type ProjectFile,
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

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface DeploymentRecord {
  id: string;
  vercel_id: string;
  status: string;
  url: string | null;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
}

async function safeJsonParse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, init);
    const result = await safeJsonParse(response);

    if (!response.ok) {
      return { error: result.error || `Request failed with status ${response.status}` };
    }

    return { data: result.data as T };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Network request failed" };
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
    return { error: err instanceof Error ? err.message : "Network request failed" };
  }
}

export async function fetchModels(): Promise<ModelsResponse> {
  return request<ModelOption[]>("/api/models");
}

export async function fetchTemplates(): Promise<TemplatesResponse> {
  return request<PromptTemplateOption[]>("/api/templates");
}

export async function login(email: string, password: string): Promise<ApiResponse<{ user: unknown }>> {
  return request<{ user: unknown }>("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string): Promise<ApiResponse<{ user: unknown }>> {
  return request<{ user: unknown }>("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

export async function signOut(): Promise<ApiResponse<{ signedOut: boolean }>> {
  return request<{ signedOut: boolean }>("/api/auth/signout", { method: "POST" });
}

export async function listProjects(): Promise<ApiResponse<Project[]>> {
  return request<Project[]>("/api/projects");
}

export async function createProject(name: string, description?: string): Promise<ApiResponse<Project>> {
  return request<Project>("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function updateProject(
  projectId: string,
  updates: Partial<Pick<Project, "name" | "description" | "files">>
): Promise<ApiResponse<Project>> {
  return request<Project>(`/api/projects/${projectId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
}

export async function triggerDeployment(projectId: string): Promise<ApiResponse<{ deploymentId: string; status: string }>> {
  return request<{ deploymentId: string; status: string }>("/api/deploy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId }),
  });
}

export async function fetchDeployments(projectId: string): Promise<ApiResponse<DeploymentRecord[]>> {
  const params = new URLSearchParams({ projectId });
  return request<DeploymentRecord[]>(`/api/deploy/status?${params.toString()}`);
}

export function scaffoldToProjectFiles(app: GeneratedApp): ProjectFile[] {
  const frontend = Object.entries(app.frontend.files).map(([path, content]) => ({
    path: `frontend/${path}`,
    content,
  }));

  const backend = Object.entries(app.backend.files).map(([path, content]) => ({
    path: `backend/${path}`,
    content,
  }));

  return [...frontend, ...backend];
}

export async function saveGeneratedProject(
  scaffold: GeneratedApp,
  name: string,
  description: string
): Promise<ApiResponse<Project>> {
  const createResponse = await createProject(name, description);
  if (createResponse.error || !createResponse.data) {
    return { error: createResponse.error ?? "Failed to create project" };
  }

  const files = scaffoldToProjectFiles(scaffold);
  return updateProject(createResponse.data.id, { files });
}
