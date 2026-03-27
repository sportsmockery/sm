'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { useOptionalMediaController } from '@/context/MediaControllerContext';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface VisionTheaterCardProps {
  card: RiverCard;
}

/** Center band: only the middle 20% of viewport counts as "in center" for auto-play. */
const CENTER_ROOT_MARGIN = '-40% 0px -40% 0px';

export const VisionTheaterCard = React.memo(function VisionTheaterCard({ card }: VisionTheaterCardProps) {
  const c = card.content as Record<string, unknown>;
  const title = c.title as string | undefined;
  const slug = c.slug as string | undefined;
  const featuredImage = c.featured_image as string | undefined;
  const videoUrl = c.video_url as string | undefined;
  const excerpt = c.excerpt as string | undefined;
  const viewCount = c.view_count as number | undefined;
  const [isHovering, setIsHovering] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaController = useOptionalMediaController();
  const cardId = card.card_id;
  const isActive = mediaController?.activeId === cardId;

  // Single active video: when this card enters viewport center, claim focus (others pause/mute)
  useEffect(() => {
    if (!videoUrl || !mediaController) return;
    const el = containerRef.current;
    if (!el) return;

    const { register, unregister, setActive } = mediaController;
    register(cardId, {
      play: () => videoRef.current?.play().catch(() => {}),
      pause: () => videoRef.current?.pause(),
      mute: () => {
        if (videoRef.current) videoRef.current.muted = true;
      },
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(cardId);
        }
      },
      { root: null, rootMargin: CENTER_ROOT_MARGIN, threshold: 0 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      unregister(cardId);
    };
  }, [cardId, videoUrl, mediaController]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (!videoUrl) videoRef.current?.play().catch(() => {});
  }, [videoUrl]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (!videoUrl && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [videoUrl]);

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
          ref={containerRef}
          className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                poster={featuredImage ?? undefined}
                playsInline
                muted={!isActive}
                loop
                className="absolute inset-0 w-full h-full object-cover"
              />
              {!isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                  <div className="w-14 h-14 rounded-full bg-[#BC0000] flex items-center justify-center min-w-[44px] min-h-[44px]">
                    <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
                      <path d="M0 0L20 12L0 24V0Z" fill="white" />
                    </svg>
                  </div>
                </div>
              )}
            </>
          ) : (
            featuredImage && (
              <Image
                src={featuredImage}
                alt={title ?? 'Video thumbnail'}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            )
          )}

          {/* Play overlay when no video URL (hover to play placeholder) or when not active */}
          {!videoUrl && !isHovering && (
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

      <CardActionButtons commentsCount={(c.comments_count as number) ?? 0} articleUrl={slug ? `/${slug}` : undefined} />
    </BaseGlassCard>
  );
});
