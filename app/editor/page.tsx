import { redirect } from 'next/navigation'
import { getUser } from '@/lib/get-user'
import { getProject } from '@/lib/projects'
import EditorApp from './EditorApp'

interface PageProps {
  searchParams: Promise<{ projectId?: string }>
}

export default async function EditorPage({ searchParams }: PageProps) {
  const { projectId } = await searchParams
  if (!projectId) redirect('/projects')

  const user = await getUser()
  if (!user) redirect('/login')

  const project = await getProject(user.id, projectId)
  if (!project) redirect('/projects')

  return <EditorApp project={project} userId={user.id} />
}
