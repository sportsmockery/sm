'use client';

import React from 'react';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface CommentSpotlightCardProps {
  card: RiverCard;
}

export const CommentSpotlightCard = React.memo(function CommentSpotlightCard({ card }: CommentSpotlightCardProps) {
  const c = card.content as Record<string, unknown>;
  const headline = (c.headline as string | undefined) ?? 'Fan Voices';
  const description = c.description as string | undefined;
  const ctaUrl = c.cta_url as string | undefined;
  const username = c.username as string | undefined;
  const sourceTitle = c.source_title as string | undefined;
  const replyCount = (c.reply_count as number | undefined) ?? 0;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Quote bubble */}
      <blockquote className="bg-[#121821] rounded-2xl p-4 border-l-4 border-[#00D4FF] mb-3">
        <p className="text-sm text-[#FAFAFB] italic" style={{ fontFamily: 'Inter, sans-serif' }}>
          &ldquo;{headline}&rdquo;
        </p>
        {username && (
          <p className="text-xs text-[#E6E8EC]/60 mt-2">&mdash; @{username}</p>
        )}
      </blockquote>

      {/* Source article */}
      {sourceTitle && (
        <p className="text-xs text-[#E6E8EC]/40 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          On: {sourceTitle}
        </p>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-[#E6E8EC] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {description}
        </p>
      )}

      {/* Reply count */}
      {replyCount > 0 && (
        <p className="text-xs text-[#E6E8EC]/60 mb-2">{replyCount} more {replyCount === 1 ? 'reply' : 'replies'}</p>
      )}

      {/* CTA */}
      {ctaUrl && (
        <Link
          href={ctaUrl}
          className="text-xs font-bold text-[#00D4FF] hover:underline min-h-[44px] inline-flex items-center"
          aria-label="Join the discussion"
        >
          Join Discussion &rarr;
        </Link>
      )}

      {/* Footer */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#2B3442]">
        <button className="flex items-center gap-1 text-xs text-[#E6E8EC]/60 hover:text-[#BC0000] transition-colors min-h-[44px]" aria-label="Like this card">
          &#9829; Like
        </button>
        <button className="flex items-center gap-1 text-xs text-[#E6E8EC]/60 hover:text-[#00D4FF] transition-colors min-h-[44px]" aria-label="Share this card">
          &#8599; Share
        </button>
      </div>
    </BaseGlassCard>
  );
});
