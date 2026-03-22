import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getProject, updateProject, deleteProject } from '@/lib/projects'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateProjectInput } from '@/lib/types'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const project = await getProject(user.id, id)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ data: project })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const body = await req.json() as UpdateProjectInput
    const project = await updateProject(user.id, id, body)
    return NextResponse.json({ data: project })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createSupabaseServerClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await deleteProject(user.id, id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
