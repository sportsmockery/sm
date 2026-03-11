/**
 * Feed Intelligence Scoring — Production
 *
 * Ranks extracted feed items for homepage placement using:
 * 1. Freshness — time-based decay with strong initial boost + anti-staleness
 * 2. Block type priority — interactive/visual blocks rank higher
 * 3. Content quality — well-filled blocks outscore stubs
 * 4. Engagement signals — future-ready with safe defaults
 * 5. Diversity balancing — prevents repetitive feed sequences
 * 6. Homepage time windows — breaking / today / recent / evergreen
 *
 * Architecture:
 *   extractFeedCards() → FeedItem[] → rankFeedItems() → RankedFeedItem[] → renderer
 */

import type { FeedItem, FeedCardKind } from './article-feed-extractor';

/* ═══════════════════════════════════════════════════════
   CONFIGURATION — named constants for product tuning
   ═══════════════════════════════════════════════════════ */

/** Weight multipliers for the final score formula (must sum to 1.0) */
export const SCORE_WEIGHTS = {
  freshness:   0.35,
  priority:    0.20,
  quality:     0.20,
  engagement:  0.15,
  recency:     0.10,
} as const;

export type ScoreWeightKey = keyof typeof SCORE_WEIGHTS;

/** Freshness decay windows (milliseconds) and boundary scores */
export const FRESHNESS_WINDOWS = {
  PEAK_MS:      2 * 60 * 60 * 1000,         // 0–2h
  HIGH_MS:     24 * 60 * 60 * 1000,          // 2–24h
  MEDIUM_MS:    3 * 24 * 60 * 60 * 1000,     // 1–3d
  LOW_MS:       7 * 24 * 60 * 60 * 1000,     // 3–7d

  PEAK_SCORE:   100,
  HIGH_SCORE:    75,
  MEDIUM_SCORE:  40,
  LOW_SCORE:     15,
  FLOOR_SCORE:    5,
} as const;

/**
 * Homepage time windows — used to classify items and apply window-specific logic.
 * Each window defines a max age and a target fill count for a balanced feed.
 */
export const HOMEPAGE_WINDOWS = {
  breaking: {
    label: 'Breaking / Now',
    maxAgeMs: 2 * 60 * 60 * 1000,           // 0–2h
    targetSlots: 3,
    boostMultiplier: 1.3,
  },
  today: {
    label: 'Today',
    maxAgeMs: 24 * 60 * 60 * 1000,          // 2–24h
    targetSlots: 6,
    boostMultiplier: 1.0,
  },
  recent: {
    label: 'Recent',
    maxAgeMs: 3 * 24 * 60 * 60 * 1000,      // 1–3d
    targetSlots: 6,
    boostMultiplier: 0.85,
  },
  evergreen: {
    label: 'Evergreen',
    maxAgeMs: Infinity,
    targetSlots: 5,
    boostMultiplier: 0.6,
  },
} as const;

export type HomepageWindow = keyof typeof HOMEPAGE_WINDOWS;

/** Base priority scores per card kind (0–100) */
export const KIND_PRIORITY: Record<FeedCardKind, number> = {
  debate:    90,
  rumor:     85,
  analytics: 80,
  poll:      75,
  article:   50,
};

/** Diversity limits for post-rank adjustment */
export const DIVERSITY_LIMITS = {
  /** Max cards from the same article in the top N visible slots */
  MAX_SAME_ARTICLE_IN_TOP:   2,
  /** Top N slots where clustering checks apply */
  TOP_VISIBLE_SLOTS:        10,
  /** Max consecutive cards of the same kind */
  MAX_CONSECUTIVE_SAME_KIND: 2,
  /** Max consecutive cards from the same team in top slots */
  MAX_SAME_TEAM_IN_TOP:      3,
  /** Max same-kind cards in top 10 */
  MAX_SAME_KIND_IN_TOP:      4,
  /** Penalty per diversity violation */
  DIVERSITY_PENALTY:         15,
} as const;

/**
 * Anti-staleness: when fresh content exists (< HIGH_MS old),
 * items older than this threshold get an additional decay multiplier.
 */
