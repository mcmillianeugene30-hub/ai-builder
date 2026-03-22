import { createSupabaseServerClient } from '@/lib/supabase-server'
import { generateApp } from '@/lib/generate'
import { checkAccess, recordCharge } from '@/lib/billing'
import { PAY_AS_YOU_GO } from '@/lib/pricing'
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

    const email = user?.email ?? ''
    const access = await checkAccess(user.id, email)

    if (!access.allowed) {
      return NextResponse.json(
        { error: access.reason, code: 'NO_SUBSCRIPTION' },
        { status: 402 }
      )
    }

    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const result = await generateApp(prompt)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    const generationResult = result.data!

    if (!access.isAdmin) {
      await recordCharge({
        userId: user.id,
        type: 'ai_generation',
        amountCents: PAY_AS_YOU_GO.aiGeneration.cents,
        description: 'AI generation request',
        referenceId: generationResult ? undefined : undefined,
      })
    }

    return NextResponse.json({
      data: generationResult,
      meta: {
        chargedCents: access.isAdmin
          ? 0
          : PAY_AS_YOU_GO.aiGeneration.cents,
      },
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
