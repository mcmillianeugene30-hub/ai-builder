'use client'

import { useEffect, useState } from 'react'
import type { Deployment } from '@/lib/types'

interface DeploymentHistoryProps {
  projectId: string
}

const STATUS_COLORS: Record<string, string> = {
  queued: '#718096',
  building: '#d69e2e',
  ready: '#22543d',
  error: '#c53030',
  canceled: '#718096',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function DeploymentHistory({ projectId }: DeploymentHistoryProps) {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [loading, setLoading] = useState(false)

  async function fetchDeployments() {
    setLoading(true)
    try {
      const res = await fetch(`/api/deploy/status?projectId=${projectId}`)
      const json = await res.json()
      if (json.data) setDeployments(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [projectId])

  if (deployments.length === 0 && !loading) {
    return (
      <div style={{ padding: '16px', color: '#666', fontSize: 13 }}>
        No deployments yet.
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px' }}>
        <button onClick={fetchDeployments} disabled={loading} style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}>
          Refresh
        </button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#718096' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#718096' }}>URL</th>
            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#718096' }}>Date</th>
            <th style={{ textAlign: 'left', padding: '8px 16px', color: '#718096' }}>Vercel ID</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((d) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #f7fafc' }}>
              <td style={{ padding: '8px 16px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: STATUS_COLORS[d.status] ?? '#718096',
                    color: '#fff',
                  }}
                >
                  {d.status}
                </span>
              </td>
              <td style={{ padding: '8px 16px' }}>
                {d.status === 'ready' && d.url ? (
                  <a
                    href={`https://${d.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3182ce', textDecoration: 'none' }}
                  >
                    {d.url}
                  </a>
                ) : (
                  <span style={{ color: '#cbd5e0' }}>—</span>
                )}
              </td>
              <td style={{ padding: '8px 16px', color: '#4a5568' }}>{formatDate(d.created_at)}</td>
              <td style={{ padding: '8px 16px', color: '#a0aec0', fontFamily: 'monospace' }}>
                {d.vercel_id.slice(0, 8)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}