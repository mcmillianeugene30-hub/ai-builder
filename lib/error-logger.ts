import { getSupabaseClient } from './supabase-server';
import type { ErrorSeverity } from './types';

export async function logError(
  module: string,
  errorCode: string,
  message: string,
  severity: ErrorSeverity = 'medium',
  userId: string | null = null,
  stack?: string,
  context?: Record<string, unknown>
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('error_logs').insert({
    user_id: userId,
    module,
    error_code: errorCode,
    message,
    stack: stack ?? null,
    context: context ?? null,
    severity,
  });

  if (error) {
    console.error('[error-logger] Failed to log error:', error.message);
  }
}
