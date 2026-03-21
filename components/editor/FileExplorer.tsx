'use client'

import { useEditor } from '@/lib/editor-store'

const EXT_ICONS: Record<string, string> = {
  tsx: '⚛',
  ts: '📄',
  jsx: '⚛',
  js: '📄',
  css: '🎨',
  json: '{}',
  md: '📝',
}

function getIcon(name: string): string {
  const ext = name.split('.').pop() ?? ''
  return EXT_ICONS[ext] ?? '📄'
}

export function FileExplorer() {
  const { project, activeFileIndex, setActiveFile } = useEditor()

  if (!project) return null

  return (
    <aside className="w-[200px] bg-[#1e1e1e] border-r border-[#333] flex flex-col overflow-y-auto">
      <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-[#333]">
        Files
      </div>
      <ul className="flex-1 py-1">
        {project.files.map((file, i) => (
          <li key={file.path}>
            <button
              onClick={() => setActiveFile(i)}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                i === activeFileIndex
                  ? 'bg-[#2d2d2d] text-white'
                  : 'text-gray-300 hover:bg-[#252525]'
              }`}
            >
              <span className="text-base">{getIcon(file.name)}</span>
              <span className="truncate">{file.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  )
}
