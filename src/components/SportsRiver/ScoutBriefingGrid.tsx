'use client';

import React, { useEffect, useState } from 'react';
import ScoutBriefingCard, { type BriefingCardType } from './ScoutBriefingCard';

interface BriefingItem {
  type: BriefingCardType;
  title: string;
  value: string;
  detail?: string;
  teamAccent?: string;
  timestamp?: string;
  href?: string;
  confidence?: number;
  sentiment?: { positive: number; negative: number };
  trendDirection?: 'up' | 'down' | 'neutral';
  isLive?: boolean;
}

// Team accent colors — only used as micro-accents
const TEAM_ACCENTS: Record<string, string> = {
  bears: '#C83803',
  bulls: '#CE1141',
  cubs: '#0E3386',
  blackhawks: '#CF0A2C',
  'white-sox': '#6B7280',
};

// Static placeholder briefing items — will be replaced with real data
function getPlaceholderBriefings(): BriefingItem[] {
  return [
    {
      type: 'latest_news',
      title: 'Bears OTA dates announced for June',
      value: 'Mandatory minicamp June 10-12',
      teamAccent: TEAM_ACCENTS.bears,
      timestamp: '2h ago',
      href: '/chicago-bears',
    },
    {
      type: 'rumor_meter',
      title: 'Cubs eyeing pitching depth at deadline',
      value: 'Multiple sources report interest in rental arms',
      teamAccent: TEAM_ACCENTS.cubs,
      confidence: 72,
      timestamp: '4h ago',
      href: '/chicago-cubs',
    },
    {
      type: 'fan_pulse',
      title: 'Bulls offseason outlook',
      value: 'Fan sentiment on roster direction',
      teamAccent: TEAM_ACCENTS.bulls,
      sentiment: { positive: 62, negative: 38 },
      timestamp: '1h ago',
    },
    {
      type: 'game_watch',
      title: 'Blackhawks vs Predators',
      value: 'Tonight 7:30 PM CT',
      detail: 'Key matchup: Bedard vs Saros',
      teamAccent: TEAM_ACCENTS.blackhawks,
      isLive: false,
      href: '/chicago-blackhawks',
    },
    {
      type: 'player_trend',
      title: 'Caleb Williams — Stock Rising',
      value: 'Pro Bowl snub fueling offseason motivation',
      teamAccent: TEAM_ACCENTS.bears,
      trendDirection: 'up',
      timestamp: '30m ago',
      href: '/chicago-bears/players',
    },
  ];
}

export default function ScoutBriefingGrid() {
  const [briefings, setBriefings] = useState<BriefingItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load placeholder data — replace with API call later
    setBriefings(getPlaceholderBriefings());
  }, []);

  if (!mounted || briefings.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-xl h-[140px] animate-pulse"
            style={{ backgroundColor: 'var(--sm-card)' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2 mb-3">
        <h3
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--sm-text-muted)' }}
        >
          Scout Briefing
        </h3>
        <div
          className="flex-1 h-px"
          style={{ backgroundColor: 'var(--sm-border)' }}
        />
      </div>

      {/* Desktop: row of 5. Tablet: 3-col. Mobile: horizontal scroll */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
        {briefings.map((item, i) => (
          <ScoutBriefingCard key={i} {...item} />
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {briefings.map((item, i) => (
          <div key={i} className="min-w-[200px] max-w-[240px] flex-shrink-0">
            <ScoutBriefingCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
