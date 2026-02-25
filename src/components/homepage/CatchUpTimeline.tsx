// src/components/homepage/CatchUpTimeline.tsx
'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';

interface CatchUpPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category_slug: string | null;
  team_slug: string | null;
  published_at: string;
  importance_score?: number;
  featured_image?: string | null;
}

interface CatchUpTimelineProps {
  posts: CatchUpPost[];
}

const TEAM_DISPLAY: Record<string, string> = {
  bears: 'BEARS',
  bulls: 'BULLS',
  blackhawks: 'BLACKHAWKS',
  cubs: 'CUBS',
  'white-sox': 'WHITE SOX',
  whitesox: 'WHITE SOX',
};

function timeAgo(publishedAt: string): string {
  const diff = Date.now() - new Date(publishedAt).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function trimHeadline(title: string, max = 60): string {
  if (title.length <= max) return title;
  return title.slice(0, max).trimEnd() + '\u2026';
}

export function CatchUpTimeline({ posts }: CatchUpTimelineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const chipListRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Derive catch-up items: last 24h, sorted by importance then recency, top 8
  const catchUpItems = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;

    const recent = posts.filter((p) => {
      const pubTime = new Date(p.published_at).getTime();
      return pubTime >= cutoff && pubTime <= now;
    });

    // Sort by importance_score desc, then published_at desc
    recent.sort((a, b) => {
      const scoreA = (a as any).importance_score ?? 0;
      const scoreB = (b as any).importance_score ?? 0;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

    return recent.slice(0, 8);
  }, [posts]);

  const activeItem = activeIndex !== null ? catchUpItems[activeIndex] : null;

  const handleChipFocus = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const handleChipBlur = useCallback(() => {
    // Small delay so clicking "Jump to story" doesn't immediately close
    setTimeout(() => setActiveIndex(null), 200);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const next = Math.min(index + 1, catchUpItems.length - 1);
        setActiveIndex(next);
        chipRefs.current[next]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = Math.max(index - 1, 0);
        setActiveIndex(prev);
        chipRefs.current[prev]?.focus();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setActiveIndex(0);
        chipRefs.current[0]?.focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        const last = catchUpItems.length - 1;
        setActiveIndex(last);
        chipRefs.current[last]?.focus();
      }
    },
    [catchUpItems.length]
  );

  // Scroll active chip into view
  useEffect(() => {
    if (activeIndex !== null && chipRefs.current[activeIndex]) {
      chipRefs.current[activeIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeIndex]);

  if (catchUpItems.length === 0) return null;

  // Group for display: count per team
  const teamCounts = catchUpItems.reduce<Record<string, number>>((acc, p) => {
    const key = p.team_slug || 'sports';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const teamList = Object.keys(teamCounts);

  return (
    <div className="catchup-timeline">
      {/* Header */}
      <div className="catchup-header">
        <span className="catchup-pulse-dot" />
        <span className="catchup-label">90-Second Chicago Catch-Up</span>
        <span className="catchup-team-count">
          {catchUpItems.length} stories &middot; {teamList.length} team{teamList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Chip strip */}
      <div
        className="catchup-chip-strip"
        ref={chipListRef}
        role="tablist"
        aria-label="Today's top Chicago sports stories"
      >
        {catchUpItems.map((item, i) => {
          const teamLabel = item.team_slug
            ? TEAM_DISPLAY[item.team_slug] || item.team_slug.toUpperCase()
            : 'SPORTS';
          const isActive = activeIndex === i;

          return (
            <button
              key={item.id}
              ref={(el) => { chipRefs.current[i] = el; }}
              role="tab"
              aria-selected={isActive}
              aria-controls={isActive ? 'catchup-panel' : undefined}
              id={`catchup-tab-${i}`}
              tabIndex={isActive || (activeIndex === null && i === 0) ? 0 : -1}
              className={`catchup-chip${isActive ? ' catchup-chip--active' : ''}`}
              onMouseEnter={() => handleChipFocus(i)}
              onMouseLeave={handleChipBlur}
              onFocus={() => handleChipFocus(i)}
              onBlur={handleChipBlur}
              onKeyDown={(e) => handleKeyDown(e, i)}
            >
              <span className="catchup-chip-team">{teamLabel}</span>
              <span className="catchup-chip-headline">{trimHeadline(item.title, 50)}</span>
              <span className="catchup-chip-time">{timeAgo(item.published_at)}</span>
            </button>
          );
        })}

        {/* View All pill */}
        <a href="#feed" className="catchup-view-all">
          View All Today &rarr;
        </a>
      </div>

      {/* Summary panel */}
      {activeItem && (
        <div
          id="catchup-panel"
          role="tabpanel"
          aria-labelledby={`catchup-tab-${activeIndex}`}
          className="catchup-panel"
        >
          <p className="catchup-panel-excerpt">
            {activeItem.excerpt
              ? activeItem.excerpt.length > 160
                ? activeItem.excerpt.slice(0, 160).trimEnd() + '\u2026'
                : activeItem.excerpt
              : activeItem.title}
          </p>
          <Link
            href={
              activeItem.category_slug
                ? `/${activeItem.category_slug}/${activeItem.slug}`
                : `/${activeItem.slug}`
            }
            className="catchup-panel-jump"
          >
            Jump to story &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
