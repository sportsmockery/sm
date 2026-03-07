'use client';

import React, { useMemo } from 'react';
import type { RiverCard } from '@/lib/river-types';

interface SinceLastVisitCardProps {
  riverCards: RiverCard[];
  lastVisitTimestamp: number | null;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SinceLastVisitCard({ riverCards, lastVisitTimestamp }: SinceLastVisitCardProps) {
  const missedItems = useMemo(() => {
    if (!lastVisitTimestamp) return [];
    return riverCards.filter(
      card => card.timestamp && new Date(card.timestamp).getTime() > lastVisitTimestamp
    ).slice(0, 3);
  }, [riverCards, lastVisitTimestamp]);

  if (missedItems.length === 0) return null;

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="rounded-2xl border border-[#2B3442] overflow-hidden"
      style={{
        background: 'rgba(27, 36, 48, 0.72)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div style={{ height: 2, background: '#00D4FF' }} />
      <div style={{ padding: 'var(--card-padding, 20px)' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#00D4FF',
            marginBottom: 12,
          }}
        >
          Since your last visit
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {missedItems.map(item => {
            const c = item.content as Record<string, string | undefined>;
            const title = c.title ?? c.headline ?? c.content ?? 'Update';
            return (
              <div key={item.card_id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ color: '#00D4FF', fontSize: 8, marginTop: 5, flexShrink: 0 }}>●</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#FAFAFB',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {title}
                  </p>
                  <span style={{ fontSize: 11, color: '#8899AA' }}>
                    {item.timestamp ? timeAgo(item.timestamp) : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleScrollToTop}
          aria-label="See all updates"
          style={{
            marginTop: 12,
            background: 'none',
            border: 'none',
            color: '#00D4FF',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.textDecoration = 'underline'; }}
          onBlur={e => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          See all updates →
        </button>
      </div>
    </div>
  );
}
