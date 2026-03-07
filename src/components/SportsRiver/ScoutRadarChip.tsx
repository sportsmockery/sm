'use client';

import React from 'react';
import Link from 'next/link';

export interface ScoutRadarChipProps {
  label: string;
  href?: string;
  status?: 'live' | 'rising' | 'neutral';
  accentColor?: string;
}

const statusDotColors: Record<string, string> = {
  live: 'var(--sm-error, #ef4444)',
  rising: 'var(--sm-success, #10b981)',
  neutral: 'var(--sm-text-meta)',
};

export default function ScoutRadarChip({
  label,
  href,
  status = 'neutral',
  accentColor,
}: ScoutRadarChipProps) {
  const dotColor = accentColor || statusDotColors[status] || statusDotColors.neutral;

  const content = (
    <>
      <span
        className="shrink-0 rounded-full"
        style={{
          width: 6,
          height: 6,
          backgroundColor: dotColor,
        }}
        aria-hidden
      />
      <span className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>
        {label}
      </span>
    </>
  );

  const chipClass =
    'flex items-center gap-2 rounded-lg border px-3 py-2.5 shrink-0 transition-colors duration-150';
  const chipStyle: React.CSSProperties = {
    background: 'var(--sm-card)',
    borderColor: 'var(--sm-border)',
    color: 'var(--sm-text)',
  };

  if (href) {
    return (
      <Link
        href={href}
        className={`${chipClass} hover:bg-[var(--sm-card-hover)]`}
        style={chipStyle}
      >
        {content}
      </Link>
    );
  }

  return (
    <span className={chipClass} style={chipStyle}>
      {content}
    </span>
  );
}
