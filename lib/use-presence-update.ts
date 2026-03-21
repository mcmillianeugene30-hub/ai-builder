'use client'

import { useEffect, useRef } from 'react'
import { trackPresence } from './realtime'
import { useEditor } from './editor-store'
import type { Collaborator } from './types'

const COLLABORATOR_COLORS = [
  '#F87171',
  '#FB923C',
  '#FBBF24',
  '#34D399',
  '#60A5FA',
  '#A78BFA',
  '#F472B6',
  '#22D3EE',
]

function assignColor(userId: string): string {
  const num = parseInt(userId.replace(/-/g, '').slice(0, 8), 16)
  return COLLABORATOR_COLORS[num % COLLABORATOR_COLORS.length]
}

export function usePresenceUpdate(
  channel: ReturnType<typeof import('./realtime').createProjectChannel> | null,
  user: { id: string; email: string } | null
) {
  const { activeFileIndex } = useEditor()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!channel || !user) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      trackPresence(channel, {
        userId: user.id,
        email: user.email,
        avatarUrl: null,
        activeFileIndex,
        lastSeenAt: new Date().toISOString(),
        color: assignColor(user.id),
      })
    }, 1000)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [channel, user, activeFileIndex])
}
