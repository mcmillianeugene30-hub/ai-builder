import { createSupabaseServerClient } from './supabase-server'
import { GeneratedApp } from './generate'
import { deleteProjectAssets } from './storage'
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectFile,
} from './types'

export async function createProject(
  userId: string,
  input: CreateProjectInput
): Promise<Project> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name: input.name, description: input.description ?? null, files: input.files ?? [] })
    .select()
    .single()

  if (error || !data) throw new Error('Failed to create project')
  return data as Project
}

export async function getProject(
  userId: string,
  projectId: string
): Promise<Project | null> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single()
    return data as Project | null
  } catch {
    return null
  }
}

export async function listProjects(userId: string): Promise<Project[]> {
  try {
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return (data ?? []) as Project[]
  } catch {
    return []
  }
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: UpdateProjectInput
): Promise<Project> {
  const supabase = await createSupabaseServerClient()
  const updates: Record<string, unknown> = {}
  if (input.name !== undefined) updates.name = input.name
  if (input.description !== undefined) updates.description = input.description
  if (input.files !== undefined) updates.files = input.files

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) throw new Error('Failed to update project')
  return data as Project
}

export async function deleteProject(
  userId: string,
  projectId: string
): Promise<void> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId)

  if (error) throw new Error('Failed to delete project')
  await deleteProjectAssets(userId, projectId)
}

export async function seedProjectFromAI(
  userId: string,
  projectName: string,
  generatedApp: GeneratedApp
): Promise<Project> {
  const files: ProjectFile[] = []

  for (const route of generatedApp.backend.routes) {
    files.push({
      name: `route-${route.path.replace(/\//g, '-')}.ts`,
      path: `app/api/${route.path}/route.ts`,
      content: `// ${route.method} ${route.path} — ${route.description}`,
      language: 'typescript',
    })
  }

  for (const page of generatedApp.frontend.pages) {
    files.push({
      name: `page-${page.replace(/\//g, '-')}.tsx`,
      path: `app${page}/page.tsx`,
      content: `// Page: ${page}`,
      language: 'typescript',
    })
  }

  if (generatedApp.database.tables.length > 0) {
    const tableComments = generatedApp.database.tables
      .map((t) => `// Table: ${t.name}`)
      .join('\n')
    files.push({
      name: 'db-schema.ts',
      path: 'lib/db-schema.ts',
      content: `// Database Schema\n${tableComments}`,
      language: 'typescript',
    })
  }

  return createProject(userId, { name: projectName, files })
}
