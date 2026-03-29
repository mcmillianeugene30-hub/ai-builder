import { NextResponse } from 'next/server';
import { PROMPT_TEMPLATES } from '@/lib/prompt-templates';

export async function GET() {
  return NextResponse.json({ data: PROMPT_TEMPLATES });
}
