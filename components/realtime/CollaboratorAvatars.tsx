'use client'

import type { PresenceState } from '@/lib/types'

interface CollaboratorAvatarsProps {
  collaborators: PresenceState
  currentUserId: string
}

const MAX_DISPLAY = 5

export function CollaboratorAvatars({
  collaborators,
  currentUserId,
}: CollaboratorAvatarsProps) {
  const others = Object.values(collaborators).filter(
    (c) => c.userId !== currentUserId
  )

  if (others.length === 0) return null

  const visible = others.slice(0, MAX_DISPLAY)
  const overflow = others.length - MAX_DISPLAY

  return (
    <div className="flex items-center gap-1">
      {visible.map((c) => (
        <div
          key={c.userId}
          title={`${c.email} is on file ${c.activeFileIndex + 1}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: c.color,
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: 'white',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {c.email.charAt(0)}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: '#6b7280',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 600,
            color: 'white',
          }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
