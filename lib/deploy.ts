import { createSupabaseServerClient } from "@/lib/supabase-server"
import { getProject } from "@/lib/projects"
import type { ProjectFile, Deployment, DeploymentResult } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────
export type VercelFile = {
  file: string
  data: string
  encoding: "utf8"
}

// ─── Constants ───────────────────────────────────────────────
const VERCEL_API = "https://api.vercel.com"

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN!

if (!VERCEL_TOKEN) {
  throw new Error("Missing VERCEL_API_TOKEN in environment variables")
}

// ─── Helpers ─────────────────────────────────────────────────

// Free personal plan — no team ID needed
// teamQuery() kept as a stub so all endpoint calls stay consistent
function teamQuery(): string {
  return ""
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ─── Vercel request headers ───────────────────────────────────
function vercelHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${VERCEL_TOKEN}`,
    "Content-Type": "application/json"
  }
}

export function prepareFiles(files: ProjectFile[]): VercelFile[] {
  return files
    .filter((f) => f.content !== "")
    .map((f) => ({
      file: f.path,
      data: f.content,
      encoding: "utf8" as const,
    }))
}

export async function createVercelDeployment(
  projectName: string,
  files: VercelFile[]
): Promise<{ vercelId: string; initialUrl: string; initialStatus: string }> {
  const sanitized = projectName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "")

  const res = await fetch(`${VERCEL_API}/v13/deployments${teamQuery()}`, {
    method: "POST",
    headers: vercelHeaders(),
    body: JSON.stringify({
      name: sanitized,
      files,
      projectSettings: { framework: null },
      target: "production",
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Vercel API error: ${res.status} ${body}`)
  }

  const data = await res.json()
  return {
    vercelId: data.id,
    initialUrl: data.url,
    initialStatus: data.status,
  }
}

const STATUS_MAP: Record<string, Deployment["status"]> = {
  QUEUED: "queued",
  BUILDING: "building",
  READY: "ready",
  ERROR: "error",
  CANCELED: "canceled",
}

export async function pollDeploymentStatus(
  vercelId: string
): Promise<{ status: string; url: string | null }> {
  const res = await fetch(`${VERCEL_API}/v13/deployments/${vercelId}${teamQuery()}`, {
    headers: vercelHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Poll failed: ${res.status}`)
  }

  const data = await res.json()
  const status: string = data.status
  return { status, url: data.url ?? null }
}

export async function saveDeployment(params: {
  projectId: string
  userId: string
  vercelId: string
  status: Deployment["status"]
  url?: string
  errorMessage?: string
}): Promise<Deployment> {
  const supabase = await createSupabaseServerClient()

  const upsertData = {
    project_id: params.projectId,
    user_id: params.userId,
    vercel_id: params.vercelId,
    status: params.status,
    url: params.url ?? null,
    error_message: params.errorMessage ?? null,
  }

  const { data, error } = await supabase
    .from("deployments")
    .upsert(upsertData, { onConflict: "vercel_id" })
    .select()
    .single()

  if (error || !data) {
    throw new Error("Failed to save deployment")
  }

  return data as Deployment
}

export async function listDeployments(
  userId: string,
  projectId: string
): Promise<Deployment[]> {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from("deployments")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return data as Deployment[]
}

export async function deployProject(
  userId: string,
  projectId: string
): Promise<DeploymentResult> {
  const project = await getProject(userId, projectId)
  if (!project) throw new Error("Project not found")

  const vercelFiles = prepareFiles(project.files)
  if (vercelFiles.length === 0) throw new Error("No deployable files")

  const { vercelId, initialUrl, initialStatus } = await createVercelDeployment(project.name, vercelFiles)

  const mappedInitial = STATUS_MAP[initialStatus] ?? "queued"

  let deployment = await saveDeployment({
    projectId,
    userId,
    vercelId,
    status: mappedInitial,
    url: initialUrl,
  })

  for (let i = 0; i < 20; i++) {
    await sleep(3000)

    const { status: rawStatus, url } = await pollDeploymentStatus(vercelId)
    const mappedStatus = STATUS_MAP[rawStatus] ?? "queued"

    deployment = await saveDeployment({
      projectId,
      userId,
      vercelId,
      status: mappedStatus,
      url: url ?? undefined,
    })

    if (mappedStatus === "ready") {
      return { deployment, liveUrl: url }
    }
    if (mappedStatus === "error" || mappedStatus === "canceled") {
      throw new Error(`Deployment failed with status: ${mappedStatus}`)
    }
  }

  throw new Error("Deployment timed out after 60 seconds")
}