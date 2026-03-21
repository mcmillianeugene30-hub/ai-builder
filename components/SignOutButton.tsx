'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    const res = await fetch('/api/auth/signout', { method: 'POST' })
    if (res.ok) {
      router.push('/login')
    } else {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleSignOut} disabled={loading} style={{ cursor: loading ? 'not-allowed' : 'pointer' }}>
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