export const STALENESS = {
  /** Age at which anti-staleness kicks in when fresh content is present */
  STALE_THRESHOLD_MS:  48 * 60 * 60 * 1000,  // 48h
  /** Multiplier applied to stale items when fresh content exists (0–1) */
  STALE_DECAY:         0.55,
  /** Even harsher multiplier for very old content (>7d) when fresh exists */
  VERY_STALE_DECAY:    0.3,
  /** Recompute threshold: how old a feed ranking can be before it's stale */
  RECOMPUTE_MS:        5 * 60 * 1000,        // 5 minutes
} as const;

/* ═══════════════════════════════════════════════════════
   DATA MODEL
   ═══════════════════════════════════════════════════════ */

export interface EngagementSignals {
  impressions?:  number;
  clicks?:       number;
  likes?:        number;
  shares?:       number;
  pollVotes?:    number;
  readThroughs?: number;
}

export interface ScoreBreakdown {
  freshness:          number;
  priority:           number;
  quality:            number;
  engagement:         number;
  recency:            number;
  stalenessMultiplier: number;
  windowBoost:        number;
  diversityPenalty:   number;
  final:              number;
  window:             HomepageWindow;
  reasons:            string[];
}

export interface RankedFeedItem extends FeedItem {
  articleId:       string;
  sourceBlockType: string | null;
  publishedAt:     string;
  scoredAt:        string;
  engagement:      EngagementSignals;
  score:           ScoreBreakdown;
}

/* ═══════════════════════════════════════════════════════
   PURE SCORING HELPERS (unit-testable)
   ═══════════════════════════════════════════════════════ */

/** Linear interpolation clamped to [0, 1] */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/** Parse a date string to epoch ms. Returns NaN on failure. */
export function parseTimestamp(ts: string | undefined): number {
  if (!ts) return NaN;
  return new Date(ts).getTime();
}

/** Age in milliseconds. Returns Infinity for invalid/missing timestamps. */
export function ageMs(publishedAt: string | undefined, now: number): number {
  const ts = parseTimestamp(publishedAt);
  if (isNaN(ts)) return Infinity;
  return Math.max(0, now - ts);
}

/**
 * Classify a feed item into a homepage window based on its age.
 */
export function classifyWindow(publishedAt: string | undefined, now: number): HomepageWindow {
  const age = ageMs(publishedAt, now);
  if (age <= HOMEPAGE_WINDOWS.breaking.maxAgeMs)  return 'breaking';
  if (age <= HOMEPAGE_WINDOWS.today.maxAgeMs)     return 'today';
  if (age <= HOMEPAGE_WINDOWS.recent.maxAgeMs)    return 'recent';
  return 'evergreen';
}

/**
 * Freshness score (0–100).
 * Linear interpolation between decay window boundaries.
 */
export function scoreFreshness(publishedAt: string | undefined, now: number): number {
  const age = ageMs(publishedAt, now);
  if (!isFinite(age)) return FRESHNESS_WINDOWS.FLOOR_SCORE;

  const { PEAK_MS, HIGH_MS, MEDIUM_MS, LOW_MS, PEAK_SCORE, HIGH_SCORE, MEDIUM_SCORE, LOW_SCORE, FLOOR_SCORE } = FRESHNESS_WINDOWS;

  if (age <= PEAK_MS)   return lerp(PEAK_SCORE, HIGH_SCORE, age / PEAK_MS);
  if (age <= HIGH_MS)   return lerp(HIGH_SCORE, MEDIUM_SCORE, (age - PEAK_MS) / (HIGH_MS - PEAK_MS));
  if (age <= MEDIUM_MS) return lerp(MEDIUM_SCORE, LOW_SCORE, (age - HIGH_MS) / (MEDIUM_MS - HIGH_MS));
  if (age <= LOW_MS)    return lerp(LOW_SCORE, FLOOR_SCORE, (age - MEDIUM_MS) / (LOW_MS - MEDIUM_MS));
  return FLOOR_SCORE;
}

/**
 * Recency score (0–100). Gentler curve than freshness.
 */
export function scoreRecency(publishedAt: string | undefined, now: number): number {
  const hours = ageMs(publishedAt, now) / (60 * 60 * 1000);
  if (!isFinite(hours)) return 10;
  if (hours <= 6)   return 100;
  if (hours <= 24)  return lerp(100, 70, (hours - 6) / 18);
  if (hours <= 72)  return lerp(70, 40, (hours - 24) / 48);
  if (hours <= 168) return lerp(40, 15, (hours - 72) / 96);
  return 10;
}

