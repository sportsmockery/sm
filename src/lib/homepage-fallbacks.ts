// src/lib/homepage-fallbacks.ts
// Fallback data for when database queries return empty

export const FALLBACK_EDITOR_PICKS = [
  {
    id: 'fallback-1',
    title: 'Welcome to SportsMockery - Your Source for Chicago Sports',
    slug: 'welcome-to-sportsmockery',
    featured_image: null,
    team_slug: 'bears',
    category_slug: null,
    pinned_slot: 1
  },
  {
    id: 'fallback-2',
    title: 'Bears News and Analysis - Daily Updates',
    slug: 'bears-news-analysis',
    featured_image: null,
    team_slug: 'bears',
    category_slug: null,
    pinned_slot: 2
  },
  {
    id: 'fallback-3',
    title: 'Bulls Coverage - Scores, Trades, and Rumors',
    slug: 'bulls-coverage',
    featured_image: null,
    team_slug: 'bulls',
    category_slug: null,
    pinned_slot: 3
  }
];

export const FALLBACK_POSTS = [
  {
    id: 'fallback-post-1',
    title: 'Welcome to SportsMockery - Chicago Sports Coverage',
    slug: 'welcome',
    excerpt: 'Your home for Bears, Bulls, Blackhawks, Cubs, and White Sox news.',
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
    category_slug: null
  },
  {
    id: 'fallback-post-2',
    title: 'Chicago Bears - Latest News and Rumors',
    slug: 'bears-news',
    excerpt: 'Stay updated with the latest Bears coverage.',
    featured_image: null,
    team_slug: 'bears',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: true,
    is_evergreen: false,
    importance_score: 75,
    views: 50,
    author_id: null,
    primary_topic: 'bears',
    category_slug: null
  },
  {
    id: 'fallback-post-3',
    title: 'Chicago Bulls - Scores and Updates',
    slug: 'bulls-news',
    excerpt: 'Follow the Bulls throughout the season.',
    featured_image: null,
    team_slug: 'bulls',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: false,
    importance_score: 70,
    views: 40,
    author_id: null,
    primary_topic: 'bulls',
    category_slug: null
  },
  {
    id: 'fallback-post-4',
    title: 'Chicago Blackhawks - Season Coverage',
    slug: 'blackhawks-news',
    excerpt: 'Your source for Blackhawks news and analysis.',
    featured_image: null,
    team_slug: 'blackhawks',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: false,
    importance_score: 65,
    views: 30,
    author_id: null,
    primary_topic: 'blackhawks'
  },
  {
    id: 'fallback-post-5',
    title: 'Chicago Cubs - News and Updates',
    slug: 'cubs-news',
    excerpt: 'Cubs coverage throughout the season.',
    featured_image: null,
    team_slug: 'cubs',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: false,
    importance_score: 60,
    views: 25,
    author_id: null,
    primary_topic: 'cubs'
  }
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
    trendingPosts: hasTrendingPosts ? trendingPosts : FALLBACK_POSTS.filter(p => p.is_trending)
  };
}
