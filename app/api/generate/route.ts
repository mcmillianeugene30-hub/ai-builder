import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateApp } from '@/lib/generate'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateApp(prompt)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const generated = result.data!

    // Derive project name from prompt
    const projectName = prompt
      .split(' ')
      .slice(0, 4)
      .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
      .filter(Boolean)
      .join(' ')
      .replace(/^[a-z]/, (c) => c.toUpperCase()) || 'Generated App'

    // Build project files from generated scaffold
    const files = [
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# ${projectName}\n\nGenerated from prompt: "${prompt}"\n\n## Frontend\n\n- Framework: ${generated.frontend.framework}\n- Components: ${generated.frontend.components.join(', ')}\n- Pages: ${generated.frontend.pages.join(', ')}\n\n## Backend\n\n${generated.backend.routes.map((r) => `- ${r.method} ${r.path} — ${r.description}`).join('\n')}\n\n## Database\n\n${generated.database.tables.map((t) => `### ${t.name}\n\n${t.columns.map((c) => `- ${c.name}: ${c.type}`).join('\n')}`).join('\n\n')}`,
      },
    ]

    // Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: projectName,
        description: prompt,
        files,
      })
      .select()
      .single()

    if (projectError || !project) {
      console.error('Failed to create project:', projectError)
      return NextResponse.json({ error: 'Failed to save generated project' }, { status: 500 })
    }

    return NextResponse.json({ data: { projectId: project.id } })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