/**
 * Staleness multiplier (0–1).
 * When fresh content exists in the feed, older items are penalized harder.
 * Returns 1.0 (no penalty) when no fresh content is present.
 */
export function computeStalenessMultiplier(
  publishedAt: string | undefined,
  hasFreshContent: boolean,
  now: number,
): number {
  if (!hasFreshContent) return 1.0;
  const age = ageMs(publishedAt, now);
  if (age <= STALENESS.STALE_THRESHOLD_MS) return 1.0;
  if (age <= FRESHNESS_WINDOWS.LOW_MS)     return STALENESS.STALE_DECAY;
  return STALENESS.VERY_STALE_DECAY;
}

/**
 * Content quality score (0–100) based on block completeness.
 */
export function scoreQuality(item: FeedItem): number {
  if (item.kind === 'article') {
    let s = 40;
    if (item.meta.image)  s += 25;
    if (item.meta.author) s += 10;
    if (item.meta.team)   s += 10;
    if (item.meta.title && item.meta.title.length > 20) s += 15;
    return Math.min(100, s);
  }

  const block = item.block;
  if (!block) return 30;

  switch (block.type) {
    case 'debate': {
      let s = 30;
      if (block.data.proArgument && block.data.proArgument.length > 30) s += 30;
      if (block.data.conArgument && block.data.conArgument.length > 30) s += 30;
      if (block.data.reward > 0) s += 10;
      return Math.min(100, s);
    }
    case 'stats-chart': {
      let s = 20;
      if (block.data.title) s += 15;
      s += Math.min(50, block.data.dataPoints.length * 12);
      return Math.min(100, s);
    }
    case 'player-comparison': {
      let s = 20;
      if (block.data.playerA.name) s += 15;
      if (block.data.playerB.name) s += 15;
      s += Math.min(40, block.data.stats.length * 10);
      return Math.min(100, s);
    }
    case 'scout-insight': {
      let s = 30;
      if (block.data.insight.length > 50) s += 40;
      else if (block.data.insight.length > 20) s += 20;
      if (block.data.confidence === 'high') s += 20;
      else if (block.data.confidence === 'medium') s += 10;
      return Math.min(100, s);
    }
    case 'rumor-meter': {
      const m: Record<string, number> = { Low: 40, Medium: 60, Strong: 80, 'Heating Up': 95 };
      return m[block.data.strength] ?? 50;
    }
    case 'heat-meter': {
      const m: Record<string, number> = { Warm: 50, Hot: 75, Nuclear: 95 };
      return m[block.data.level] ?? 50;
    }
    case 'trade-scenario': {
      let s = 30;
      if (block.data.teamA) s += 15;
      if (block.data.teamB) s += 15;
      s += Math.min(20, block.data.teamAReceives.length * 10);
      s += Math.min(20, block.data.teamBReceives.length * 10);
      return Math.min(100, s);
    }
    case 'mock-draft': {
      const picks = block.data.picks.length;
      let s = 20 + Math.min(60, picks * 8);
      if (picks >= 5) s += 20;
      return Math.min(100, s);
    }
    case 'gm-interaction':
    case 'poll': {
      let s = 40;
      const d = block.data as { question: string; options: string[]; reward?: number };
      if (d.question.length > 20) s += 25;
      if (d.options.length >= 2) s += 20;
      if (d.reward && d.reward > 0) s += 15;
      return Math.min(100, s);
    }
    case 'hot-take': {
      let s = 40;
      if (block.data.text.length > 30) s += 35;
      if (block.data.text.length > 80) s += 25;
      return Math.min(100, s);
    }
    case 'update': {
      let s = 30;
      if (block.data.text.length > 20) s += 30;
      if (block.data.timestamp) s += 20;
      return Math.min(100, s);
    }
    default:
      return 50;
  }
}

/**
 * Engagement score (0–100). Returns 50 (neutral) when no signals exist.
 */
