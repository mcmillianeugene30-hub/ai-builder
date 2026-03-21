import { redirect } from 'next/navigation'
import { getUser } from '@/lib/get-user'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
        Dashboard
      </h1>
      <p style={{ color: '#666' }}>Welcome, {user.email}</p>
    </main>
  )
}
