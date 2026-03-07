'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface SmPlusCardProps {
  card: RiverCard;
}

export const SmPlusCard = React.memo(function SmPlusCard({ card }: SmPlusCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Unlock the smarter feed';
  const description = c.description as string | undefined;
  const ctaUrl = (c.cta_url as string | undefined) ?? '/sm-plus';
  const ctaLabel = (c.cta_label as string | undefined) ?? 'Upgrade to SM+';

  const tiers = ['Ad-free experience', 'Exclusive Scout AI insights', 'Priority game alerts'];

  return (
    <BaseGlassCard
      trackingToken={card.tracking_token}
      accentColor="#D6B05E"
      className="border-[#D6B05E]"
    >
      <div style={{ boxShadow: '0 0 20px rgba(214,176,94,0.3)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D6B05E' }}>
            {CARD_TYPE_LABELS[card.card_type]}
          </span>
          <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-[#FAFAFB] mb-2">{headline}</h3>
        {description && (
          <p className="text-sm text-[#E6E8EC] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            {description}
          </p>
        )}

        {/* Plan tiers */}
        <ul className="space-y-2 mb-4">
          {tiers.map((tier, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-[#E6E8EC]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <span className="text-[#D6B05E]">&#10003;</span>
              {tier}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={ctaUrl}
          className="inline-flex items-center justify-center px-6 min-h-[44px] text-sm font-bold rounded-lg transition-colors hover:opacity-90"
          style={{ backgroundColor: '#D6B05E', color: '#0B0F14' }}
          aria-label={ctaLabel}
        >
          {ctaLabel}
        </Link>
      </div>
    </BaseGlassCard>
  );
});
