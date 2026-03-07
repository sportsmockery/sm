'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import type { RiverCard, RiverFeedResponse } from '@/lib/river-types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useRiverFeed(
  initialCards: RiverCard[],
  initialCursor: string
) {
  const [teamFilter, setTeamFilter] = useState('all');
  const [feedMode, setFeedMode] = useState('for_you');
  const initialCursorRef = useRef(initialCursor);
  // Track whether params have diverged from initial SSR state
  const [paramsChanged, setParamsChanged] = useState(false);

  const getKey = useCallback(
    (pageIndex: number, previousPageData: RiverFeedResponse | null) => {
      if (previousPageData && !previousPageData.feed_meta.has_more) return null;
      const cursor =
        previousPageData?.feed_meta.next_cursor ??
        (pageIndex === 0 ? initialCursorRef.current : '');
      const params = new URLSearchParams({
        cursor,
        team: teamFilter,
        mode: feedMode,
        limit: '20',
      });
      return `/api/river?${params.toString()}`;
    },
    [teamFilter, feedMode]
  );

  const { data, size, setSize, isLoading, isValidating, mutate } =
    useSWRInfinite<RiverFeedResponse>(getKey, fetcher, {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      revalidateOnMount: initialCards.length === 0,
    });

  const riverCards = useMemo(() => {
    const seen = new Set<string>();
    const merged: RiverCard[] = [];

    // When params have changed, ignore SSR initial cards entirely
    if (paramsChanged) {
      if (!data || data.length === 0) return merged;
      for (const page of data) {
        for (const card of page.river_cards) {
          if (!seen.has(card.card_id)) {
            seen.add(card.card_id);
            merged.push(card);
          }
        }
      }
      return merged;
    }

    // Default: prepend initial SSR cards
    if (!data || data.length === 0) {
      for (const card of initialCards) {
        if (!seen.has(card.card_id)) {
          seen.add(card.card_id);
          merged.push(card);
        }
      }
      return merged;
    }

    for (const card of initialCards) {
      if (!seen.has(card.card_id)) {
        seen.add(card.card_id);
        merged.push(card);
      }
    }
    for (const page of data) {
      for (const card of page.river_cards) {
        if (!seen.has(card.card_id)) {
          seen.add(card.card_id);
          merged.push(card);
        }
      }
    }
    return merged;
  }, [data, initialCards, paramsChanged]);

  const hasMore = useMemo(() => {
    if (!data || data.length === 0) return true;
    return data[data.length - 1]?.feed_meta.has_more ?? false;
  }, [data]);

  const loadMore = useCallback(() => {
    if (!isLoading && !isValidating && hasMore) {
      setSize((s) => s + 1);
    }
  }, [isLoading, isValidating, hasMore, setSize]);

  const refresh = useCallback(() => {
    mutate();
  }, [mutate]);

  const handleSetTeamFilter = useCallback(
    (team: string) => {
      setTeamFilter(team);
      setParamsChanged(true);
      initialCursorRef.current = '';
      // Reset to page 1 and clear prior data
      setSize(1);
      mutate(undefined, { revalidate: true });
    },
    [mutate, setSize]
  );

  const handleSetFeedMode = useCallback(
    (mode: string) => {
      setFeedMode(mode);
      setParamsChanged(true);
      initialCursorRef.current = '';
      // Reset to page 1 and clear prior data
      setSize(1);
      mutate(undefined, { revalidate: true });
    },
    [mutate, setSize]
  );

  return {
    riverCards,
    loadMore,
    isLoading: isLoading || isValidating,
    hasMore,
    refresh,
    teamFilter,
    feedMode,
    setTeamFilter: handleSetTeamFilter,
    setFeedMode: handleSetFeedMode,
  };
}
