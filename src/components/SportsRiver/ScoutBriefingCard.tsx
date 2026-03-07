'use client';

import React from 'react';

export type BriefingCardType =
  | 'latest_news'
  | 'rumor_meter'
  | 'fan_pulse'
  | 'game_watch'
  | 'player_trend';

interface ScoutBriefingCardProps {
  type: BriefingCardType;
  title: string;
  value: string;
  detail?: string;
  teamAccent?: string; // team color for micro-accent only
  timestamp?: string;
  href?: string;
  confidence?: number; // 0-100 for rumor meter bar
  sentiment?: { positive: number; negative: number }; // for fan pulse
  trendDirection?: 'up' | 'down' | 'neutral'; // for player trend
  isLive?: boolean;
}

const TYPE_LABELS: Record<BriefingCardType, string> = {
  latest_news: 'Latest',
  rumor_meter: 'Rumor Meter',
  fan_pulse: 'Fan Pulse',
  game_watch: 'Game Watch',
  player_trend: 'Trending',
};

const TYPE_ICONS: Record<BriefingCardType, React.ReactNode> = {
  latest_news: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
    </svg>
  ),
  rumor_meter: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20v-6M6 20V10M18 20V4" />
    </svg>
  ),
  fan_pulse: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  game_watch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  player_trend: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up')
    return (
      <span className="inline-flex items-center text-emerald-400 text-xs font-semibold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
      </span>
    );
  if (direction === 'down')
    return (
      <span className="inline-flex items-center text-red-400 text-xs font-semibold">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
      </span>
    );
  return (
    <span className="inline-flex items-center text-xs font-semibold" style={{ color: 'var(--sm-text-dim)' }}>—</span>
  );
}

export default function ScoutBriefingCard({
  type,
  title,
  value,
  detail,
  teamAccent,
  timestamp,
  href,
  confidence,
  sentiment,
  trendDirection,
  isLive,
}: ScoutBriefingCardProps) {
  const sharedClassName = 'group relative flex flex-col rounded-xl overflow-hidden transition-all duration-200';
  const sharedStyle = {
    background: 'var(--sm-card)',
    border: '1px solid var(--sm-border)',
    cursor: href ? 'pointer' as const : 'default' as const,
  };

  const inner = (
    <>
      {/* 2px top accent — team color micro-accent */}
      <div
        className="h-[2px] w-full"
        style={{ backgroundColor: teamAccent || 'var(--sm-border)' }}
      />

      <div className="p-3 flex flex-col gap-2 flex-1">
        {/* Header row: label + live dot + timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span style={{ color: 'var(--sm-text-dim)' }}>{TYPE_ICONS[type]}</span>
            <span
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              {TYPE_LABELS[type]}
            </span>
            {isLive && (
              <span className="relative flex h-2 w-2 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </div>
          {timestamp && (
            <span
              className="text-[10px]"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              {timestamp}
            </span>
          )}
        </div>

        {/* Title / headline */}
        <h4
          className="text-sm font-bold leading-snug line-clamp-2"
          style={{ color: 'var(--sm-text)' }}
        >
          {title}
        </h4>

        {/* Value / summary */}
        <div className="flex items-center gap-1.5">
          {trendDirection && <TrendArrow direction={trendDirection} />}
          <span
            className="text-xs leading-relaxed"
            style={{ color: 'var(--sm-text-muted)' }}
          >
            {value}
          </span>
        </div>

        {/* Rumor meter bar */}
        {type === 'rumor_meter' && confidence !== undefined && (
          <div className="mt-auto">
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--sm-border)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${confidence}%`,
                  backgroundColor: teamAccent || '#bc0000',
                  opacity: 0.8,
                }}
              />
            </div>
            <span
              className="text-[10px] mt-1 block"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              {confidence}% confidence
            </span>
          </div>
        )}

        {/* Fan pulse sentiment bar */}
        {type === 'fan_pulse' && sentiment && (
          <div className="mt-auto">
            <div
              className="w-full h-1.5 rounded-full overflow-hidden flex"
              style={{ backgroundColor: 'var(--sm-border)' }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${sentiment.positive}%`,
                  backgroundColor: '#10b981',
                  opacity: 0.8,
                }}
              />
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${sentiment.negative}%`,
                  backgroundColor: '#ef4444',
                  opacity: 0.8,
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-emerald-400/80">{sentiment.positive}% positive</span>
              <span className="text-[10px] text-red-400/80">{sentiment.negative}% negative</span>
            </div>
          </div>
        )}

        {/* Detail text */}
        {detail && (
          <p
            className="text-[11px] leading-relaxed line-clamp-1 mt-auto"
            style={{ color: 'var(--sm-text-dim)' }}
          >
            {detail}
          </p>
        )}
      </div>

      {/* Hover ring — subtle */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${teamAccent || 'var(--sm-text-dim)'}20`,
        }}
      />
    </>
  );

  if (href) {
    return (
      <a href={href} className={sharedClassName} style={sharedStyle}>
        {inner}
      </a>
    );
  }

  return (
    <div className={sharedClassName} style={sharedStyle}>
      {inner}
    </div>
  );
}
