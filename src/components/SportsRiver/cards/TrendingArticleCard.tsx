'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface TrendingArticleCardProps {
  card: RiverCard;
}

function velocityLabel(velocity: number | undefined): string {
  if (!velocity) return '';
  if (velocity > 20) return 'Rising Fast';
  if (velocity > 10) return 'Trending';
  return 'Popular';
}

export const TrendingArticleCard = React.memo(function TrendingArticleCard({ card }: TrendingArticleCardProps) {
  const c = card.content as Record<string, unknown>;
  const title = c.title as string | undefined;
  const slug = c.slug as string | undefined;
  const featuredImage = c.featured_image as string | undefined;
  const excerpt = c.excerpt as string | undefined;
  const engagementVelocity = c.engagement_velocity as number | undefined;
  const viewCount = c.view_count as number | undefined;
  const teamSlug = c.team_slug as string | undefined;

  const trendLabel = velocityLabel(engagementVelocity);

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Featured image */}
      {featuredImage && (
        <div className="relative w-full aspect-[5/2] rounded-xl overflow-hidden mb-3 -mt-4 -mx-4" style={{ width: 'calc(100% + 2rem)' }}>
          <Image
            src={featuredImage}
            alt={title ?? 'Article image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
            {CARD_TYPE_LABELS[card.card_type]}
          </span>
          {teamSlug && (
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#2B3442] text-[#FAFAFB]">
              {teamSlug}
            </span>
          )}
        </div>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Title */}
      {title && (
        <Link href={slug ? `/${slug}` : '#'} className="block">
          <h3 className="text-lg font-bold text-[#FAFAFB] mb-1 hover:text-[#00D4FF] transition-colors">
            {title}
          </h3>
        </Link>
      )}

      {/* Excerpt */}
      {excerpt && (
        <p className="text-sm text-[#E6E8EC] line-clamp-2 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {excerpt}
        </p>
      )}

      {/* Velocity badge + view count */}
      <div className="flex items-center gap-2">
        {trendLabel && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#00D4FF]/10 text-[#00D4FF]">
            {trendLabel}
          </span>
        )}
        {viewCount != null && (
          <span className="text-xs text-[#E6E8EC]/40">{viewCount.toLocaleString()} views</span>
        )}
      </div>

      <CardActionButtons />
    </BaseGlassCard>
  );
});
