'use client'

import { useState } from 'react'
import { useEditor } from '@/lib/editor-store'

export function SaveStatus() {
  const { isSaving, lastSavedAt, error, project } = useEditor()
  const [retrying, setRetrying] = useState(false)

  async function handleRetry() {
    if (!project) return
    setRetrying(true)
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: project.files }),
      })
    } finally {
      setRetrying(false)
    }
  }

  function formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="h-8 bg-[#007acc] flex items-center px-4 text-sm text-white gap-2">
      {isSaving || retrying ? (
        <span>Saving…</span>
      ) : error ? (
        <span className="flex items-center gap-2">
          <span className="text-red-300">Save failed</span>
          <button
            onClick={handleRetry}
            className="underline hover:text-red-200 text-xs"
          >
            Retry
          </button>
        </span>
      ) : lastSavedAt ? (
        <span>Saved at {formatTime(lastSavedAt)}</span>
      ) : (
        <span className="opacity-70">No changes</span>
      )}
    </div>
  )
}
