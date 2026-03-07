'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { WebSocketContext } from '@/context/WebSocketProvider';
import type { RealtimePayload } from '@/context/WebSocketProvider';

export interface UseGhostUpdateReturn<T> {
  liveData: T;
  isUpdating: boolean;
}

export function useGhostUpdate<T extends Record<string, unknown>>(
  cardId: string,
  initialContent: T,
  table: string
): UseGhostUpdateReturn<T> {
  const ws = useContext(WebSocketContext);
  const [liveData, setLiveData] = useState<T>(initialContent);
  const [isUpdating, setIsUpdating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePatch = useCallback((payload: RealtimePayload) => {
    if (payload.eventType !== 'UPDATE' || !payload.new) return;

    const row = payload.new as Record<string, unknown>;

    // Support structured ghost payloads with patch_data, or fall back to
    // computing a diff of only changed fields from the raw Postgres row.
    let patch: Record<string, unknown>;
    if (row.patch_data && typeof row.patch_data === 'object' && !Array.isArray(row.patch_data)) {
      patch = row.patch_data as Record<string, unknown>;
    } else if (payload.old && typeof payload.old === 'object') {
      // Compute minimal diff: only fields that actually changed
      const old = payload.old as Record<string, unknown>;
      patch = {};
      for (const key of Object.keys(row)) {
        if (JSON.stringify(row[key]) !== JSON.stringify(old[key])) {
          patch[key] = row[key];
        }
      }
    } else {
      // No old row available — use new row but this is the fallback path
      patch = row;
    }

    setLiveData((prev) => ({ ...prev, ...patch }));

    // Clear any existing timer before starting new one
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsUpdating(true);
    timerRef.current = setTimeout(() => {
      setIsUpdating(false);
      timerRef.current = null;
    }, 1500);
  }, []);

  useEffect(() => {
    if (!ws) return;

    ws.subscribeToCard(cardId, table, handlePatch);

    return () => {
      ws.unsubscribeFromCard(cardId);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [ws, cardId, table, handlePatch]);

  // Sync if initialContent identity changes (e.g. parent re-fetch)
  useEffect(() => {
    setLiveData(initialContent);
  }, [initialContent]);

  return { liveData, isUpdating };
}
