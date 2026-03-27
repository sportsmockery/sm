'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface MockDraftCardProps {
  card: RiverCard;
}

export const MockDraftCard = React.memo(function MockDraftCard({ card }: MockDraftCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? "Who's your 1st-round pick?";
  const description = c.description as string | undefined;
  const ctaUrl = (c.cta_url as string | undefined) ?? '/mock-draft';
  const ctaLabel = (c.cta_label as string | undefined) ?? 'Start Your Mock';

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Centered content */}
      <div className="text-center py-4">
        {/* Team logo placeholder */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#2B3442] flex items-center justify-center">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#BC0000" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-[#FAFAFB] mb-2">{headline}</h3>
        {description && (
          <p className="text-sm text-[#E6E8EC] mb-4 max-w-xs mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
            {description}
          </p>
        )}

        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center px-6 min-h-[44px] text-sm font-bold rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: '#BC0000', color: '#FAFAFB' }}
          aria-label={ctaLabel}
        >
          {ctaLabel} &rarr;
        </Link>
      </div>

      {/* Footer */}
      <CardActionButtons commentsCount={(c.comments_count as number) ?? 0} articleUrl={ctaUrl} />
    </BaseGlassCard>
  );
});
