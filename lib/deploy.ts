import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase-server';
import type { ProjectFile } from './types';

const VERCEL_API_URL = 'https://api.vercel.com/v13/deployments';

export interface DeploymentResult {
  vercelId: string;
  url: string;
}

export async function createVercelDeployment(
  projectName: string,
  files: ProjectFile[]
): Promise<{ data?: DeploymentResult; error?: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { error: 'VERCEL_API_TOKEN not configured' };

  const teamId = process.env.VERCEL_TEAM_ID;

  const body = {
    name: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    files: files.map((f) => ({
      file: f.path,
      data: f.content,
      encoding: 'utf-8',
    })),
    projectSettings: {
      framework: null,
      buildCommand: 'npm run build',
      outputDirectory: '.next',
      installCommand: 'npm install',
    },
    target: 'production',
    ...(teamId ? { teamId } : {}),
  };

  const response = await fetch(VERCEL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('[deploy] Vercel API error:', response.status, error);
    return { error: `Vercel API error: ${response.status}` };
  }

  const data = await response.json();
  return {
    data: {
      vercelId: data.id,
      url: `https://${data.url}`,
    },
  };
}

export async function pollDeploymentStatus(
  vercelId: string,
  onStatusChange: (status: string) => void,
  maxAttempts: number = 30
): Promise<{ ready: boolean; url?: string; error?: string }> {
  const token = process.env.VERCEL_API_TOKEN;
  if (!token) return { ready: false, error: 'VERCEL_API_TOKEN not configured' };

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`${VERCEL_API_URL}/${vercelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      await new Promise((r) => setTimeout(r, 3000));
      continue;
    }

    const data = await response.json();
    onStatusChange(data.ready ? 'ready' : data.status);

    if (data.ready) {
      return { ready: true, url: `https://${data.url}` };
    }

    if (data.status === 'ERROR' || data.status === 'CANCELED') {
      return { ready: false, error: `Deployment ${data.status.toLowerCase()}` };
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  return { ready: false, error: 'Deployment timed out' };
}

export async function createDeploymentRecord(
  projectId: string,
  userId: string,
  vercelId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('deployments')
    .insert({
      project_id: projectId,
      user_id: userId,
      vercel_id: vercelId,
      status: 'queued',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[deploy] Error creating deployment record:', error);
    return null;
  }

  return data.id;
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: 'queued' | 'building' | 'ready' | 'error' | 'canceled',
  url?: string,
  errorMessage?: string
): Promise<void> {
  await supabase
    .from('deployments')
    .update({ status, url, error_message: errorMessage ?? null })
    .eq('id', deploymentId);
}

export async function listDeployments(projectId: string): Promise<
  Array<{
    id: string;
    status: string;
    url: string | null;
    created_at: string;
  }>
> {
  const { data, error } = await supabase
    .from('deployments')
    .select('id, status, url, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[deploy] Error listing deployments:', error);
    return [];
  }

  return data ?? [];
}
