// src/components/homepage/PostCard.tsx
'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { differenceInHours, differenceInDays, format } from 'date-fns';
import { useScoutConcierge } from '@/hooks/useScoutConcierge';
import { ScoutConciergeOverlay } from './ScoutConciergeOverlay';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  team_slug: string | null;
  category_slug: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  published_at: string;
  content_type: string;
  is_trending: boolean;
  is_evergreen: boolean;
  views: number | null;
}

type CardSize = 'xl' | 'm' | 'compact';

interface PostCardProps {
  post: Post;
  priority?: boolean;
  cardSize?: CardSize;
}

const TEAM_DISPLAY_NAMES: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
};

function formatRecency(publishedAt: string): string {
  const date = new Date(publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutesAgo = Math.floor(diffMs / 60000);
  const hoursAgo = differenceInHours(now, date);
  const daysAgo = differenceInDays(now, date);

  if (minutesAgo < 1) return 'Just now';
  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  if (daysAgo === 1) return 'Yesterday';
  if (daysAgo <= 6) return `${daysAgo}d ago`;
  return format(date, 'MMM d');
}

function getContentTypeBadge(contentType: string): string | null {
  const badges: Record<string, string> = {
    video: 'VIDEO',
    analysis: 'ANALYSIS',
    podcast: 'PODCAST',
    gallery: 'GALLERY',
  };
  return badges[contentType] || null;
}

export type { Post };

function markAsRead(slug: string) {
  try {
    const raw = localStorage.getItem('sm-read-articles');
    const arr: string[] = raw ? JSON.parse(raw) : [];
    if (!arr.includes(slug)) {
      arr.push(slug);
      // Cap at 200 to avoid bloating localStorage
      if (arr.length > 200) arr.shift();
      localStorage.setItem('sm-read-articles', JSON.stringify(arr));
    }
  } catch {}
}

function formatViews(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
}

export function PostCard({ post, priority = false, cardSize = 'compact' }: PostCardProps) {
  const recencyLabel = formatRecency(post.published_at);
  const teamName = post.team_slug
    ? TEAM_DISPLAY_NAMES[post.team_slug] || post.team_slug.replace('-', ' ')
    : null;

  // --- Scout Concierge long-press ---
  const LONG_PRESS_MS = 600;
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  const pressActiveRef = useRef(false);
  const scout = useScoutConcierge(post);

  // First-visit tooltip: show once, then persist dismissal
  const [showScoutTip, setShowScoutTip] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem('sm-scout-hint-seen')) {
        setShowScoutTip(true);
      }
    } catch {}
  }, []);

  const dismissScoutTip = useCallback(() => {
    setShowScoutTip(false);
    try { localStorage.setItem('sm-scout-hint-seen', '1'); } catch {}
  }, []);

  const startPress = useCallback(() => {
    pressActiveRef.current = true;
    setPressProgress(1); // triggers CSS animation
    pressTimerRef.current = setTimeout(() => {
      if (pressActiveRef.current) {
        scout.trigger();
        setPressProgress(0);
        // Dismiss first-visit tip once they've used it
        if (showScoutTip) dismissScoutTip();
      }
    }, LONG_PRESS_MS);
  }, [scout, showScoutTip, dismissScoutTip]);

  const cancelPress = useCallback(() => {
    pressActiveRef.current = false;
    setPressProgress(0);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }, []);

  // Build URL with category prefix: /chicago-bears/article-slug
  const postUrl = post.category_slug
    ? `/${post.category_slug}/${post.slug}`
    : `/${post.slug}`;

  const contentBadge = getContentTypeBadge(post.content_type);
  const isCollageType = post.content_type === 'video' || post.content_type === 'analysis';

  const sizeClass = cardSize === 'xl' ? 'card-xl' : cardSize === 'm' ? 'card-m' : 'card-compact';
  const isLargeCard = cardSize === 'xl' || cardSize === 'm';

  // Build context panel summary (truncated excerpt)
  const panelExcerpt = post.excerpt
    ? post.excerpt.length > 120
      ? post.excerpt.slice(0, 120).trimEnd() + '...'
      : post.excerpt
    : null;

  // Stat orbs data
  const views = post.views || 0;
  const viewsLabel = views > 999999
    ? `${(views / 1000000).toFixed(1)}M`
    : views > 999
      ? `${(views / 1000).toFixed(1)}k`
      : String(views);
  const wordCount = post.excerpt ? post.excerpt.split(/\s+/).length : 0;
  const minRead = Math.max(1, Math.floor(wordCount / 160));

  return (
    <article
      className={`glass-card feed-card ${sizeClass}${scout.isOpen ? ' scout-active' : ''}`}
      style={{ padding: '16px', borderRadius: '20px', boxShadow: '0 12px 32px rgba(0,0,0,0.3)', position: 'relative' }}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
      onContextMenu={(e) => { if (pressActiveRef.current) e.preventDefault(); }}
    >
      {/* Scout hint badge — visible on hover, hidden during press/overlay */}
      {!scout.isOpen && pressProgress === 0 && (
        <div className="scout-hint-badge" aria-hidden="true">
          <Image src="/downloads/scout-v2.png" alt="" width={16} height={16} unoptimized style={{ borderRadius: '50%' }} />
          <span>Hold for Scout recap</span>
        </div>
      )}

      {/* First-visit tooltip — anchored below hint badge */}
      {showScoutTip && !scout.isOpen && (
        <div className="scout-first-tip" onClick={dismissScoutTip}>
          <Image src="/downloads/scout-v2.png" alt="" width={20} height={20} unoptimized style={{ borderRadius: '50%', flexShrink: 0 }} />
          <span>Press &amp; hold any card for a quick Scout AI recap</span>
          <button
            onClick={(e) => { e.stopPropagation(); dismissScoutTip(); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}
            aria-label="Dismiss tip"
          >
            &times;
          </button>
        </div>
      )}

      {/* Long-press progress ring */}
      {pressProgress > 0 && (
        <div className="scout-progress-ring">
          <svg viewBox="0 0 36 36" width="36" height="36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(188,0,0,0.2)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16"
              fill="none"
              stroke="#bc0000"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="100.53"
              strokeDashoffset="100.53"
              className="scout-progress-ring-circle"
              style={{ animationDuration: `${LONG_PRESS_MS}ms` }}
            />
          </svg>
        </div>
      )}

      {/* Scout Concierge Overlay */}
      {scout.isOpen && (
        <ScoutConciergeOverlay
          isLoading={scout.isLoading}
          error={scout.error}
          data={scout.data}
          onClose={scout.close}
        />
      )}

      <Link href={postUrl} onClick={(e) => { if (scout.isOpen) { e.preventDefault(); return; } markAsRead(post.slug); }}>
        <div className={`card-image${isLargeCard ? ' card-image--stadium' : ''}`}>
          {isCollageType && post.featured_image ? (
            <div className="collage-thumbs">
              {(['center', 'top left', 'bottom right', 'top right'] as const).map((pos, i) => (
                <img
                  key={i}
                  src={post.featured_image!}
                  alt=""
                  style={{ objectPosition: pos }}
                />
              ))}
            </div>
          ) : post.featured_image ? (
            <Image
              src={post.featured_image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              style={isLargeCard ? { clipPath: 'polygon(0 0, 95% 0, 100% 12%, 100% 88%, 95% 100%, 0 100%)' } : undefined}
            />
          ) : (
            <div className="card-placeholder" />
          )}

          {/* Holographic category tag — top-left corner */}
          {post.category_slug && (
            <span className="holo-tag">{post.category_slug.replace('chicago-', '').replace(/-/g, ' ')}</span>
          )}

          {/* Stat orbs */}
          <div className="stat-orb stat-orb--views">{viewsLabel}</div>
          <div className="stat-orb stat-orb--read">{minRead} min</div>

          {/* Neon team label replaces old pill */}
          {teamName && (
            <span className="neon-team">{teamName.toUpperCase()}</span>
          )}
          {post.is_trending && (
            <span
              className="sm-tag card-team-pill"
              style={{
                background: 'rgba(255,107,53,0.9)',
                right: 12,
                left: 'auto',
                top: 12,
                position: 'absolute',
              }}
            >
              Trending
            </span>
          )}
        </div>
        <div className="card-body">
          <h3>{post.title}</h3>
          {(contentBadge || post.is_evergreen) && (
            <div className="card-badges">
              {contentBadge && <span className="card-badge">{contentBadge}</span>}
              {post.is_evergreen && <span className="card-badge card-badge--guide">GUIDE</span>}
            </div>
          )}
          {post.excerpt && <p className="card-excerpt">{post.excerpt}</p>}
          <div className="card-meta">
            {post.author_avatar_url ? (
              <Image
                src={post.author_avatar_url}
                alt=""
                width={24}
                height={24}
                className="author-avatar-img"
                unoptimized
              />
            ) : (
              <div className="author-avatar-placeholder">
                {(post.author_name || 'S').charAt(0)}
              </div>
            )}
            <span>
              {post.author_name || 'SM Staff'} &middot; {recencyLabel}
              {post.views != null && post.views > 0 && (
                <> &middot; {formatViews(post.views)} views</>
              )}
            </span>
          </div>
        </div>
      </Link>

      {/* Section 10: Floating Context Panel */}
      <div className="context-panel" aria-hidden="true">
        <div className="context-panel-header">
          {teamName && <span className="context-panel-team">{teamName}</span>}
          {contentBadge && <span className="context-panel-type">{contentBadge}</span>}
          {post.is_trending && <span className="context-panel-trending">Trending</span>}
        </div>
        {panelExcerpt && <p className="context-panel-excerpt">{panelExcerpt}</p>}
        <div className="context-panel-footer">
          <span>{post.author_name || 'SM Staff'}</span>
          <span>{recencyLabel}</span>
        </div>
        <span className="context-panel-cta">Read article &rarr;</span>
      </div>
    </article>
  );
}
