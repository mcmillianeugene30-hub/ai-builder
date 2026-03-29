import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { deleteAsset } from '@/lib/storage';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const filename = params.filename;
  if (!filename) {
    return NextResponse.json({ error: 'filename is required' }, { status: 400 });
  }

  const deleted = await deleteAsset(user.id, filename);
  if (!deleted) {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }

  return NextResponse.json({ data: { deleted: true } });
}
