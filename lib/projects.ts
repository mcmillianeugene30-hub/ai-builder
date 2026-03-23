import { supabase } from './supabase-server';
import type { Project, ProjectFile, GeneratedApp } from './types';

export async function createProject(
  userId: string,
  name: string,
  description: string | null = null
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: userId, name, description })
    .select()
    .single();

  if (error) {
    console.error('[projects] Error creating project:', error);
    return null;
  }

  return data as Project;
}

export async function getProject(projectId: string, userId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[projects] Error fetching project:', error);
    return null;
  }

  return data as Project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: Partial<Pick<Project, 'name' | 'description' | 'files'>>
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('[projects] Error updating project:', error);
    return null;
  }

  return data as Project;
}

export async function deleteProject(projectId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', userId);

  if (error) {
    console.error('[projects] Error deleting project:', error);
    return false;
  }

  return true;
}

export async function listProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('[projects] Error listing projects:', error);
    return [];
  }

  return (data ?? []) as Project[];
}

export function seedProjectFromAI(
  app: GeneratedApp,
  userId: string
): { name: string; description: string; files: ProjectFile[] } {
  const files: ProjectFile[] = [];

  // Generate project files from frontend files map
  for (const [path, content] of Object.entries(app.frontend.files)) {
    files.push({ path: `frontend/${path}`, content });
  }

  // Generate backend files from backend files map
  for (const [path, content] of Object.entries(app.backend.files)) {
    files.push({ path: `backend/${path}`, content });
  }

  const frontendFileCount = Object.keys(app.frontend.files).length;
  const backendFileCount = Object.keys(app.backend.files).length;

  return {
    name: 'AI Generated App',
    description: `Generated with ${app.frontend.framework} frontend (${frontendFileCount} files) and ${app.backend.framework} backend (${backendFileCount} files)`,
    files,
  };
}
