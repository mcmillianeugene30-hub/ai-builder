'use client'

import type { PresenceState } from '@/lib/types'

interface ActiveFileCursorProps {
  collaborators: PresenceState
  activeFileIndex: number
  currentUserId: string
}

export function ActiveFileCursor({
  collaborators,
  activeFileIndex,
  currentUserId,
}: ActiveFileCursorProps) {
  const onSameFile = Object.values(collaborators).filter(
    (c) => c.userId !== currentUserId && c.activeFileIndex === activeFileIndex
  )

  if (onSameFile.length === 0) return null

  return (
    <div className="flex items-center gap-2 px-4 py-1 bg-[#1e1e1e] border-t border-[#333]">
      {onSameFile.map((c) => (
        <span
          key={c.userId}
          style={{
            backgroundColor: c.color,
            color: 'white',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 9999,
          }}
        >
          {c.email}
        </span>
      ))}
    </div>
  )
}
