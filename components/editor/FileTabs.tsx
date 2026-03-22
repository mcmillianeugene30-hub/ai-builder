'use client'

import { useEditor } from '@/lib/editor-store'
import { useRealtime } from '@/lib/use-realtime'

export function FileTabs() {
  const { project, activeFileIndex, setActiveFile } = useEditor()
  const { collaborators } = useRealtime(project?.id ?? '')

  if (!project) return null

  const collaboratorIndexes = Object.values(collaborators).map((c) => c.activeFileIndex)

  return (
    <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto">
      {project.files.map((file, i) => {
        const viewers = Object.values(collaborators).filter((c) => c.activeFileIndex === i)
        const hasViewers = viewers.length > 0

        return (
          <button
            key={file.path}
            onClick={() => setActiveFile(i)}
            className={`relative px-4 py-2 text-sm border-r border-[#333] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              i === activeFileIndex
                ? 'bg-[#1e1e1e] text-white font-bold border-b-2 border-b-[#1e1e1e]'
                : 'text-gray-400 hover:bg-[#2d2d2d] hover:text-white'
            }`}
          >
            {file.name}
            {hasViewers && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: viewers[0].color,
                  flexShrink: 0,
                }}
                title={`${viewers.map((v) => v.email).join(', ')} viewing this file`}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
