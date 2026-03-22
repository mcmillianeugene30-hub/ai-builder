import { createSupabaseServerClient } from '@/lib/supabase-server'
import { listProjects, createProject } from '@/lib/projects'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateProjectInput } from '@/lib/types'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const projects = await listProjects(user.id)
    return NextResponse.json({ data: projects })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient(req)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json() as CreateProjectInput
    if (!body.name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
    const project = await createProject(user.id, body)
    return NextResponse.json({ data: project }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
