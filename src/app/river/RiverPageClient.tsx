'use client';

import React from 'react';
import type { RiverCard } from '@/lib/river-types';
import { useRiverFeed } from '@/hooks/useRiverFeed';
import RiverLayout from '@/components/SportsRiver/RiverLayout';
import RiverFeed from '@/components/SportsRiver/RiverFeed';

interface RiverPageClientProps {
  initialCards: RiverCard[];
  initialCursor: string;
}

export default function RiverPageClient({
  initialCards,
  initialCursor,
}: RiverPageClientProps) {
  const {
    riverCards,
    loadMore,
    isLoading,
    hasMore,
    teamFilter,
    feedMode,
    setTeamFilter,
    setFeedMode,
  } = useRiverFeed(initialCards, initialCursor);

  return (
    <RiverLayout
      feedMode={feedMode}
      teamFilter={teamFilter}
      onFeedModeChange={setFeedMode}
      onTeamFilterChange={setTeamFilter}
    >
      <RiverFeed
        riverCards={riverCards}
        loadMore={loadMore}
        isLoading={isLoading}
        hasMore={hasMore}
      />
    </RiverLayout>
  );
}
