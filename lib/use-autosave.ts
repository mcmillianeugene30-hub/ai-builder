'use client';

import { useEffect, useRef } from 'react';

const AUTOSAVE_DELAY = 1500;

export function useAutosave(
  files: Array<{ path: string; content: string }>,
  projectId: string,
  onSave: (files: Array<{ path: string; content: string }>) => void,
  isDirty: boolean
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || files.length === 0) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSave(files);
    }, AUTOSAVE_DELAY);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [files, isDirty, onSave]);
}
