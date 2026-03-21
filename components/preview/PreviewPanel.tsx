'use client'

import { useState, useCallback, useEffect } from 'react'
import { useEditor } from '@/lib/editor-store'
import { compileFiles, sanitizeHTML } from '@/lib/preview-compiler'
import { PreviewToolbar } from './PreviewToolbar'

export function PreviewPanel() {
  const { project } = useEditor()
  const [srcdoc, setSrcdoc] = useState('')
  const [hasErrors, setHasErrors] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [lastCompiledAt, setLastCompiledAt] = useState<Date | null>(null)

  const recompile = useCallback(() => {
    const result = compileFiles(project?.files ?? [])
    const safe = sanitizeHTML(result.html)
    setSrcdoc(safe)
    setHasErrors(result.hasErrors)
    setErrorMessage(result.errorMessage)
    setLastCompiledAt(new Date())
  }, [project?.files])

  useEffect(() => {
    recompile()
  }, [recompile])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#1e1e1e',
      }}
    >
      <PreviewToolbar
        hasErrors={hasErrors}
        errorMessage={errorMessage}
        lastCompiledAt={lastCompiledAt}
        onRefresh={recompile}
      />
      <iframe
        srcDoc={srcdoc}
        sandbox="allow-scripts allow-same-origin"
        title="Live Preview"
        style={{ flex: 1, border: 'none', width: '100%' }}
      />
    </div>
  )
}
