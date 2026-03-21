'use client'

import { useEffect, useState } from 'react'
import { useEditor } from '@/lib/editor-store'
import { compileFiles, sanitizeHTML } from '@/lib/preview-compiler'

export function PreviewFrame() {
  const { project } = useEditor()
  const [srcdoc, setSrcdoc] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      const result = compileFiles(project?.files ?? [])
      const safe = sanitizeHTML(result.html)
      setSrcdoc(safe)
    }, 500)
    return () => clearTimeout(timer)
  }, [project?.files])

  return (
    <iframe
      srcDoc={srcdoc}
      sandbox="allow-scripts allow-same-origin"
      title="Live Preview"
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  )
}
