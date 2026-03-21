import { createSupabaseServerClient } from './supabase-server'
import type { AppError } from './types'

export async function logError(params: {
  userId: string | null
  error: AppError
}): Promise<void> {
  try {
    const supabase = await createSupabaseServerClient()

    const stack =
      params.error.stack && params.error.stack.length > 5000
        ? params.error.stack.slice(0, 5000)
        : params.error.stack ?? null

    await supabase.from('error_logs').insert({
      user_id: params.userId,
      module: params.error.module,
      error_code: params.error.code,
      message: params.error.message,
      stack,
      context: params.error.context ?? null,
      severity: params.error.severity,
    })
  } catch (err) {
    console.error('Failed to log error:', err)
  }
}
