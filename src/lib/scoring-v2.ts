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
    'bears': 40,
    'cubs': 25,
    'bulls': 15,
    'white-sox': 10,
    'blackhawks': 10
  },
  format_prefs: {
    'article': 50,
    'video': 50,
    'analysis': 50
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
 * Centered on 50 (default). Range: -30 to +30.
 * Slider 100 = +30, Slider 50 = 0, Slider 1 = -29.4
 * (Slider 0 is handled by filterBlockedTeams — hard removal)
 */
function calculateTeamAffinity(post: Post, user: UserEngagementProfile | null): number {
  if (!user || !post.team_slug) return 0;
  const teamEngagement = user.team_scores[post.team_slug];
  if (teamEngagement === undefined) return 0;
  // Center on 50: below 50 = penalty, above 50 = boost
  return Math.round((teamEngagement - 50) * 0.6);
}

/**
 * Content format preference boost
 * Centered on 50 (default). Range: -15 to +15.
 * Slider 100 = +15, Slider 50 = 0, Slider 0 = -15
 */
function calculateContentTypeBoost(post: Post, user: UserEngagementProfile | null): number {
  if (!user) return 0;
  const formatPref = user.format_prefs[post.content_type];
  if (formatPref === undefined) return 0;
  // Center on 50: below 50 = penalty, above 50 = boost
  return Math.round((formatPref - 50) * 0.3);
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
 * Hard-filter posts by team preferences.
 * If a user has explicitly set a team to 0%, those posts are removed entirely.
 * Posts with no team_slug (general content) are always kept.
 */
export function filterBlockedTeams<T extends { team_slug?: string | null }>(
  posts: T[],
  user: UserEngagementProfile | null
): T[] {
  if (!user) return posts;

  // Build set of blocked teams (score === 0)
  const blocked = new Set<string>();
  for (const [team, score] of Object.entries(user.team_scores)) {
    if (score === 0) {
      blocked.add(team);
      // Handle whitesox/white-sox mismatch
      if (team === 'white-sox') blocked.add('whitesox');
      if (team === 'whitesox') blocked.add('white-sox');
    }
  }

  if (blocked.size === 0) return posts;

  return posts.filter(post => {
    const slug = post.team_slug;
    // Keep posts with no team (general content)
    if (!slug) return true;
    return !blocked.has(slug);
  });
}

/**
 * Sort posts by score
 */
export function sortPostsByScore(posts: Post[], context: ScoringContext): Post[] {
  // Hard-filter: remove posts from teams the user set to 0%
  const filtered = filterBlockedTeams(posts, context.user);

  const scoredPosts = filtered.map(post => ({
    post,
    score: context.isLoggedIn
      ? calculatePostScore(post, context)
      : calculateAnonymousScore(post)
  }));

  scoredPosts.sort((a, b) => b.score - a.score);

  return scoredPosts.map(sp => sp.post);
}