export function scoreEngagement(signals: EngagementSignals): number {
  const { impressions = 0, clicks = 0, likes = 0, shares = 0, pollVotes = 0, readThroughs = 0 } = signals;

  if (impressions + clicks + likes + shares + pollVotes + readThroughs === 0) {
    return 50;
  }

  let s = 0;
  if (impressions > 0) s += Math.min(30, (clicks / impressions) * 300);
  s += Math.min(25, likes * 2.5);
  s += Math.min(25, shares * 5);
  s += Math.min(10, pollVotes);
  s += Math.min(10, readThroughs * 2);
  return Math.min(100, s);
}

/**
 * Compute the weighted score from individual components.
 * Pure function — no side effects.
 */
export function computeWeightedScore(
  components: { freshness: number; priority: number; quality: number; engagement: number; recency: number },
  weights: Record<ScoreWeightKey, number> = SCORE_WEIGHTS as Record<ScoreWeightKey, number>,
): number {
  return (
    components.freshness   * weights.freshness +
    components.priority    * weights.priority +
    components.quality     * weights.quality +
    components.engagement  * weights.engagement +
    components.recency     * weights.recency
  );
}

/* ═══════════════════════════════════════════════════════
   SCORING PIPELINE
   ═══════════════════════════════════════════════════════ */

/**
 * Score a single feed item. Returns a RankedFeedItem with full breakdown.
 */
export function scoreFeedItem(
  item: FeedItem,
  engagement: EngagementSignals = {},
  now: number = Date.now(),
  hasFreshContent: boolean = false,
  weightOverrides?: Partial<Record<ScoreWeightKey, number>>,
): RankedFeedItem {
  const weights: Record<ScoreWeightKey, number> = { ...(SCORE_WEIGHTS as Record<ScoreWeightKey, number>), ...weightOverrides };

  const freshness = scoreFreshness(item.meta.publishedAt, now);
  const recency   = scoreRecency(item.meta.publishedAt, now);
  const priority  = KIND_PRIORITY[item.kind];
  const quality   = scoreQuality(item);
  const eng       = scoreEngagement(engagement);

  const window = classifyWindow(item.meta.publishedAt, now);
  const windowBoost = HOMEPAGE_WINDOWS[window].boostMultiplier;
  const stalenessMultiplier = computeStalenessMultiplier(item.meta.publishedAt, hasFreshContent, now);

  const rawWeighted = computeWeightedScore({ freshness, priority, quality, engagement: eng, recency }, weights);
  const final = rawWeighted * windowBoost * stalenessMultiplier;

  // Build reason annotations
  const reasons: string[] = [];
  reasons.push(`window:${window}`);
  if (freshness >= 90)             reasons.push('newly published');
  else if (freshness >= 70)        reasons.push('recent content');
  if (priority >= 85)              reasons.push(`high-priority ${item.kind}`);
  if (quality >= 80)               reasons.push('high quality content');
  if (eng >= 70)                   reasons.push('strong engagement');
  if (windowBoost > 1)             reasons.push(`breaking boost ×${windowBoost}`);
  if (stalenessMultiplier < 1)     reasons.push(`anti-stale ×${stalenessMultiplier}`);

  return {
    ...item,
    articleId:       item.meta.slug,
    sourceBlockType: item.block?.type ?? null,
    publishedAt:     item.meta.publishedAt || new Date(now).toISOString(),
    scoredAt:        new Date(now).toISOString(),
    engagement,
    score: {
      freshness,
      priority,
      quality,
      engagement: eng,
      recency,
      stalenessMultiplier,
      windowBoost,
      diversityPenalty: 0,
      final,
      window,
      reasons,
    },
  };
}

/**
 * Score all feed items. Detects fresh content presence for anti-staleness.
 */
export function scoreFeedItems(
  items: FeedItem[],
  now: number = Date.now(),
  engagementMap: Map<string, EngagementSignals> = new Map(),
  weightOverrides?: Partial<Record<ScoreWeightKey, number>>,
): RankedFeedItem[] {
  // Detect whether any item is in the breaking window → enables anti-staleness
  const hasFreshContent = items.some(
    (it) => ageMs(it.meta.publishedAt, now) <= FRESHNESS_WINDOWS.HIGH_MS,
  );

  return items.map((item) =>
    scoreFeedItem(item, engagementMap.get(item.id) ?? {}, now, hasFreshContent, weightOverrides),
  );
}

