'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    setLoading(true)
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
    } finally {
      router.push('/login')
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={loading}
      style={{
        padding: '4px 12px',
        fontSize: 13,
        background: 'transparent',
        color: '#8b949e',
        border: '1px solid #30363d',
        borderRadius: 6,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
