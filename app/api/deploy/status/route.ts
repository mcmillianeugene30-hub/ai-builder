import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/get-user"
import { listDeployments } from "@/lib/deploy"

export async function GET(req: NextRequest) {
  const user = await getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get("projectId")
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 })

  const deployments = await listDeployments(user.id, projectId)
  return NextResponse.json({ data: deployments })
}