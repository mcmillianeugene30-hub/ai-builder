import { NextResponse } from 'next/server'
import { AI_MODELS, DEFAULT_MODEL } from '@/lib/models'

export async function GET() {
  return NextResponse.json({
    data: {
      models: AI_MODELS,
      defaultModelId: DEFAULT_MODEL.id,
    },
  })
}
