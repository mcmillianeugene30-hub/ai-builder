import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateApp } from '@/lib/generate'
import { recordCharge, isAdmin } from '@/lib/billing'

async function checkSubscriptionAccess(userId: string): Promise<{ allowed: boolean; error?: string; requiresUpgrade?: boolean }> {
  const supabase = await createSupabaseServerClient()
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id, plan, status, current_period_end')
    .eq('user_id', userId)
    .single()

  const allowedPlans = ['pro', 'premium', 'enterprise']

  if (!sub) {
    return { allowed: false, requiresUpgrade: true }
  }

  if (sub.status === 'canceled' || sub.status === 'past_due') {
    return { allowed: false, error: `Your ${sub.plan} plan is ${sub.status}. Update billing to continue.` }
  }

  if (!allowedPlans.includes(sub.plan)) {
    return { allowed: false, requiresUpgrade: true }
  }

  return { allowed: true }
}

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const access = await checkSubscriptionAccess(user.id)
  if (!access.allowed) {
    return NextResponse.json(
      {
        error: access.error ?? 'Upgrade to Pro to generate apps. Visit /pricing.',
        requiresUpgrade: access.requiresUpgrade ?? false,
      },
      { status: 403 }
    )
  }

  try {
    const { prompt, modelId } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateApp(user.id, prompt, modelId)

    const supabase = await createSupabaseServerClient()

    const projectName =
      prompt
        .split(' ')
        .slice(0, 4)
        .map((w: string) => w.replace(/[^a-zA-Z0-9]/g, ''))
        .filter(Boolean)
        .join(' ')
        .replace(/^[a-z]/, (c: string) => c.toUpperCase()) || 'Generated App'

    const files = [
      {
        name: 'README.md',
        path: 'README.md',
        language: 'markdown',
        content: `# ${projectName}\n\nGenerated from prompt: "${prompt}"\n\n## Frontend\n\n- Framework: ${result.frontend.framework}\n- Components: ${result.frontend.components.join(', ')}\n- Pages: ${result.frontend.pages.join(', ')}\n\n## Backend\n\n${result.backend.routes.map((r) => `- ${r.method} ${r.path} — ${r.description}`).join('\n')}\n\n## Database\n\n${result.database.tables.map((t) => `### ${t.name}\n\n${t.columns.map((c) => `- ${c.name}: ${c.type}`).join('\n')}`).join('\n\n')}`,
      },
    ]

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({ user_id: user.id, name: projectName, description: prompt, files })
      .select()
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Failed to save generated project' }, { status: 500 })
    }

    const costCents = result.costCents

    if (!isAdmin(user.email ?? '')) {
      await recordCharge({
        userId: user.id,
        type: 'purchase',
        amount: costCents,
        credits: null,
        description: `AI generation — ${result.modelUsed}`,
      })
    }

    return NextResponse.json({
      data: { projectId: project.id },
      meta: {
        modelUsed: result.modelUsed,
        chargedCents: isAdmin(user.email ?? '') ? 0 : costCents,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
