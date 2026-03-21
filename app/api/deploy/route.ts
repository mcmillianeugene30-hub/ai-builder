import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/get-user"
import { deployProject } from "@/lib/deploy"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { projectId } = await req.json()
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

  try {
    const result = await deployProject(user.id, projectId)
    return NextResponse.json({ data: result })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Deployment failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}