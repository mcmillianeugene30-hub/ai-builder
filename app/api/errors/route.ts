import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/supabase-server';
import { logError } from '@/lib/error-logger';

export async function POST(req: NextRequest) {
  const user = await getUser(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { message, stack, context } = body as {
    message?: string;
    stack?: string;
    context?: Record<string, unknown>;
  };

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  await logError(
    'client',
    'CLIENT_ERROR',
    message,
    'medium',
    user?.id ?? null,
    stack ?? undefined,
    context ?? undefined
  );

  return NextResponse.json({ data: { logged: true } });
}
