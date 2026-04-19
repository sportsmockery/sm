/**
 * useRiverFeed — fetches the SM Edge river feed with cursor-based pagination.
 */
import { useState, useCallback, useEffect, useRef } from 'react';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://test.sportsmockery.com';
const PAGE_SIZE = 20;

// ── Types ──────────────────────────────────────────────────────────
export interface RiverCard {
  id: string;
  card_type:
    | 'editorial'
    | 'poll'
    | 'chart'
    | 'hub_update'
    | 'box_score'
    | 'trade_proposal'
    | 'scout_summary'
    | 'trending'
    | 'debate'
    | 'video'
    | 'scout_briefing'
    | 'scout_analysis'
    | 'fan_reactions'
    | 'scout_prediction';
  team: string | null;
  team_color: string | null;
  timestamp: string;
  data: Record<string, any>;
}

export type HeroMode =
  | 'scout_briefing'
  | 'trending'
  | 'game_day'
  | 'scout_live'
  | 'story_universe'
  | 'team_pulse'
  | 'debate';

export interface HeroData {
  mode: HeroMode;
  data: Record<string, any>;
}

interface FeedResponse {
  hero: HeroData | null;
  river_cards: RiverCard[];
  next_cursor: string | null;
  has_more: boolean;
}

interface UseRiverFeedReturn {
  heroData: HeroData | null;
  riverCards: RiverCard[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasMore: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

export function useRiverFeed(teamFilter?: string): UseRiverFeedReturn {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [riverCards, setRiverCards] = useState<RiverCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | null>(null);
  const loadingMoreRef = useRef(false);

  const buildUrl = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (teamFilter) params.set('team', teamFilter);
      if (cursor) params.set('cursor', cursor);

      // Try mobile-specific endpoint first, fall back to /api/feed
      return `${API_BASE_URL}/api/mobile/feed?${params.toString()}`;
    },
    [teamFilter],
  );

  const fetchFeed = useCallback(
    async (cursor?: string | null): Promise<FeedResponse> => {
      const url = buildUrl(cursor);
      let res = await fetch(url);

      // Fallback to generic feed endpoint
      if (!res.ok) {
        const fallback = url.replace('/api/mobile/feed', '/api/feed');
        res = await fetch(fallback);
      }

      if (!res.ok) throw new Error(`Feed fetch failed (${res.status})`);
      return res.json() as Promise<FeedResponse>;
    },
    [buildUrl],
  );

  // Initial load
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchFeed();
        if (cancelled) return;
        setHeroData(data.hero);
        setRiverCards(data.river_cards);
        cursorRef.current = data.next_cursor;
        setHasMore(data.has_more);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? 'Failed to load feed');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fetchFeed]);

  // Pull-to-refresh
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      const data = await fetchFeed();
      setHeroData(data.hero);
      setRiverCards(data.river_cards);
      cursorRef.current = data.next_cursor;
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message ?? 'Failed to refresh feed');
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFeed]);

  // Infinite scroll — load more
  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || !cursorRef.current) return;
    loadingMoreRef.current = true;
    try {
      const data = await fetchFeed(cursorRef.current);
      setRiverCards((prev) => [...prev, ...data.river_cards]);
      cursorRef.current = data.next_cursor;
      setHasMore(data.has_more);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load more');
    } finally {
      loadingMoreRef.current = false;
    }
  }, [fetchFeed, hasMore]);

  return { heroData, riverCards, isLoading, isRefreshing, hasMore, error, refresh, loadMore };
}
