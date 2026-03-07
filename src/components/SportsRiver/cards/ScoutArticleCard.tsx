'use client';

import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { RiverCard } from '@/lib/river-types';
import { BaseGlassCard } from '../BaseGlassCard';
import { CardActionButtons } from '../CardActionButtons';
import { CARD_TYPE_LABELS, formatTimestamp } from './utils';

interface ScoutArticleCardProps {
  card: RiverCard;
}

export const ScoutArticleCard = React.memo(function ScoutArticleCard({ card }: ScoutArticleCardProps) {
  const [isScoutActive, setIsScoutActive] = useState(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = card.content as Record<string, unknown>;
  const title = c.title as string | undefined;
  const slug = c.slug as string | undefined;
  const featuredImage = c.featured_image as string | undefined;
  const excerpt = c.excerpt as string | undefined;
  const scoutSummary = c.scout_summary as string | undefined;
  const teamSlug = c.team_slug as string | undefined;

  const bullets = scoutSummary
    ? scoutSummary.split(/\n|\.(?=\s)/).filter((s) => s.trim()).slice(0, 3)
    : [];

  const handleHoldStart = useCallback(() => {
    holdTimer.current = setTimeout(() => setIsScoutActive(true), 0);
    setIsScoutActive(true);
  }, []);

  const handleHoldEnd = useCallback(() => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    setIsScoutActive(false);
  }, []);

  return (
    <BaseGlassCard
      trackingToken={card.tracking_token}
      accentColor={card.ui_directives.accent}
      className={isScoutActive ? 'ring-1 ring-[#00D4FF]' : ''}
    >
      <div
        className="relative select-none"
        onMouseDown={handleHoldStart}
        onMouseUp={handleHoldEnd}
        onMouseLeave={handleHoldEnd}
        onTouchStart={handleHoldStart}
        onTouchEnd={handleHoldEnd}
        style={isScoutActive ? { boxShadow: '0 0 20px rgba(0,212,255,0.4)' } : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {teamSlug && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#2B3442] text-[#FAFAFB]">
                {teamSlug}
              </span>
            )}
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#00D4FF' }}>
              {CARD_TYPE_LABELS[card.card_type]}
            </span>
          </div>
          <span className="text-xs text-[#E6E8EC]/60">{formatTimestamp(card.timestamp)}</span>
        </div>

        {/* Featured image */}
        {featuredImage && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3">
            <Image
              src={featuredImage}
              alt={title ?? 'Article image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}

        {/* Title + excerpt */}
        {title && <h3 className="text-lg font-bold text-[#FAFAFB] mb-1">{title}</h3>}
        {excerpt && (
          <p className="text-sm text-[#E6E8EC] line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            {excerpt}
          </p>
        )}

        {/* Hold-to-Scout overlay */}
        <AnimatePresence>
          {isScoutActive && (
            <motion.div
              className="absolute inset-0 z-10 flex flex-col justify-center bg-[#121821]/90 backdrop-blur-xl border border-[#00D4FF] rounded-2xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00D4FF]" />
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-[#00D4FF]">
                  SCOUT AI SUMMARY
                </span>
              </div>

              {bullets.length > 0 ? (
                <ul className="space-y-1.5 mb-4">
                  {bullets.map((b, i) => (
                    <li key={i} className="text-sm text-[#E6E8EC] flex items-start gap-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <span className="text-[#00D4FF] mt-0.5">&#8226;</span>
                      {b.trim()}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[#E6E8EC]/60 italic mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  No Scout summary available
                </p>
              )}

              <div className="flex items-center gap-3">
                {slug && (
                  <Link
                    href={`/${slug}`}
                    className="text-xs font-bold text-[#00D4FF] hover:underline min-h-[44px] flex items-center"
                    aria-label="Read full article"
                  >
                    Read Full Article &rarr;
                  </Link>
                )}
                <button
                  className="text-xs font-bold text-[#FAFAFB] bg-[#00D4FF]/20 border border-[#00D4FF] rounded-lg px-3 min-h-[44px] hover:bg-[#00D4FF]/30 transition-colors"
                  aria-label="Ask Scout AI about this article"
                >
                  Ask Scout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CardActionButtons />
      </div>
    </BaseGlassCard>
  );
});
