'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface TrendingPlayerCardProps {
  card: RiverCard;
}

export const TrendingPlayerCard = React.memo(function TrendingPlayerCard({ card }: TrendingPlayerCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = c.headline as string | undefined;
  const description = c.description as string | undefined;
  const ctaUrl = c.cta_url as string | undefined;
  const trendRank = (c.trend_rank as number | undefined) ?? 1;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#BC0000] text-white">
          #{trendRank} TRENDING
        </span>
      </div>

      {/* Player info */}
      <div className="flex items-center gap-4">
        {/* Player silhouette */}
        <div className="w-20 h-20 rounded-full bg-[#2B3442] flex-shrink-0 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E6E8EC" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {headline && <h3 className="text-lg font-bold text-[#FAFAFB]">{headline}</h3>}
          {description && (
            <p className="text-sm text-[#E6E8EC] mt-1 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              {description}
            </p>
          )}
        </div>
      </div>

      {/* CTA */}
      {ctaUrl && (
        <Link
          href={ctaUrl}
          className="text-xs font-bold text-[#BC0000] hover:underline min-h-[44px] inline-flex items-center mt-3"
          aria-label="View player details"
        >
          View Player &rarr;
        </Link>
      )}

      {/* Footer */}
      <CardActionButtons commentsCount={(c.comments_count as number) ?? 0} articleUrl={ctaUrl} />
    </BaseGlassCard>
  );
});
