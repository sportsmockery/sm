'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import type { ContentBlock } from '@/components/admin/BlockEditor/types';
import {
  extractFeedCards,
  type ArticleMeta,
  type FeedItem,
} from '@/lib/article-feed-extractor';
import {
  rankFeedItems,
  type EngagementSignals,
  type RankedFeedItem,
} from '@/lib/feed-intelligence';
import {
  ArticleCard,
  AnalyticsCard,
  DebateCard,
  RumorCard,
  FeedPollCard,
} from './cards/ArticleFeedCards';

/* ─── Card router ─── */

function FeedCardRouter({ item }: { item: FeedItem }) {
  switch (item.kind) {
    case 'article':   return <ArticleCard item={item} />;
    case 'analytics': return <AnalyticsCard item={item} />;
    case 'debate':    return <DebateCard item={item} />;
    case 'rumor':     return <RumorCard item={item} />;
    case 'poll':      return <FeedPollCard item={item} />;
    default:          return null;
  }
}

/* ─── Single Article Feed ─── */

interface ArticleFeedRendererProps {
  /** Article blocks from the block editor */
  blocks: ContentBlock[];
  /** Article metadata for the summary card and link-backs */
  meta: ArticleMeta;
  /** Max number of feed cards to generate (default 4) */
  maxCards?: number;
}

/**
 * ArticleFeedRenderer
 *
 * Takes an article's blocks + metadata, extracts feed-worthy items,
 * and renders them as a vertical stack of feed cards.
 *
 * Use case: article detail page sidebar, "from this article" feed section,
 * or as input to the main river feed.
 */
export function ArticleFeedRenderer({ blocks, meta, maxCards = 4 }: ArticleFeedRendererProps) {
  const items = useMemo(
    () => extractFeedCards(blocks, meta, maxCards),
    [blocks, meta, maxCards],
  );

  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCardRouter key={item.id} item={item} />
      ))}
    </div>
  );
}

/* ─── Multi-Article Feed (infinite scroll + intelligence scoring) ─── */

export interface ArticleFeedEntry {
  blocks: ContentBlock[];
  meta: ArticleMeta;
}

interface MultiFeedRendererProps {
  /** Array of articles, each with blocks + metadata */
  articles: ArticleFeedEntry[];
  /** Cards per article (default 2 — summary + best block) */
  cardsPerArticle?: number;
  /** How many articles to render initially before infinite scroll kicks in */
  initialBatch?: number;
  /** Called when more articles should be loaded */
  onLoadMore?: () => void;
  /** Whether more articles are available */
  hasMore?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Enable intelligence scoring and diversity balancing (default: true) */
  ranked?: boolean;
  /** Max items in the ranked feed (default: 20) */
  maxRankedItems?: number;
  /** Engagement data keyed by feed item ID */
  engagementMap?: Map<string, EngagementSignals>;
  /** Override freshness weight (0–1, default 0.35) */
  freshnessWeight?: number;
  /** Override engagement weight (0–1, default 0.15) */
  engagementWeight?: number;
}

/**
 * MultiFeedRenderer
 *
 * Renders multiple articles as an interleaved, intelligence-ranked feed.
 *
 * When `ranked` is true (default):
 * 1. Extracts feed cards from all visible articles
 * 2. Scores items using feed-intelligence (freshness, quality, priority)
 * 3. Applies diversity balancing to prevent repetitive sequences
 * 4. Renders ranked results with infinite scroll
 *
 * When `ranked` is false:
 * Falls back to simple document-order rendering (original behavior).
 */
export function MultiFeedRenderer({
  articles,
  cardsPerArticle = 2,
  initialBatch = 6,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  ranked = true,
  maxRankedItems = 20,
  engagementMap,
  freshnessWeight,
  engagementWeight,
}: MultiFeedRendererProps) {
  const [visibleCount, setVisibleCount] = useState(initialBatch);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          onLoadMore?.();
          setVisibleCount((c) => c + initialBatch);
        }
      },
      { rootMargin: '400px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore, initialBatch]);

  // Extract → Score → Rank
  const rankedCards = useMemo(() => {
    const allItems: FeedItem[] = [];
    const visible = articles.slice(0, visibleCount);
    for (const article of visible) {
      const articleCards = extractFeedCards(article.blocks, article.meta, cardsPerArticle);
      allItems.push(...articleCards);
    }

    if (!ranked) return allItems;

    return rankFeedItems({
      items: allItems,
      maxItems: maxRankedItems,
      preserveVariety: true,
      freshnessWeight,
      engagementWeight,
      engagementMap: engagementMap ?? new Map(),
    });
  }, [articles, visibleCount, cardsPerArticle, ranked, maxRankedItems, freshnessWeight, engagementWeight, engagementMap]);

  return (
    <div className="space-y-4">
      {rankedCards.map((item) => (
        <FeedCardRouter key={item.id} item={item} />
      ))}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <FeedCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-1" aria-hidden />}
    </div>
  );
}

/* ─── Skeleton ─── */

function FeedCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--sm-card, rgba(255,255,255,0.04))',
        border: '1px solid var(--sm-border, rgba(255,255,255,0.08))',
      }}
    >
      <div className="h-[2px]" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-16 h-3 rounded bg-white/5 animate-pulse" />
          <div className="ml-auto w-10 h-3 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="w-3/4 h-5 rounded bg-white/5 animate-pulse" />
        <div className="w-full h-3 rounded bg-white/5 animate-pulse" />
        <div className="w-2/3 h-3 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}
