import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase-browser';

export interface PresenceState {
  userId: string;
  userName: string;
  color: string;
  cursor?: { line: number; column: number };
  activeFile?: string;
  online_at?: string;
}

export function createProjectChannel(
  projectId: string,
  userId: string,
  userName: string,
  color: string
): RealtimeChannel {
  const channel = supabase.channel(`project:${projectId}`, {
    config: {
      presence: { key: userId },
      broadcast: { self: false },
    },
  });

  return channel;
}

export function subscribeToProjectChannel(
  channel: RealtimeChannel,
  userId: string,
  userName: string,
  color: string,
  onFileUpdate: (payload: { filePath: string; content: string; userId: string }) => void,
  onPresenceSync: (state: Record<string, PresenceState[]>) => void
): () => void {
  const subscription = channel
    .on('broadcast', { event: 'file_update' }, (payload) => {
      onFileUpdate(payload.payload as { filePath: string; content: string; userId: string });
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>();
      onPresenceSync(state as Record<string, PresenceState[]>);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          userName,
          color,
          online_at: new Date().toISOString(),
        } satisfies PresenceState);
      }
    });

  return () => {
    channel.unsubscribe();
  };
}

export function broadcastFileUpdate(
  channel: RealtimeChannel,
  filePath: string,
  content: string,
  userId: string
): void {
  channel.send({
    type: 'broadcast',
    event: 'file_update',
    payload: { filePath, content, userId },
  });
}
