'use client'

import { useState } from 'react'
import { signOut } from '@/lib/auth'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)

  async function handleSignOut() {
    setLoading(true)
    await signOut()
  }

  return (
    <button onClick={handleSignOut} disabled={loading}>
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
