'use client'

import { useState } from 'react'
import { useErrorHandler } from '@/lib/use-error-handler'
import { createAppError } from '@/lib/errors'
import type { DeploymentResult } from '@/lib/types'

interface DeployButtonProps {
  projectId: string
  onDeployComplete?: (result: DeploymentResult) => void
}

export function DeployButton({ projectId, onDeployComplete }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [liveUrl, setLiveUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle')
  const { handleError } = useErrorHandler()

  async function handleDeploy() {
    setIsDeploying(true)
    setStatus('deploying')

    try {
      const res = await fetch('/api/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })
      const json = await res.json()

      if (!res.ok) {
        const msg = json.error ?? 'Deployment failed'
        setStatus('error')
        handleError(
          createAppError({
            module: 'DEPLOY',
            code: 'DEPLOY_FAILED',
            message: msg,
            severity: 'high',
          })
        )
        return
      }

      const result: DeploymentResult = json.data
      setLiveUrl(result.liveUrl)
      setStatus('success')
      onDeployComplete?.(result)
    } catch (err) {
      setStatus('error')
      handleError(
        createAppError({
          module: 'DEPLOY',
          code: 'DEPLOY_FAILED',
          message: err instanceof Error ? err.message : 'Network error',
          severity: 'high',
        })
      )
    } finally {
      setIsDeploying(false)
    }
  }

  if (isDeploying) {
    return (
      <span style={{ color: '#666', fontSize: 13 }}>
        Deploying… this may take up to 60s
      </span>
    )
  }

  if (status === 'success' && liveUrl) {
    return (
      <a
        href={`https://${liveUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 12px',
          fontSize: 13,
          background: '#22543d',
          color: '#9ae6b4',
          borderRadius: 4,
          textDecoration: 'none',
        }}
      >
        ✓ Live
      </a>
    )
  }

  return (
    <button
      onClick={handleDeploy}
      style={{
        padding: '4px 12px',
        fontSize: 13,
        background: '#2d3748',
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
      }}
    >
      Deploy
    </button>
  )
}
