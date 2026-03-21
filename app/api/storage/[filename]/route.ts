import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { deleteAsset } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projectId = request.nextUrl.searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  try {
    await deleteAsset(user.id, projectId, params.filename)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
