import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { listAssets, uploadAsset } from '@/lib/storage';

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const assets = await listAssets(user.id);
  return NextResponse.json({ data: assets });
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'file is required as multipart/form-data' }, { status: 400 });
  }

  const filename = sanitizeFilename(file.name);
  const bytes = await file.arrayBuffer();

  const result = await uploadAsset(
    user.id,
    filename,
    Buffer.from(bytes),
    file.type || 'application/octet-stream'
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: { filename, url: result.url } }, { status: 201 });
}
