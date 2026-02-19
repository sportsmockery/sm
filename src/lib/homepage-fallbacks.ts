// src/lib/homepage-fallbacks.ts
// Fallback data for when database queries return empty

const TEAM_GRADIENTS: Record<string, string> = {
  bears: 'linear-gradient(135deg, #0B162A, #C83803)',
  bulls: 'linear-gradient(135deg, #CE1141, #000000)',
  blackhawks: 'linear-gradient(135deg, #CF0A2C, #000000)',
  cubs: 'linear-gradient(135deg, #0E3386, #CC3433)',
  'white-sox': 'linear-gradient(135deg, #27251F, #C4CED4)',
};

export function getPlaceholderGradient(teamSlug: string | null): string {
  if (!teamSlug) return 'linear-gradient(135deg, #1a1a2e, #bc0000)';
  return TEAM_GRADIENTS[teamSlug] || 'linear-gradient(135deg, #1a1a2e, #bc0000)';
}

export function getArticleImage(post: { featured_image: string | null; team_slug: string | null }): string | null {
  return post.featured_image;
}

export const FALLBACK_EDITOR_PICKS = [
  {
    id: 'fallback-1',
    title: 'Meet Scout AI — Your Chicago Sports Expert',
    slug: 'scout-ai',
    featured_image: null,
    team_slug: null,
    category_slug: null,
    content_type: 'analysis',
    pinned_slot: 1,
    placeholder_gradient: 'linear-gradient(135deg, #1a1a2e, #bc0000)',
  },
  {
    id: 'fallback-2',
    title: 'GM Simulator — Build Your Dream Roster',
    slug: 'gm',
    featured_image: null,
    team_slug: null,
    category_slug: null,
    content_type: 'article',
    pinned_slot: 2,
    placeholder_gradient: 'linear-gradient(135deg, #0B162A, #C83803)',
  },
  {
    id: 'fallback-3',
    title: 'Mock Draft — Make Your Picks Before the Pros',
    slug: 'mock-draft',
    featured_image: null,
    team_slug: null,
    category_slug: null,
    content_type: 'article',
    pinned_slot: 3,
    placeholder_gradient: 'linear-gradient(135deg, #0E3386, #CC3433)',
  },
];

export const FALLBACK_POSTS = [
  {
    id: 'fallback-post-1',
    title: 'Welcome to SportsMockery — Chicago Sports, Reimagined',
    slug: 'scout-ai',
    excerpt: 'AI-powered analysis, real-time scores, trade simulators — all five Chicago teams, one platform.',
    featured_image: null,
    team_slug: 'bears',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: true,
    importance_score: 80,
    views: 100,
    author_id: null,
    primary_topic: 'general',
    category_slug: null,
    placeholder_gradient: getPlaceholderGradient('bears'),
  },
  {
    id: 'fallback-post-2',
    title: 'Ask Scout AI Anything About Chicago Sports',
    slug: 'scout-ai',
    excerpt: 'Get instant answers about Bears, Bulls, Blackhawks, Cubs, and White Sox.',
    featured_image: null,
    team_slug: 'bulls',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'analysis',
    is_trending: true,
    is_evergreen: true,
    importance_score: 75,
    views: 50,
    author_id: null,
    primary_topic: 'general',
    category_slug: null,
    placeholder_gradient: getPlaceholderGradient('bulls'),
  },
  {
    id: 'fallback-post-3',
    title: 'Build & Grade Trades in the GM Simulator',
    slug: 'gm',
    excerpt: 'Think you can be a better GM? Put your trades to the test.',
    featured_image: null,
    team_slug: 'cubs',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: true,
    importance_score: 70,
    views: 40,
    author_id: null,
    primary_topic: 'general',
    category_slug: null,
    placeholder_gradient: getPlaceholderGradient('cubs'),
  },
  {
    id: 'fallback-post-4',
    title: 'Simulate Your Mock Draft',
    slug: 'mock-draft',
    excerpt: 'Make your picks before the pros do. NFL and MLB drafts available.',
    featured_image: null,
    team_slug: 'blackhawks',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: true,
    importance_score: 65,
    views: 30,
    author_id: null,
    primary_topic: 'general',
    category_slug: null,
    placeholder_gradient: getPlaceholderGradient('blackhawks'),
  },
  {
    id: 'fallback-post-5',
    title: 'Join the Fan Zone — Chat With Chicago Fans',
    slug: 'fan-zone',
    excerpt: 'Talk sports with AI-powered personalities and fellow Chicago fans.',
    featured_image: null,
    team_slug: 'white-sox',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: true,
    importance_score: 60,
    views: 25,
    author_id: null,
    primary_topic: 'general',
    category_slug: null,
    placeholder_gradient: getPlaceholderGradient('white-sox'),
  },
];

export function getHomepageDataWithFallbacks(
  editorPicks: any[],
  rankedPosts: any[],
  trendingPosts: any[]
): {
  editorPicks: any[];
  rankedPosts: any[];
  trendingPosts: any[];
} {
  const hasEditorPicks = Array.isArray(editorPicks) && editorPicks.length > 0;
  const hasRankedPosts = Array.isArray(rankedPosts) && rankedPosts.length > 0;
  const hasTrendingPosts = Array.isArray(trendingPosts) && trendingPosts.length > 0;

  return {
    editorPicks: hasEditorPicks ? editorPicks : FALLBACK_EDITOR_PICKS,
    rankedPosts: hasRankedPosts ? rankedPosts : FALLBACK_POSTS,
    trendingPosts: hasTrendingPosts ? trendingPosts : FALLBACK_POSTS.filter(p => p.is_trending),
  };
}
