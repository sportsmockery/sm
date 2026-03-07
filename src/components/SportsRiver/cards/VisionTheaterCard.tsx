'use client';

import React, { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface VisionTheaterCardProps {
  card: RiverCard;
}

export const VisionTheaterCard = React.memo(function VisionTheaterCard({ card }: VisionTheaterCardProps) {
  const c = card.content as Record<string, unknown>;
  const title = c.title as string | undefined;
  const slug = c.slug as string | undefined;
  const featuredImage = c.featured_image as string | undefined;
  const excerpt = c.excerpt as string | undefined;
  const viewCount = c.view_count as number | undefined;
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    videoRef.current?.play().catch(() => {});
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  return (
    <BaseGlassCard trackingToken={card.tracking_token} accentColor={card.ui_directives.accent}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#BC0000' }}>
          {CARD_TYPE_LABELS[card.card_type]}
        </span>
        <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
      </div>

      {/* Video container */}
      <Link href={slug ? `/${slug}` : '#'} aria-label={`Watch ${title ?? 'video'}`}>
        <div
          className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {featuredImage && (
            <Image
              src={featuredImage}
              alt={title ?? 'Video thumbnail'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          )}

          {/* Play button overlay */}
          {!isHovering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-14 h-14 rounded-full bg-[#BC0000] flex items-center justify-center min-w-[44px] min-h-[44px]">
                <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                  <path d="M0 0L20 12L0 24V0Z" fill="white" />
                </svg>
              </div>
            </div>
          )}

          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#2B3442]">
            <div className="h-1 bg-[#BC0000] rounded-r-full" style={{ width: '0%' }} />
          </div>
        </div>
      </Link>

      {/* Title + excerpt */}
      {title && <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{title}</h3>}
      {excerpt && (
        <p className="text-sm text-[#E6E8EC] line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
          {excerpt}
        </p>
      )}
      {viewCount != null && (
        <p className="text-xs text-[#E6E8EC]/40 mt-1">{viewCount.toLocaleString()} views</p>
      )}

      <CardActionButtons />
    </BaseGlassCard>
  );
});
