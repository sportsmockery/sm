import type { CardType, RiverCard } from './river-types';
import {
  calculatePostScore,
  calculateAnonymousScore,
  type Post,
  type ScoringContext,
  type UserEngagementProfile,
  DEFAULT_ENGAGEMENT_PROFILE,
} from './scoring-v2';

export interface ScoredCard {
  card: RiverCard;
  card_type: CardType;
  score: number;
}

export interface RiverScoringContext {
  user: UserEngagementProfile | null;
  isLoggedIn: boolean;
  viewedPostIds: Set<string>;
  algorithmState: 'standard' | 'game_day_active';
  teamFilter: string | null;
}

/**
 * Score a post-derived candidate (scout_summary or trending_article)
 * using the composite formula on top of scoring-v2.
 */
export function scorePostCandidate(
  post: {
    id: string;
    published_at: string;
    team_slug: string | null;
    view_count: number;
    engagement_velocity: number;
    importance_score?: number | null;
  },
  ctx: RiverScoringContext
): number {
  const scoringPost: Post = {
    id: post.id,
    importance_score: post.importance_score ?? 50,
    published_at: post.published_at,
    team_slug: post.team_slug ?? '',
    is_trending: (post.engagement_velocity ?? 0) > 5,
    content_type: 'article',
    primary_topic: null,
    author_id: null,
    views: post.view_count ?? 0,
  };

  const scoringContext: ScoringContext = {
    user: ctx.user ?? DEFAULT_ENGAGEMENT_PROFILE,
    viewedPostIds: ctx.viewedPostIds,
    isLoggedIn: ctx.isLoggedIn,
  };

  const baseScore = ctx.isLoggedIn
    ? calculatePostScore(scoringPost, scoringContext)
    : calculateAnonymousScore(scoringPost);

  // Composite formula weights
  const userAffinity = ctx.isLoggedIn ? baseScore * 0.4 : 0;
  const recency = recencyScore(post.published_at) * 0.25;
  const engagement = Math.min((post.engagement_velocity ?? 0) * 2, 30) * 0.2;
  const teamPref = ctx.teamFilter && post.team_slug === ctx.teamFilter ? 15 : 0;
  const teamWeight = teamPref * 0.15;

  const composite = ctx.isLoggedIn
    ? userAffinity + recency + engagement + teamWeight
    : baseScore * 0.5 + recency + engagement + teamWeight;

  return Math.round(composite);
}

function recencyScore(publishedAt: string): number {
  const hoursOld = Math.max(0, (Date.now() - new Date(publishedAt).getTime()) / 3_600_000);
  if (hoursOld < 1) return 100;
  if (hoursOld < 6) return 80;
  if (hoursOld < 24) return 50;
  if (hoursOld < 48) return 25;
  return Math.max(0, 10 - hoursOld / 24);
}

/**
 * Score non-post candidates (box_score, hub_update, trade_proposal, etc.)
 */
export function scoreGenericCandidate(
  cardType: CardType,
  timestamp: string | null,
  teamSlug: string | null,
  ctx: RiverScoringContext,
  extraBoost: number = 0
): number {
  const recency = timestamp ? recencyScore(timestamp) : 50;
  const teamBoost = ctx.teamFilter && teamSlug === ctx.teamFilter ? 15 : 0;
  const gameDayBoost = ctx.algorithmState === 'game_day_active' && cardType === 'box_score' ? 20 : 0;

  return Math.round(recency * 0.6 + teamBoost + gameDayBoost + extraBoost);
}

/**
 * Score and sort all river candidates.
 */
export function scoreRiverCandidates(
  candidates: ScoredCard[],
  ctx: RiverScoringContext
): ScoredCard[] {
  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}
