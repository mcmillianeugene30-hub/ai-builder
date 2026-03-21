'use client'

import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useEditor } from '@/lib/editor-store'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const LANGUAGE_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  css: 'css',
  json: 'json',
  html: 'html',
  md: 'markdown',
}

function getLanguage(name: string): string {
  const ext = name.split('.').pop() ?? ''
  return LANGUAGE_MAP[ext] ?? 'plaintext'
}

export function CodeEditor() {
  const { project, activeFileIndex, updateFileContent } = useEditor()
  const editorRef = useRef<unknown>(null)

  const file = project?.files[activeFileIndex]

  if (!file) return <div className="flex-1 bg-[#1e1e1e]" />

  return (
    <div className="flex-1 bg-[#1e1e1e]">
      <MonacoEditor
        height="100%"
        language={getLanguage(file.name)}
        theme="vs-dark"
        value={file.content}
        onMount={(editor) => {
          editorRef.current = editor
        }}
        onChange={(value) => {
          updateFileContent(activeFileIndex, value ?? '')
        }}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  )
}
