'use client';

import React from 'react';
import Image from 'next/image';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface HubUpdateCardProps {
  card: RiverCard;
}

export const HubUpdateCard = React.memo(function HubUpdateCard({ card }: HubUpdateCardProps) {
  const c = card.content as Record<string, unknown>;
  const category = (c.category as string | undefined) ?? 'UPDATE';
  const authorName = c.author_name as string | undefined;
  const authorAvatar = c.author_avatar_url as string | undefined;
  const content = c.content as string | undefined;
  const confidencePct = c.confidence_pct as number | undefined;
  const isLive = c.is_live as boolean | undefined;
  const replyCount = (c.reply_count as number | undefined) ?? 0;

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
            {category.toUpperCase()}
          </span>
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BC0000] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#BC0000]" />
              </span>
              <span className="text-[10px] font-bold text-[#BC0000] uppercase">LIVE</span>
            </span>
          )}
        </div>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Author + content */}
      <div className="flex items-start gap-3">
        {authorAvatar ? (
          <Image
            src={authorAvatar}
            alt={authorName ?? 'Author'}
            width={32}
            height={32}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#2B3442] flex-shrink-0 flex items-center justify-center text-xs text-[#E6E8EC]/60">
            {authorName?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {authorName && <span className="text-xs font-bold text-[#FAFAFB]">{authorName}</span>}
          {content && (
            <p className="text-sm text-[#E6E8EC] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {content}
            </p>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      {confidencePct != null && (
        <div className="h-1 bg-[#2B3442] rounded-full mt-3">
          <div className="h-1 bg-[#BC0000] rounded-full transition-all duration-500" style={{ width: `${confidencePct}%` }} />
        </div>
      )}

      {/* Reply count */}
      {replyCount > 0 && (
        <p className="text-xs text-[#E6E8EC]/60 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
        </p>
      )}

      {/* Footer */}
      <CardActionButtons />
    </BaseGlassCard>
  );
});
