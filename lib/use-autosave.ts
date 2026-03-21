'use client'

import { useEffect, useRef } from 'react'
import { useEditor } from './editor-store'
import { useErrorHandler } from './use-error-handler'
import { createAppError } from './errors'

export function useAutosave(projectId: string) {
  const { project, setSaving, setLastSaved, setError } = useEditor()
  const { handleError } = useErrorHandler()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!project || project.files.length === 0 || !projectId) return

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: project.files }),
        })
        if (!res.ok) throw new Error('Save failed')
        setLastSaved(new Date())
        setError(null)
      } catch (err) {
        setError('Auto-save failed')
        handleError(
          err,
          async () => {
            await fetch(`/api/projects/${projectId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ files: project.files }),
            })
          }
        )
      } finally {
        setSaving(false)
      }
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [project?.files, projectId, handleError, setSaving, setLastSaved, setError])
}
