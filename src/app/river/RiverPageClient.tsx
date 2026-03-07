'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const previousVisitRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefs = localStorage.getItem('sm_team_prefs');
    const dismissed = localStorage.getItem('sm_picker_dismissed_at');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (prefs === null && (!dismissed || Date.now() - Number(dismissed) > sevenDays)) {
      setShowPicker(true);
    }

    // Read previous visit timestamp before overwriting
    const lastVisit = localStorage.getItem('sm_last_visit');
    if (lastVisit !== null) {
      previousVisitRef.current = Number(lastVisit);
      setIsReturning(true);
    }

    // Write current visit timestamp for next session
    localStorage.setItem('sm_last_visit', String(Date.now()));
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

  // Build the "since last visit" card element to inject at position #3
  const sinceLastVisitElement = isReturning && riverCards.length > 0 ? (
    <SinceLastVisitCard riverCards={riverCards} lastVisitTimestamp={previousVisitRef.current} />
  ) : null;

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
        insertAtIndex2={sinceLastVisitElement}
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
