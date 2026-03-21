'use client'

import { useState, useEffect } from 'react'
import { signIn } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('message') === 'check_email') {
      setMessage('Check your email to confirm your account.')
    }
    if (params.get('error') === 'auth_failed') {
      setError('Authentication failed. Please try again.')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <main>
      <h1>Sign in</h1>
      {message && <p>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Sign in</button>
      </form>
      <p>
        Don&apos;t have an account? <Link href="/register">Register</Link>
      </p>
    </main>
  )
}
