'use client'

import { useEffect, useState } from 'react'
import type { StoredAsset } from '@/lib/types'

interface AssetListProps {
  projectId: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function AssetList({ projectId }: AssetListProps) {
  const [assets, setAssets] = useState<StoredAsset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/storage?projectId=${projectId}`)
      .then((res) => res.json())
      .then((json) => setAssets(json.data ?? []))
      .catch(() => setAssets([]))
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleDelete(name: string) {
    await fetch(`/api/storage/${name}?projectId=${projectId}`, { method: 'DELETE' })
    setAssets((prev) => prev.filter((a) => a.name !== name))
  }

  if (loading) return <p style={{ color: '#666', fontSize: 14 }}>Loading assets…</p>
  if (assets.length === 0) return <p style={{ color: '#999', fontSize: 14 }}>No assets uploaded yet.</p>

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
      {assets.map((asset) => (
        <div key={asset.name} style={{ border: '1px solid #ddd', borderRadius: 6, padding: 8, position: 'relative' }}>
          <button
            onClick={() => handleDelete(asset.name)}
            style={{
              position: 'absolute', top: 4, right: 4,
              background: 'rgba(255,0,0,0.1)', border: 'none', cursor: 'pointer',
              fontSize: 12, padding: '2px 6px', borderRadius: 4, color: '#c00',
            }}
          >
            ✕
          </button>
          {isImage(asset.mimeType) ? (
            <img
              src={asset.signedUrl}
              alt={asset.name}
              style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📄
            </div>
          )}
          <p style={{ margin: '6px 0 0', fontSize: 11, wordBreak: 'break-all', color: '#333' }}>{asset.name}</p>
          <p style={{ margin: 0, fontSize: 10, color: '#999' }}>{formatBytes(asset.size)}</p>
        </div>
      ))}
    </div>
  )
}
