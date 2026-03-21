import { redirect } from 'next/navigation'
import { getUser } from '@/lib/get-user'
import { listProjects } from '@/lib/projects'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const projects = await listProjects(user.id)

  return <DashboardClient userId={user.id} userEmail={user.email ?? ''} initialProjects={projects} />
}
