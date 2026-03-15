'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { RiverCard, CardType } from '@/lib/river-types';
import { generateTrackingToken } from '@/lib/river-tokens';

export type RealtimePayload = RealtimePostgresChangesPayload<Record<string, unknown>>;

// ---------------------------------------------------------------------------
// Table-aware filter key mapping for per-card subscriptions
// ---------------------------------------------------------------------------

const TABLE_FILTER_KEY: Record<string, string> = {
  sm_box_scores: 'card_id',
  sm_hub_updates: 'id',
  chat_presence: 'room_id',
};

function getFilterKey(table: string): string {
  return TABLE_FILTER_KEY[table] ?? 'card_id';
}

/**
 * Strip the prefix from a river card_id to recover the raw DB row identifier.
 * e.g. "hub_abc-123" → "abc-123", "box_xyz" → "xyz"
 */
function stripCardIdPrefix(cardId: string): string {
  const idx = cardId.indexOf('_');
  return idx >= 0 ? cardId.slice(idx + 1) : cardId;
}

// ---------------------------------------------------------------------------
// Helpers for building RiverCard from realtime INSERT payloads
// ---------------------------------------------------------------------------

function hubInsertToRiverCard(row: Record<string, unknown>): RiverCard {
  return {
    card_id: `hub_${row.id}`,
    card_type: 'hub_update' as CardType,
    tracking_token: generateTrackingToken(`hub_${row.id}`, 'hub_update', 'anonymous', '', (row.team_slug as string) ?? null),
    timestamp: (row.published_at as string) ?? new Date().toISOString(),
    content: {
      team_slug: row.team_slug,
      category: row.category,
      author_name: row.author_name,
      author_avatar_url: row.author_avatar_url,
      content: row.content,
      confidence_pct: row.confidence_pct,
      is_live: row.is_live,
      reply_count: row.reply_count,
      like_count: row.like_count,
    },
    ui_directives: { accent: '#BC0000' },
  };
}

function boxScoreInsertToRiverCard(row: Record<string, unknown>): RiverCard {
  const cardId = (row.card_id as string) ?? `box_${row.id}`;
  return {
    card_id: cardId,
    card_type: 'box_score' as CardType,
    tracking_token: generateTrackingToken(cardId, 'box_score', 'anonymous', '', (row.team_slug as string) ?? null),
    timestamp: (row.updated_at as string) ?? new Date().toISOString(),
    content: {
      team_slug: row.team_slug,
      home_team_abbr: row.home_team_abbr,
      away_team_abbr: row.away_team_abbr,
      home_team_logo_url: row.home_team_logo_url,
      away_team_logo_url: row.away_team_logo_url,
      home_score: row.home_score,
      away_score: row.away_score,
      game_status: row.game_status,
      quarter_scores: row.quarter_scores,
      top_performers: row.top_performers,
      game_narrative: row.game_narrative,
      game_date: row.game_date,
      target_url: row.target_url,
    },
    ui_directives: { accent: '#BC0000' },
  };
}

type ConnectionState = 'connected' | 'reconnecting' | 'offline';

interface WebSocketContextValue {
  subscribeToCard: (
    cardId: string,
    table: string,
    callback: (payload: RealtimePayload) => void
  ) => void;
  unsubscribeFromCard: (cardId: string) => void;
  connectionState: ConnectionState;
  reconnectedAt: number | null;
  emitInjection: (card: RiverCard) => void;
  onInjection: (callback: (card: RiverCard) => void) => () => void;
}

export const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('offline');
  const [reconnectedAt, setReconnectedAt] = useState<number | null>(null);

  const mainChannelRef = useRef<RealtimeChannel | null>(null);
  const cardChannelsRef = useRef<Map<string, RealtimeChannel>>(new Map());
  const injectionListenersRef = useRef<Set<(card: RiverCard) => void>>(new Set());
  const prevStateRef = useRef<ConnectionState>('offline');
  const backoffMsRef = useRef(1000);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INITIAL_BACKOFF_MS = 1000;
  const MAX_BACKOFF_MS = 8000;

  // Main channel: listen for INSERTs; reconnect with exponential backoff on drop
  useEffect(() => {
    function subscribe() {
      const channel = supabase
        .channel('chicago_breaking')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sm_hub_updates' },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (payload.new && typeof payload.new === 'object') {
              const card = hubInsertToRiverCard(payload.new as Record<string, unknown>);
              injectionListenersRef.current.forEach((cb) => cb(card));
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'sm_box_scores' },
          (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
            if (payload.new && typeof payload.new === 'object') {
              const card = boxScoreInsertToRiverCard(payload.new as Record<string, unknown>);
              injectionListenersRef.current.forEach((cb) => cb(card));
            }
          }
        )
        .subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            backoffMsRef.current = INITIAL_BACKOFF_MS;
            if (
              prevStateRef.current === 'reconnecting' ||
              prevStateRef.current === 'offline'
            ) {
              setReconnectedAt(Date.now());
            }
            prevStateRef.current = 'connected';
            setConnectionState('connected');
            return;
          }

          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            // Guard against re-entry: removeChannel fires CLOSED which re-enters this callback
            if (mainChannelRef.current !== channel) return;
            mainChannelRef.current = null;
            prevStateRef.current = 'reconnecting';
            setConnectionState('reconnecting');
            supabase.removeChannel(channel);

            const delay = backoffMsRef.current;
            backoffMsRef.current = Math.min(backoffMsRef.current * 2, MAX_BACKOFF_MS);

            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectTimeoutRef.current = null;
              subscribe();
            }, delay);
          } else {
            prevStateRef.current = 'offline';
            setConnectionState('offline');
          }
        });

      mainChannelRef.current = channel;
    }

    subscribe();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (mainChannelRef.current) {
        supabase.removeChannel(mainChannelRef.current);
        mainChannelRef.current = null;
      }
    };
  }, []);

  const subscribeToCard = useCallback(
    (cardId: string, table: string, callback: (payload: RealtimePayload) => void) => {
      // Clean up existing subscription for this card if any
      const existing = cardChannelsRef.current.get(cardId);
      if (existing) {
        supabase.removeChannel(existing);
      }

      const filterKey = getFilterKey(table);
      const filterValue = filterKey === 'id' ? stripCardIdPrefix(cardId) : cardId;

      const channel = supabase
        .channel(`card:${cardId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table,
            filter: `${filterKey}=eq.${filterValue}`,
          },
          callback
        )
        .subscribe();

      cardChannelsRef.current.set(cardId, channel);
    },
    []
  );

  const unsubscribeFromCard = useCallback((cardId: string) => {
    const channel = cardChannelsRef.current.get(cardId);
    if (channel) {
      supabase.removeChannel(channel);
      cardChannelsRef.current.delete(cardId);
    }
  }, []);

  // Clean up all card channels on unmount
  useEffect(() => {
    const channels = cardChannelsRef.current;
    return () => {
      channels.forEach((ch) => supabase.removeChannel(ch));
      channels.clear();
    };
  }, []);

  const emitInjection = useCallback((card: RiverCard) => {
    injectionListenersRef.current.forEach((cb) => cb(card));
  }, []);

  const onInjection = useCallback((callback: (card: RiverCard) => void) => {
    injectionListenersRef.current.add(callback);
    return () => {
      injectionListenersRef.current.delete(callback);
    };
  }, []);

  const value: WebSocketContextValue = {
    subscribeToCard,
    unsubscribeFromCard,
    connectionState,
    reconnectedAt,
    emitInjection,
    onInjection,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket(): WebSocketContextValue {
  const ctx = useContext(WebSocketContext);
  if (!ctx) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return ctx;
}
