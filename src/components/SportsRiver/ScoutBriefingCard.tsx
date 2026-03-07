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
  teamAccent?: string;
  timestamp?: string;
  href?: string;
  confidence?: number;
  sentiment?: { positive: number; negative: number };
  trendDirection?: 'up' | 'down' | 'neutral';
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
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z" />
    </svg>
  ),
  rumor_meter: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20v-6M6 20V10M18 20V4" />
    </svg>
  ),
  fan_pulse: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  game_watch: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  player_trend: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
};

function TrendArrow({ direction }: { direction: 'up' | 'down' | 'neutral' }) {
  if (direction === 'up')
    return (
      <span className="inline-flex items-center text-xs font-semibold" style={{ color: 'var(--sm-success)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="18 15 12 9 6 15" /></svg>
      </span>
    );
  if (direction === 'down')
    return (
      <span className="inline-flex items-center text-xs font-semibold" style={{ color: 'var(--sm-error)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9" /></svg>
      </span>
    );
  return <span style={{ color: 'var(--sm-text-meta)' }}>—</span>;
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
  const cardStyle: React.CSSProperties = {
    background: 'var(--sm-surface)',
    border: '1px solid var(--sm-border)',
    borderRadius: 12,
    overflow: 'hidden',
    height: '100%',
    cursor: href ? 'pointer' : 'default',
  };

  const inner = (
    <>
      {/* 2px top accent — team color micro-accent */}
      <div style={{ height: 2, width: '100%', backgroundColor: teamAccent || 'rgba(255,255,255,0.06)' }} />

      <div style={{ padding: 'var(--card-padding-sm, 18px)', display: 'flex', flexDirection: 'column', gap: 8, height: 'calc(100% - 2px)' }}>
        {/* Header: chip + timestamp (meta 13px) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--sm-text-meta)' }}>{TYPE_ICONS[type]}</span>
            <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--sm-text-meta)' }}>
              {TYPE_LABELS[type]}
            </span>
            {isLive && (
              <span className="relative flex h-1.5 w-1.5 ml-1" style={{ color: 'var(--sm-error)' }}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: 'var(--sm-error)' }} />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ backgroundColor: 'var(--sm-error)' }} />
              </span>
            )}
          </div>
          {timestamp && (
            <span style={{ fontSize: 13, color: 'var(--sm-text-meta)' }}>{timestamp}</span>
          )}
        </div>

        {/* Title — 16px semibold */}
        <h4 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4, color: 'var(--sm-text)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {title}
        </h4>

        {/* Value — body 14px */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {trendDirection && <TrendArrow direction={trendDirection} />}
          <span style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--sm-text-secondary)' }}>{value}</span>
        </div>

        {/* Rumor meter bar — team color as progress fill only */}
        {type === 'rumor_meter' && confidence !== undefined && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: 'var(--sm-border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${confidence}%`, backgroundColor: teamAccent || 'var(--sm-red)', opacity: 0.9, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--sm-text-meta)', marginTop: 4, display: 'block' }}>{confidence}% confidence</span>
          </div>
        )}

        {/* Fan pulse sentiment */}
        {type === 'fan_pulse' && sentiment && (
          <div style={{ marginTop: 'auto' }}>
            <div style={{ width: '100%', height: 4, borderRadius: 2, backgroundColor: 'var(--sm-border)', overflow: 'hidden', display: 'flex' }}>
              <div style={{ height: '100%', width: `${sentiment.positive}%`, backgroundColor: 'var(--sm-success)', opacity: 0.9 }} />
              <div style={{ height: '100%', width: `${sentiment.negative}%`, backgroundColor: 'var(--sm-error)', opacity: 0.9 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 13, color: 'var(--sm-text-meta)' }}>{sentiment.positive}%</span>
              <span style={{ fontSize: 13, color: 'var(--sm-text-meta)' }}>{sentiment.negative}%</span>
            </div>
          </div>
        )}

        {/* Detail — meta 13px */}
        {detail && (
          <p style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--sm-text-meta)', margin: 0, marginTop: 'auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {detail}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className="group block" style={{ ...cardStyle, textDecoration: 'none' }}>
        {inner}
      </a>
    );
  }

  return (
    <div className="group" style={cardStyle}>
      {inner}
    </div>
  );
}
