'use client';

import React from 'react';
import ScoutRadarChip, { type ScoutRadarChipProps } from './ScoutRadarChip';

const DEFAULT_SIGNALS: ScoutRadarChipProps[] = [
  { label: 'Bears OTA dates announced', href: '/chicago-bears', status: 'neutral' },
  { label: 'Cubs pitching depth rumor rising', href: '/chicago-cubs', status: 'rising' },
  { label: 'Caleb Williams trending', href: '/chicago-bears', status: 'rising' },
  { label: 'Bedard faces Predators tonight', href: '/chicago-blackhawks', status: 'live' },
  { label: 'Bulls offseason sentiment mixed', href: '/chicago-bulls', status: 'neutral' },
];

export interface ScoutRadarProps {
  signals?: ScoutRadarChipProps[];
}

export default function ScoutRadar({ signals = DEFAULT_SIGNALS }: ScoutRadarProps) {
  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
      <div className="flex items-center gap-2 mb-3">
        <h3
          className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
          style={{ color: 'var(--sm-text-meta)', fontSize: 13 }}
        >
          Scout Radar
        </h3>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {signals.map((signal, i) => (
          <div key={i} className="shrink-0">
            <ScoutRadarChip
              label={signal.label}
              href={signal.href}
              status={signal.status}
              accentColor={signal.accentColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
