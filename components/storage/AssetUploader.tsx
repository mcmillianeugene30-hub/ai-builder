'use client'

import { useRef, useState } from 'react'
import type { StoredAsset } from '@/lib/types'

interface AssetUploaderProps {
  projectId: string
  onUploadComplete: (asset: StoredAsset) => void
}

export function AssetUploader({ projectId, onUploadComplete }: AssetUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function upload(file: File) {
    setError(null)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/storage')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      setProgress(null)
      if (xhr.status === 201) {
        const json = JSON.parse(xhr.responseText)
        onUploadComplete(json.data)
      } else {
        try {
          const json = JSON.parse(xhr.responseText)
          setError(json.error ?? 'Upload failed')
        } catch {
          setError('Upload failed')
        }
      }
    }

    xhr.onerror = () => {
      setProgress(null)
      setError('Network error')
    }

    xhr.send(formData)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) upload(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: '2px dashed #888',
          borderRadius: 8,
          padding: '24px 16px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? '#f0f0f0' : 'transparent',
          transition: 'background 0.15s',
        }}
      >
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>
          {progress !== null ? `Uploading… ${progress}%` : 'Drop files here or click to browse'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.woff,.woff2,.ttf"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
      {progress !== null && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 4, background: '#eee', borderRadius: 2 }}>
            <div style={{ height: 4, width: `${progress}%`, background: '#007acc', borderRadius: 2 }} />
          </div>
        </div>
      )}
      {error && <p style={{ marginTop: 8, color: 'red', fontSize: 13 }}>{error}</p>}
    </div>
  )
}
