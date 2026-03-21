import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/get-user'
import { logError } from '@/lib/error-logger'
import { createAppError } from '@/lib/errors'
import type { ErrorModule, ErrorSeverity } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const user = await getUser()

    const appError = createAppError({
      module: body.module as ErrorModule,
      code: body.code,
      message: body.message,
      severity: body.severity as ErrorSeverity,
      context: body.context,
      error: body.stack ? new Error(body.message) : undefined,
    })

    await logError({ userId: user?.id ?? null, error: appError })
  } catch {
    // logging must never block the UI
  }

  return NextResponse.json({ success: true })
}
