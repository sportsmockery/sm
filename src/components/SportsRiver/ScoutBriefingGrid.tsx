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

const TEAM_ACCENTS: Record<string, string> = {
  bears: '#C83803',
  bulls: '#CE1141',
  cubs: '#0E3386',
  blackhawks: '#CF0A2C',
  'white-sox': '#6B7280',
};

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
  ];
}

export default function ScoutBriefingGrid() {
  const [briefings, setBriefings] = useState<BriefingItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBriefings(getPlaceholderBriefings());
  }, []);

  if (!mounted || briefings.length === 0) {
    return (
      <div className="mt-2">
        <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl animate-pulse shrink-0"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                width: 210,
                height: 132,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      {/* 4 cards in a row — fixed size, horizontal scroll on smaller screens */}
      <div
        className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide"
      >
        {briefings.map((item, i) => (
          <div
            key={i}
            className="shrink-0"
            style={{ width: 210, minHeight: 120, maxHeight: 140 }}
          >
            <ScoutBriefingCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
