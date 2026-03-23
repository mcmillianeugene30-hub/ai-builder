'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createProjectChannel, subscribeToProjectChannel, type PresenceState } from './realtime';
import { editorReducer, type EditorAction } from './editor-store';

const PRESENCE_DEBOUNCE = 1000;

export function useRealtime(
  projectId: string,
  userId: string,
  userName: string,
  color: string,
  dispatch: React.Dispatch<EditorAction>
) {
  const channelRef = useRef<ReturnType<typeof createProjectChannel> | null>(null);
  const [collaborators, setCollaborators] = useState<PresenceState[]>([]);
  const lastPresenceUpdate = useRef<number>(0);

  useEffect(() => {
    const channel = createProjectChannel(projectId, userId, userName, color);
    channelRef.current = channel;

    const unsubscribe = subscribeToProjectChannel(
      channel,
      userId,
      userName,
      color,
      (payload) => {
        if (payload.userId !== userId) {
          dispatch({
            type: 'UPDATE_FILE_CONTENT',
            path: payload.filePath,
            content: payload.content,
          });
        }
      },
      (state) => {
        const now = Date.now();
        if (now - lastPresenceUpdate.current < PRESENCE_DEBOUNCE) return;
        lastPresenceUpdate.current = now;

        const allCollaborators: PresenceState[] = [];
        Object.values(state).forEach((users) => {
          allCollaborators.push(...users);
        });
        setCollaborators(allCollaborators.filter((c) => c.userId !== userId));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [projectId, userId, userName, color, dispatch]);

  return { collaborators };
}
