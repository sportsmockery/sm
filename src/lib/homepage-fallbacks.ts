// src/lib/homepage-fallbacks.ts
// Fallback data for empty database scenarios

export const FALLBACK_EDITOR_PICKS = [
  {
    id: 'fallback-1',
    title: 'Welcome to SportsMockery - Your Source for Chicago Sports',
    slug: 'welcome-to-sportsmockery',
    featured_image: '/images/fallback/chicago-skyline.jpg',
    team_slug: 'bears',
    pinned_slot: 1
  },
  {
    id: 'fallback-2',
    title: 'Bears News and Analysis - Daily Updates',
    slug: 'bears-news-analysis',
    featured_image: '/images/fallback/bears-stadium.jpg',
    team_slug: 'bears',
    pinned_slot: 2
  },
  {
    id: 'fallback-3',
    title: 'Bulls Coverage - Scores, Trades, and Rumors',
    slug: 'bulls-coverage',
    featured_image: '/images/fallback/bulls-arena.jpg',
    team_slug: 'bulls',
    pinned_slot: 3
  }
];

export const FALLBACK_POSTS = [
  {
    id: 'fallback-post-1',
    title: 'Check back soon for the latest Chicago sports news',
    slug: 'latest-news',
    excerpt: 'Our team is working on bringing you the best Chicago sports coverage.',
    featured_image: null,
    team_slug: 'bears',
    author_name: 'SportsMockery Staff',
    published_at: new Date().toISOString(),
    content_type: 'article',
    is_trending: false,
    is_evergreen: false,
    importance_score: 50,
    views: 0,
    author_id: null,
    primary_topic: null
  }
];

export function getHomepageDataWithFallbacks(
  editorPicks: any[],
  rankedPosts: any[],
  trendingPosts: any[]
) {
  return {
    editorPicks: editorPicks.length > 0 ? editorPicks : FALLBACK_EDITOR_PICKS,
    rankedPosts: rankedPosts.length > 0 ? rankedPosts : FALLBACK_POSTS,
    trendingPosts: trendingPosts.length > 0 ? trendingPosts : []
  };
}
