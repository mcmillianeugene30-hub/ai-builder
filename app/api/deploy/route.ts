import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { getProject } from '@/lib/projects';
import { checkAccess } from '@/lib/billing';
import {
  createVercelDeployment,
  createDeploymentRecord,
  pollDeploymentStatus,
  updateDeploymentStatus,
} from '@/lib/deploy';
import { recordCharge } from '@/lib/billing';
import { PAY_AS_YOU_GO } from '@/lib/pricing';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { projectId } = body as { projectId?: string };
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  // Billing check
  const access = await checkAccess(user.id, 'deploy');
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: 402 });
  }

  const project = await getProject(projectId, user.id);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  // Create deployment
  const result = await createVercelDeployment(project.name, project.files);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const deploymentId = await createDeploymentRecord(projectId, user.id, result.data!.vercelId);
  if (!deploymentId) {
    return NextResponse.json({ error: 'Failed to create deployment record' }, { status: 500 });
  }

  // Poll status async (fire and forget)
  pollDeploymentStatus(
    result.data!.vercelId,
    (status) => {
      updateDeploymentStatus(
        deploymentId,
        status as 'queued' | 'building' | 'ready' | 'error' | 'canceled',
        status === 'ready' ? result.data!.url : undefined
      ).catch((err) => console.error('[deploy] Status update failed:', err));
    }
  ).catch((err) => console.error('[deploy] Polling failed:', err));

  recordCharge(user.id, 'mobile_build', PAY_AS_YOU_GO.mobileBuild, 'Mobile/Deployment').catch(
    (err) => console.error('[deploy] Failed to record charge:', err)
  );

  return NextResponse.json({
    data: {
      deploymentId,
      vercelId: result.data!.vercelId,
      status: 'queued',
    },
  }, { status: 201 });
}
