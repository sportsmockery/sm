// src/lib/scoring-v2.ts
// SportsMockery Post Scoring System V2

export interface Post {
  id: string;
  importance_score: number | null;
  published_at: string;
  team_slug: string;
  is_trending: boolean;
  content_type: 'article' | 'video' | 'analysis' | 'podcast' | 'gallery';
  primary_topic: string | null;
  author_id: string | null;
  views: number;
}

export interface UserEngagementProfile {
  user_id: string | null;
  team_scores: Record<string, number>;
  format_prefs: Record<string, number>;
  author_reads: Record<string, number>;
  topic_views_today: Record<string, number>;
}

export interface ScoringContext {
  user: UserEngagementProfile | null;
  viewedPostIds: Set<string>;
  isLoggedIn: boolean;
}

// Default profile for anonymous users
export const DEFAULT_ENGAGEMENT_PROFILE: UserEngagementProfile = {
  user_id: null,
  team_scores: {
    'bears': 50,
    'bulls': 30,
    'blackhawks': 30,
    'cubs': 30,
    'white-sox': 30
  },
  format_prefs: {
    'article': 0.33,
    'video': 0.33,
    'analysis': 0.34
  },
  author_reads: {},
  topic_views_today: {}
};

/**
 * Calculate hours since publication
 */
function getHoursOld(publishedAt: string): number {
  const published = new Date(publishedAt).getTime();
  const now = Date.now();
  return Math.max(0, (now - published) / (1000 * 60 * 60));
}

/**
 * Exponential recency decay
 * 0-6 hours: 0 penalty
 * 6-24 hours: -2 penalty
 * 1+ days: exponential curve, max -50
 */
function calculateRecencyDecay(hoursOld: number): number {
  if (hoursOld < 6) return 0;
  if (hoursOld < 24) return -2;
  const daysOld = hoursOld / 24;
  return -Math.min(Math.pow(daysOld, 1.3) * 4, 50);
}

/**
 * Multi-team weighted affinity score
 * Returns 0-20 based on user's engagement with team
 */
function calculateTeamAffinity(post: Post, user: UserEngagementProfile | null): number {
  if (!user || !post.team_slug) return 0;
  const teamEngagement = user.team_scores[post.team_slug] || 0;
  return Math.round(teamEngagement * 0.2);
}

/**
 * Content format preference boost
 * Returns -10 to +20 based on user's format preferences
 */
function calculateContentTypeBoost(post: Post, user: UserEngagementProfile | null): number {
  if (!user) return 0;
  const formatPref = user.format_prefs[post.content_type] || 0.33;
  return Math.round((formatPref - 0.33) * 30);
}

/**
 * Author affinity based on read history
 * Returns 0, 4, 8, or 12 based on reads
 */
function calculateAuthorAffinity(post: Post, user: UserEngagementProfile | null): number {
  if (!user || !post.author_id) return 0;
  const authorReads = user.author_reads[post.author_id] || 0;
  if (authorReads >= 10) return 12;
  if (authorReads >= 5) return 8;
  if (authorReads >= 2) return 4;
  return 0;
}

/**
 * Topic fatigue penalty
 * Returns 0, -8, or -15 based on topic saturation
 */
function calculateFatiguePenalty(post: Post, user: UserEngagementProfile | null): number {
  if (!user || !post.primary_topic) return 0;
  const topicViewsToday = user.topic_views_today[post.primary_topic] || 0;
  if (topicViewsToday > 5) return -15;
  if (topicViewsToday > 3) return -8;
  return 0;
}

/**
 * Main scoring function V2
 */
export function calculatePostScore(post: Post, context: ScoringContext): number {
  const baseScore = post.importance_score ?? 50;
  const hoursOld = getHoursOld(post.published_at);

  const recencyDecay = calculateRecencyDecay(hoursOld);
  const teamAffinity = calculateTeamAffinity(post, context.user);
  const trendingBoost = post.is_trending ? 10 : 0;
  const unseenBonus = context.viewedPostIds.has(post.id) ? 0 : 5;
  const contentTypeBoost = calculateContentTypeBoost(post, context.user);
  const authorAffinity = calculateAuthorAffinity(post, context.user);
  const fatiguePenalty = calculateFatiguePenalty(post, context.user);

  const finalScore = baseScore
    + recencyDecay
    + teamAffinity
    + trendingBoost
    + unseenBonus
    + contentTypeBoost
    + authorAffinity
    + fatiguePenalty;

  return Math.round(finalScore);
}

/**
 * Score for anonymous users (no personalization)
 */
export function calculateAnonymousScore(post: Post): number {
  const baseScore = post.importance_score ?? 50;
  const hoursOld = getHoursOld(post.published_at);
  const recencyDecay = calculateRecencyDecay(hoursOld);
  const trendingBoost = post.is_trending ? 10 : 0;
  const viewsBoost = Math.min(Math.log10(post.views + 1) * 3, 10);

  return Math.round(baseScore + recencyDecay + trendingBoost + viewsBoost);
}

/**
 * Sort posts by score
 */
export function sortPostsByScore(posts: Post[], context: ScoringContext): Post[] {
  const scoredPosts = posts.map(post => ({
    post,
    score: context.isLoggedIn
      ? calculatePostScore(post, context)
      : calculateAnonymousScore(post)
  }));

  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.map(sp => sp.post);
}
