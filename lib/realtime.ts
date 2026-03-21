import { RealtimeChannel } from '@supabase/supabase-js'
import { supabaseBrowser } from './supabase-browser'
import type { Collaborator, RealtimePayload } from './types'

export function createProjectChannel(projectId: string): RealtimeChannel {
  return supabaseBrowser().channel(`project:${projectId}`)
}

export function subscribeToProjectChanges(
  channel: RealtimeChannel,
  onUpdate: (payload: RealtimePayload) => void
): void {
  channel.on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'projects',
      filter: `id=eq.${channel.topic.replace('project:', '')}`,
    },
    (payload) => {
      onUpdate(payload as unknown as RealtimePayload)
    }
  )
}

export function trackPresence(
  channel: RealtimeChannel,
  collaborator: Collaborator
): void {
  channel.track(collaborator)
}

export function unsubscribeChannel(channel: RealtimeChannel): void {
  supabaseBrowser().removeChannel(channel)
}
