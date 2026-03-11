/**
 * Article Feed Extractor
 *
 * Scans an article's ContentBlock[] and extracts feed-worthy items.
 * Each item maps to a specific FeedCard type for the river/feed renderer.
 *
 * Feed-worthy blocks: blocks that carry standalone value in a feed context
 * (polls, debates, charts, rumors, insights) — plain paragraphs are not
 * feed-worthy on their own but contribute to the article summary card.
 */

import type { ContentBlock } from '@/components/admin/BlockEditor/types';

/* ─── Feed card types ─── */

export type FeedCardKind = 'article' | 'analytics' | 'debate' | 'rumor' | 'poll';

export interface ArticleMeta {
  title: string;
  slug: string;
  author: string;
  image?: string;
  team?: string;
  publishedAt?: string;
}

export interface FeedItem {
  id: string;
  kind: FeedCardKind;
  /** Brand accent for this card */
  accent: string;
  /** Display label shown in card header */
  label: string;
  /** The source block (null for article summary card) */
  block: ContentBlock | null;
  /** Article-level metadata (always present, used for link-back) */
  meta: ArticleMeta;
}

/* ─── Brand colors (mirrored from PreviewPrimitives to avoid client import) ─── */

const ACCENT = {
  cyan: '#00D4FF',
  red: '#BC0000',
  gold: '#D6B05E',
} as const;

/* ─── Block → FeedCardKind mapping ─── */

const BLOCK_FEED_MAP: Partial<Record<ContentBlock['type'], { kind: FeedCardKind; accent: string; label: string }>> = {
  'scout-insight':      { kind: 'analytics', accent: ACCENT.cyan, label: 'Scout Insight' },
  'stats-chart':        { kind: 'analytics', accent: ACCENT.cyan, label: 'Analytics' },
  'player-comparison':  { kind: 'analytics', accent: ACCENT.cyan, label: 'Player Comparison' },
  'debate':             { kind: 'debate',    accent: ACCENT.red,  label: 'Edge Debate' },
  'rumor-meter':        { kind: 'rumor',     accent: ACCENT.red,  label: 'Rumor Alert' },
  'heat-meter':         { kind: 'rumor',     accent: ACCENT.red,  label: 'Trending' },
  'trade-scenario':     { kind: 'rumor',     accent: ACCENT.red,  label: 'Trade Scenario' },
  'update':             { kind: 'rumor',     accent: ACCENT.red,  label: 'Breaking' },
  'mock-draft':         { kind: 'analytics', accent: ACCENT.gold, label: 'Mock Draft' },
  'hot-take':           { kind: 'debate',    accent: ACCENT.gold, label: 'Top Take' },
  'gm-interaction':     { kind: 'poll',      accent: ACCENT.cyan, label: 'GM Pulse' },
  'poll':               { kind: 'poll',      accent: ACCENT.cyan, label: 'Edge Debate' },
};

/* ─── Extraction ─── */

/**
 * Build the article summary excerpt from the first non-empty paragraphs.
 * Returns up to `maxChars` characters of body text.
 */
function buildExcerpt(blocks: ContentBlock[], maxChars = 160): string {
  let text = '';
  for (const b of blocks) {
    if (b.type === 'paragraph' && b.data.html) {
      text += (text ? ' ' : '') + b.data.html;
      if (text.length >= maxChars) break;
    }
  }
  return text.length > maxChars ? text.slice(0, maxChars).trimEnd() + '...' : text;
}

/**
 * Check if a block has meaningful content (not empty defaults).
 */
function blockHasContent(block: ContentBlock): boolean {
  switch (block.type) {
    case 'scout-insight':      return !!block.data.insight;
    case 'gm-interaction':     return !!block.data.question;
    case 'poll':               return !!block.data.question;
    case 'stats-chart':        return block.data.dataPoints.length > 0;
    case 'player-comparison':  return !!(block.data.playerA.name || block.data.playerB.name);
    case 'debate':             return !!(block.data.proArgument || block.data.conArgument);
    case 'rumor-meter':        return true; // always has a strength value
    case 'heat-meter':         return true;
    case 'trade-scenario':     return !!(block.data.teamA || block.data.teamB);
    case 'update':             return !!block.data.text;
    case 'mock-draft':         return block.data.picks.length > 0;
    case 'hot-take':           return !!block.data.text;
    default:                   return false;
  }
}

/**
 * Extract feed-worthy items from an article's blocks.
 *
 * Always produces an article summary card first, then up to `maxCards - 1`
 * additional cards from feed-worthy blocks in document order.
 */
export function extractFeedCards(
  blocks: ContentBlock[],
  meta: ArticleMeta,
  maxCards = 4,
): FeedItem[] {
  const items: FeedItem[] = [];

  // 1. Article summary card (always first)
  const excerpt = buildExcerpt(blocks);
  const firstImage = blocks.find((b) => b.type === 'image' && b.data.src);

  items.push({
    id: `feed-article-${meta.slug}`,
    kind: 'article',
    accent: ACCENT.red,
    label: 'SM Edge',
    block: null,
    meta: {
      ...meta,
      image: meta.image || (firstImage?.type === 'image' ? firstImage.data.src : undefined),
    },
  });

  // 2. Scan for feed-worthy blocks
  for (const block of blocks) {
    if (items.length >= maxCards) break;

    const mapping = BLOCK_FEED_MAP[block.type];
    if (!mapping) continue;
    if (!blockHasContent(block)) continue;

    items.push({
      id: `feed-${block.type}-${block.id}`,
      kind: mapping.kind,
      accent: mapping.accent,
      label: mapping.label,
      block,
      meta,
    });
  }

  return items;
}

/**
 * Convenience: check if an article has any feed-worthy interactive blocks.
 */
export function hasFeedWorthyBlocks(blocks: ContentBlock[]): boolean {
  return blocks.some((b) => BLOCK_FEED_MAP[b.type] && blockHasContent(b));
}
