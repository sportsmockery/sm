'use client';

import React, { useState, useCallback, useEffect } from 'react';
import type { RiverCard } from '@/lib/river-types';
import { useRiverFeed } from '@/hooks/useRiverFeed';
import RiverLayout from '@/components/SportsRiver/RiverLayout';
import RiverFeed from '@/components/SportsRiver/RiverFeed';
import TeamPicker from '@/components/SportsRiver/TeamPicker';
import SinceLastVisitCard from '@/components/SportsRiver/SinceLastVisitCard';

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

  const [showPicker, setShowPicker] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefs = localStorage.getItem('sm_team_prefs');
    const dismissed = localStorage.getItem('sm_picker_dismissed_at');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (prefs === null && (!dismissed || Date.now() - Number(dismissed) > sevenDays)) {
      setShowPicker(true);
    }

    if (prefs !== null && localStorage.getItem('sm_last_visit') !== null) {
      setIsReturning(true);
    }
  }, []);

  const handlePickerComplete = useCallback(
    (teams: string[]) => {
      setShowPicker(false);
      if (teams.length === 1) {
        setTeamFilter(teams[0]);
      } else {
        setTeamFilter('all');
      }
    },
    [setTeamFilter]
  );

  const handlePickerDismiss = useCallback(() => {
    setShowPicker(false);
  }, []);

  return (
    <RiverLayout
      feedMode={feedMode}
      teamFilter={teamFilter}
      onFeedModeChange={setFeedMode}
      onTeamFilterChange={setTeamFilter}
    >
      {/* Since Last Visit card for returning users — injected before feed */}
      {isReturning && riverCards.length > 0 && (
        <div className="mb-4">
          <SinceLastVisitCard riverCards={riverCards} />
        </div>
      )}

      <RiverFeed
        riverCards={riverCards}
        loadMore={loadMore}
        isLoading={isLoading}
        hasMore={hasMore}
      />

      {/* Team picker overlay for first-time anonymous visitors */}
      {showPicker && (
        <TeamPicker
          onComplete={handlePickerComplete}
          onDismiss={handlePickerDismiss}
        />
      )}
    </RiverLayout>
  );
}
