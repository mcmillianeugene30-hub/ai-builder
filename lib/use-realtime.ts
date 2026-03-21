'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabaseBrowser } from './supabase-browser'
import {
  createProjectChannel,
  subscribeToProjectChanges,
  trackPresence,
  unsubscribeChannel,
} from './realtime'
import { useEditor } from './editor-store'
import { useErrorHandler } from './use-error-handler'
import { createAppError } from './errors'
import type { PresenceState, Collaborator } from './types'

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

export function useRealtime(projectId: string) {
  const { project, loadProject, activeFileIndex } = useEditor()
  const { handleError } = useErrorHandler()
  const [collaborators, setCollaborators] = useState<PresenceState>({})
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<ReturnType<typeof createProjectChannel> | null>(null)
  const userRef = useRef<{ id: string; email: string } | null>(null)
  const presenceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRemoteUpdate = useCallback(
    (payload: { new: { updated_at: string } | null }) => {
      if (!payload.new) return
      if (!project) return

      const remoteTs = new Date(payload.new.updated_at).getTime()
      const localTs = new Date(project.updated_at).getTime()

      if (remoteTs > localTs) {
        loadProject(payload.new as Parameters<typeof loadProject>[0])
      }
    },
    [project, loadProject]
  )

  const handlePresenceSync = useCallback(() => {
    if (!channelRef.current) return
    const state = channelRef.current.presenceState<Collaborator>()
    const mapped: PresenceState = {}
    for (const [userId, presences] of Object.entries(state)) {
      if (presences.length > 0) {
        mapped[userId] = presences[0]
      }
    }
    setCollaborators(mapped)
  }, [])

  const handlePresenceJoin = useCallback(
    ({ newPresences }: { newPresences: Collaborator[] }) => {
      setCollaborators((prev) => {
        const next = { ...prev }
        for (const p of newPresences) {
          next[p.userId] = p
        }
        return next
      })
    },
    []
  )

  const handlePresenceLeave = useCallback(
    ({ leftPresences }: { leftPresences: Collaborator[] }) => {
      setCollaborators((prev) => {
        const next = { ...prev }
        for (const p of leftPresences) {
          delete next[p.userId]
        }
        return next
      })
    },
    []
  )

  useEffect(() => {
    let cancelled = false

    async function init() {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser()
      if (!user || cancelled) return

      userRef.current = { id: user.id, email: user.email ?? 'unknown' }

      const channel = createProjectChannel(projectId)
      channelRef.current = channel

      subscribeToProjectChanges(channel, handleRemoteUpdate)

      channel.on('presence', { event: 'sync' }, handlePresenceSync)
      channel.on('presence', { event: 'join' }, handlePresenceJoin)
      channel.on('presence', { event: 'leave' }, handlePresenceLeave)

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userRef.current) {
          const color = assignColor(userRef.current.id)
          await trackPresence(channel, {
            userId: userRef.current.id,
            email: userRef.current.email,
            avatarUrl: user.user_metadata?.avatar_url ?? null,
            activeFileIndex: 0,
            lastSeenAt: new Date().toISOString(),
            color,
          })
          if (!cancelled) setIsConnected(true)
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (!cancelled) {
            setIsConnected(false)
            handleError(
              createAppError({
                module: 'REALTIME',
                code: 'REALTIME_DISCONNECTED',
                message: 'Lost connection to real-time sync. Reconnecting…',
                severity: 'low',
              })
            )
          }
        }
      })
    }

    init()

    return () => {
      cancelled = true
      if (channelRef.current) {
        unsubscribeChannel(channelRef.current)
        channelRef.current = null
      }
      setIsConnected(false)
    }
  }, [projectId, handleRemoteUpdate, handlePresenceSync, handlePresenceJoin, handlePresenceLeave, handleError])

  useEffect(() => {
    if (!channelRef.current || !userRef.current) return
    if (presenceDebounceRef.current) {
      clearTimeout(presenceDebounceRef.current)
    }
    presenceDebounceRef.current = setTimeout(() => {
      if (!channelRef.current || !userRef.current) return
      const color = assignColor(userRef.current.id)
      trackPresence(channelRef.current, {
        userId: userRef.current.id,
        email: userRef.current.email,
        avatarUrl: null,
        activeFileIndex,
        lastSeenAt: new Date().toISOString(),
        color,
      })
    }, 1000)

    return () => {
      if (presenceDebounceRef.current) {
        clearTimeout(presenceDebounceRef.current)
      }
    }
  }, [activeFileIndex])

  return { collaborators, isConnected }
}
