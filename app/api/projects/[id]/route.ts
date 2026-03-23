import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { getProject, updateProject, deleteProject } from '@/lib/projects';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const project = await getProject(params.id, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  return NextResponse.json({ data: project });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, description, files } = body as {
    name?: string;
    description?: string;
    files?: Array<{ path: string; content: string }>;
  };

  const project = await updateProject(params.id, user.id, {
    name,
    description,
    files,
  });

  if (!project) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }

  return NextResponse.json({ data: project });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const deleted = await deleteProject(params.id, user.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: true } });
}
