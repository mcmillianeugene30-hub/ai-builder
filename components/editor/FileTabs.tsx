'use client'

import { useEditor } from '@/lib/editor-store'

export function FileTabs() {
  const { project, activeFileIndex, setActiveFile } = useEditor()

  if (!project) return null

  return (
    <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto">
      {project.files.map((file, i) => (
        <button
          key={file.path}
          onClick={() => setActiveFile(i)}
          className={`px-4 py-2 text-sm border-r border-[#333] whitespace-nowrap transition-colors ${
            i === activeFileIndex
              ? 'bg-[#1e1e1e] text-white font-bold border-b-2 border-b-[#1e1e1e]'
              : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
          }`}
        >
          {file.name}
        </button>
      ))}
    </div>
  )
}