/* ═══════════════════════════════════════════════════════
   DIVERSITY BALANCING
   ═══════════════════════════════════════════════════════ */

/**
 * Count occurrences of a key in a slice of items.
 */
export function countInSlice<T>(items: T[], end: number, keyFn: (item: T) => string): Map<string, number> {
  const counts = new Map<string, number>();
  for (let i = 0; i < Math.min(end, items.length); i++) {
    const key = keyFn(items[i]);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

/**
 * Detect consecutive runs of the same key starting at index i.
 */
export function consecutiveRunLength<T>(items: T[], startIdx: number, keyFn: (item: T) => string): number {
  const key = keyFn(items[startIdx]);
  let len = 1;
  for (let j = startIdx + 1; j < items.length && keyFn(items[j]) === key; j++) len++;
  return len;
}

/**
 * Apply diversity penalties + re-sort.
 * Operates on the top DIVERSITY_LIMITS.TOP_VISIBLE_SLOTS positions.
 */
export function applyDiversityBalancing(items: RankedFeedItem[]): RankedFeedItem[] {
  const result = [...items];
  const { MAX_SAME_ARTICLE_IN_TOP, TOP_VISIBLE_SLOTS, MAX_CONSECUTIVE_SAME_KIND,
          MAX_SAME_TEAM_IN_TOP, MAX_SAME_KIND_IN_TOP, DIVERSITY_PENALTY } = DIVERSITY_LIMITS;

  // — Pass 1: article clustering in top 10
  const articleCounts = countInSlice(result, TOP_VISIBLE_SLOTS, (it) => it.articleId);
  for (let i = 0; i < Math.min(TOP_VISIBLE_SLOTS, result.length); i++) {
    const count = articleCounts.get(result[i].articleId) || 0;
    if (count > MAX_SAME_ARTICLE_IN_TOP) {
      result[i].score.diversityPenalty += DIVERSITY_PENALTY;
      result[i].score.reasons.push(`penalty: ${count}× same article in top ${TOP_VISIBLE_SLOTS}`);
    }
  }

  // — Pass 2: team clustering in top 10
  const teamCounts = countInSlice(result, TOP_VISIBLE_SLOTS, (it) => it.meta.team || '_none');
  for (let i = 0; i < Math.min(TOP_VISIBLE_SLOTS, result.length); i++) {
    const team = result[i].meta.team || '_none';
    if (team !== '_none' && (teamCounts.get(team) || 0) > MAX_SAME_TEAM_IN_TOP) {
      result[i].score.diversityPenalty += DIVERSITY_PENALTY * 0.5;
      result[i].score.reasons.push(`penalty: ${teamCounts.get(team)}× ${team} in top ${TOP_VISIBLE_SLOTS}`);
    }
  }

  // — Pass 3: kind saturation in top 10
  const kindCounts = countInSlice(result, TOP_VISIBLE_SLOTS, (it) => it.kind);
  for (let i = 0; i < Math.min(TOP_VISIBLE_SLOTS, result.length); i++) {
    const kind = result[i].kind;
    if ((kindCounts.get(kind) || 0) > MAX_SAME_KIND_IN_TOP) {
      result[i].score.diversityPenalty += DIVERSITY_PENALTY * 0.75;
      result[i].score.reasons.push(`penalty: ${kindCounts.get(kind)}× ${kind} in top ${TOP_VISIBLE_SLOTS}`);
    }
  }

  // Re-sort with penalties
  result.sort((a, b) => (b.score.final - b.score.diversityPenalty) - (a.score.final - a.score.diversityPenalty));

  // — Pass 4: break consecutive same-kind runs
  for (let i = 0; i < result.length; i++) {
    const run = consecutiveRunLength(result, i, (it) => it.kind);
    if (run > MAX_CONSECUTIVE_SAME_KIND) {
      const swapIdx = i + MAX_CONSECUTIVE_SAME_KIND;
      for (let k = swapIdx; k < result.length; k++) {
        if (result[k].kind !== result[i].kind) {
          [result[swapIdx], result[k]] = [result[k], result[swapIdx]];
          result[swapIdx].score.reasons.push('promoted: broke consecutive same-kind run');
          break;
        }
      }
    }
  }

  // — Pass 5: break consecutive same-article runs (any 2 in a row)
  for (let i = 0; i < result.length - 1; i++) {
    if (result[i].articleId === result[i + 1].articleId) {
      for (let k = i + 2; k < result.length; k++) {
        if (result[k].articleId !== result[i].articleId) {
          [result[i + 1], result[k]] = [result[k], result[i + 1]];
          result[i + 1].score.reasons.push('promoted: broke consecutive same-article run');
          break;
        }
      }
    }
  }

  // Recompute final with penalties
  for (const item of result) {
    const raw = computeWeightedScore(
      { freshness: item.score.freshness, priority: item.score.priority, quality: item.score.quality, engagement: item.score.engagement, recency: item.score.recency },
    );
    item.score.final = Math.max(0, raw * item.score.windowBoost * item.score.stalenessMultiplier - item.score.diversityPenalty);
  }

  return result;
}

/* ═══════════════════════════════════════════════════════
   MAIN RANKING API
   ═══════════════════════════════════════════════════════ */

/**
 * Primary entry point. Score → sort → diversify → trim.
 */
export function rankFeedItems({
  items,
  now = Date.now(),
  maxItems = 20,
  preserveVariety = true,
  freshnessWeight,
  engagementWeight,
  engagementMap = new Map(),
}: {
  items: FeedItem[];
  now?: number;
  maxItems?: number;
  preserveVariety?: boolean;
  freshnessWeight?: number;
  engagementWeight?: number;
  engagementMap?: Map<string, EngagementSignals>;
}): RankedFeedItem[] {
  const overrides: Partial<Record<ScoreWeightKey, number>> = {};
  if (freshnessWeight !== undefined)  overrides.freshness  = freshnessWeight;
  if (engagementWeight !== undefined) overrides.engagement = engagementWeight;

  let ranked = scoreFeedItems(items, now, engagementMap, overrides);
  ranked.sort((a, b) => b.score.final - a.score.final);

  if (preserveVariety) {
    ranked = applyDiversityBalancing(ranked);
  }

  return ranked.slice(0, maxItems);
}

/* ═══════════════════════════════════════════════════════
   FRESHNESS & STALENESS HELPERS
   ═══════════════════════════════════════════════════════ */

/** True if the item was published within the HIGH freshness window (24h). */
export function shouldPromoteFreshContent(
  item: FeedItem | RankedFeedItem,
  now: number = Date.now(),
): boolean {
  return ageMs(item.meta.publishedAt, now) <= FRESHNESS_WINDOWS.HIGH_MS;
}

/** True when the feed should be re-ranked (new content or stale computation). */
export function shouldRecomputeFeed(
  newestPublishedAt: string | undefined,
  lastComputedAt: string | undefined,
  now: number = Date.now(),
  staleThresholdMs: number = STALENESS.RECOMPUTE_MS,
): boolean {
  if (!lastComputedAt) return true;
  const lastComputed = parseTimestamp(lastComputedAt);
  if (isNaN(lastComputed)) return true;
  if (newestPublishedAt) {
    const newest = parseTimestamp(newestPublishedAt);
    if (!isNaN(newest) && newest > lastComputed) return true;
  }
  return (now - lastComputed) >= staleThresholdMs;
}

/** Re-score freshness on a single already-ranked item. */
export function applyFreshnessBoost(
  item: RankedFeedItem,
  now: number = Date.now(),
): RankedFeedItem {
  const newFreshness = scoreFreshness(item.meta.publishedAt, now);
  const newRecency   = scoreRecency(item.meta.publishedAt, now);
  const newWindow    = classifyWindow(item.meta.publishedAt, now);
  const newWindowBoost = HOMEPAGE_WINDOWS[newWindow].boostMultiplier;

  const raw = computeWeightedScore({
    freshness: newFreshness,
    priority: item.score.priority,
    quality: item.score.quality,
    engagement: item.score.engagement,
    recency: newRecency,
  });

  const reasons = item.score.reasons.filter((r) => !r.startsWith('freshness') && !r.startsWith('window:'));
  reasons.unshift(`window:${newWindow}`);
  if (newFreshness !== item.score.freshness) {
    reasons.push(`freshness ${item.score.freshness.toFixed(0)}→${newFreshness.toFixed(0)}`);
  }

  return {
    ...item,
    scoredAt: new Date(now).toISOString(),
    score: {
      ...item.score,
      freshness: newFreshness,
      recency: newRecency,
      window: newWindow,
      windowBoost: newWindowBoost,
      final: Math.max(0, raw * newWindowBoost * item.score.stalenessMultiplier - item.score.diversityPenalty),
      reasons,
    },
  };
}

/* ═══════════════════════════════════════════════════════
   DEBUG / ADMIN INSPECTION
   ═══════════════════════════════════════════════════════ */

/** Compact debug string for a single ranked item. */
export function formatItemDebug(item: RankedFeedItem): string {
  const s = item.score;
  const parts = [
    `#${item.id}`,
    `[${item.kind}]`,
    `window=${s.window}`,
    `final=${s.final.toFixed(1)}`,
    `fresh=${s.freshness.toFixed(0)}`,
    `pri=${s.priority}`,
    `qual=${s.quality.toFixed(0)}`,
    `eng=${s.engagement.toFixed(0)}`,
    `rec=${s.recency.toFixed(0)}`,
  ];
  if (s.stalenessMultiplier < 1)  parts.push(`stale=×${s.stalenessMultiplier}`);
  if (s.windowBoost !== 1)        parts.push(`wboost=×${s.windowBoost}`);
  if (s.diversityPenalty > 0)     parts.push(`divPen=-${s.diversityPenalty.toFixed(1)}`);
  if (s.reasons.length > 0)       parts.push(`| ${s.reasons.join(', ')}`);
  return parts.join(' ');
}

/** Full debug dump for a ranked feed. Returns a multi-line string. */
export function formatRankingDebug(items: RankedFeedItem[]): string {
  const header = `Feed ranking: ${items.length} items, scored at ${items[0]?.scoredAt ?? 'n/a'}`;
  const windowSummary = summarizeWindows(items);
  const kindSummary = summarizeKinds(items);
  const lines = items.map((item, i) => `  ${String(i + 1).padStart(2)}. ${formatItemDebug(item)}`);
  return [
    header,
    `  Windows: ${windowSummary}`,
    `  Kinds:   ${kindSummary}`,
    '  ─────────────────────────────────────────',
    ...lines,
  ].join('\n');
}

/** Summarize window distribution. */
export function summarizeWindows(items: RankedFeedItem[]): string {
  const counts: Record<string, number> = {};
  for (const it of items) counts[it.score.window] = (counts[it.score.window] || 0) + 1;
  return Object.entries(counts).map(([w, c]) => `${w}:${c}`).join(' ');
}

/** Summarize kind distribution. */
export function summarizeKinds(items: RankedFeedItem[]): string {
  const counts: Record<string, number> = {};
  for (const it of items) counts[it.kind] = (counts[it.kind] || 0) + 1;
  return Object.entries(counts).map(([k, c]) => `${k}:${c}`).join(' ');
}

/** JSON-friendly debug snapshot for admin panels. */
export interface FeedDebugSnapshot {
  scoredAt: string;
  itemCount: number;
  windowDistribution: Record<string, number>;
  kindDistribution: Record<string, number>;
  topItems: Array<{
    rank: number;
    id: string;
    kind: FeedCardKind;
    articleId: string;
    window: HomepageWindow;
    finalScore: number;
    breakdown: ScoreBreakdown;
  }>;
}

/** Generate a JSON-serializable debug snapshot. */
export function createDebugSnapshot(items: RankedFeedItem[], topN = 10): FeedDebugSnapshot {
  const windowDist: Record<string, number> = {};
  const kindDist: Record<string, number> = {};
  for (const it of items) {
    windowDist[it.score.window] = (windowDist[it.score.window] || 0) + 1;
    kindDist[it.kind] = (kindDist[it.kind] || 0) + 1;
  }

  return {
    scoredAt: items[0]?.scoredAt ?? new Date().toISOString(),
    itemCount: items.length,
    windowDistribution: windowDist,
    kindDistribution: kindDist,
    topItems: items.slice(0, topN).map((it, i) => ({
      rank: i + 1,
      id: it.id,
      kind: it.kind,
      articleId: it.articleId,
      window: it.score.window,
      finalScore: Math.round(it.score.final * 10) / 10,
      breakdown: it.score,
    })),
  };
}
