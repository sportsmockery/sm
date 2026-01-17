/**
 * Bears-specific data functions
 * Provides Bears season data, player info, and trending topics
 */

import { supabaseAdmin, POST_SUMMARY_SELECT, TEAM_CATEGORY_SLUGS } from './db'
import {
  BearsSeasonOverview,
  BearsPlayer,
  BearsTrend,
  PostSummary,
  categorySlugToTeam
} from './types'

/**
 * Get Bears season overview data
 * Returns current record, standings, next/last game info
 */
export async function getBearsSeasonOverview(): Promise<BearsSeasonOverview> {
  // In production, this would fetch from a sports API
  // For now, return stub data
  return {
    season: 2024,
    record: {
      wins: 4,
      losses: 8,
      ties: 0,
    },
    standing: '4th in NFC North',
    nextGame: {
      opponent: 'Green Bay Packers',
      date: '2024-12-22',
      time: '12:00 PM CT',
      isHome: true,
    },
    lastGame: {
      opponent: 'Minnesota Vikings',
      result: 'L',
      score: '17-30',
    },
  }
}

/**
 * Get Bears key players for roster highlights
 */
export async function getBearsKeyPlayers(): Promise<BearsPlayer[]> {
  // In production, this would fetch from a sports API
  return [
    {
      id: 1,
      name: 'Caleb Williams',
      position: 'QB',
      number: 18,
      imageUrl: '/images/players/williams.jpg',
      stats: {
        passingYards: 2654,
        touchdowns: 15,
        interceptions: 5,
        rating: 89.2,
      },
    },
    {
      id: 2,
      name: "D'Andre Swift",
      position: 'RB',
      number: 4,
      imageUrl: '/images/players/swift.jpg',
      stats: {
        rushingYards: 687,
        touchdowns: 4,
        yardsPerCarry: 4.1,
      },
    },
    {
      id: 3,
      name: 'DJ Moore',
      position: 'WR',
      number: 2,
      imageUrl: '/images/players/moore.jpg',
      stats: {
        receptions: 58,
        receivingYards: 712,
        touchdowns: 4,
      },
    },
    {
      id: 4,
      name: 'Rome Odunze',
      position: 'WR',
      number: 15,
      imageUrl: '/images/players/odunze.jpg',
      stats: {
        receptions: 42,
        receivingYards: 478,
        touchdowns: 2,
      },
    },
    {
      id: 5,
      name: 'Montez Sweat',
      position: 'DE',
      number: 98,
      imageUrl: '/images/players/sweat.jpg',
      stats: {
        sacks: 6.5,
        tackles: 38,
        forcedFumbles: 2,
      },
    },
  ]
}

/**
 * Get trending Bears topics from recent articles
 */
export async function getBearsTrends(): Promise<BearsTrend[]> {
  // Fetch recent Bears articles and extract common topics
  const { data: posts } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug')
    .eq('status', 'published')
    .in('category_id', await getBearsCategoryIds())
    .order('published_at', { ascending: false })
    .limit(50)

  // Extract common themes from titles (simplified)
  // In production, this would use NLP or tag analysis
  const trends: BearsTrend[] = [
    {
      id: 1,
      title: 'Caleb Williams Development',
      slug: 'caleb-williams',
      postCount: 12,
      isHot: true,
    },
    {
      id: 2,
      title: 'Offensive Line Struggles',
      slug: 'offensive-line',
      postCount: 8,
      isHot: true,
    },
    {
      id: 3,
      title: 'Coaching Changes',
      slug: 'coaching',
      postCount: 6,
    },
    {
      id: 4,
      title: 'Draft Preview 2025',
      slug: 'draft-2025',
      postCount: 5,
    },
    {
      id: 5,
      title: 'Soldier Field Future',
      slug: 'stadium',
      postCount: 4,
    },
  ]

  return trends
}

/**
 * Get Bears category IDs for queries
 */
async function getBearsCategoryIds(): Promise<number[]> {
  const { data: categories } = await supabaseAdmin
    .from('sm_categories')
    .select('id')
    .in('slug', TEAM_CATEGORY_SLUGS.bears)

  return categories?.map(c => c.id) || []
}

/**
 * Get latest Bears posts
 */
export async function getBearsPosts(limit: number = 10): Promise<PostSummary[]> {
  const categoryIds = await getBearsCategoryIds()

  if (categoryIds.length === 0) {
    return []
  }

  const { data: posts, error } = await supabaseAdmin
    .from('sm_posts')
    .select(POST_SUMMARY_SELECT)
    .eq('status', 'published')
    .in('category_id', categoryIds)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching Bears posts:', error)
    return []
  }

  return (posts || []).map(mapToPostSummary)
}

/**
 * Get Bears posts by type (news, rumors, analysis)
 */
export async function getBearsPostsByType(
  type: 'news' | 'rumor' | 'analysis',
  limit: number = 5
): Promise<PostSummary[]> {
  const categoryIds = await getBearsCategoryIds()

  if (categoryIds.length === 0) {
    return []
  }

  // Filter by title keywords for type (simplified approach)
  // In production, posts would have a type field
  const typeKeywords: Record<string, string[]> = {
    news: ['news', 'report', 'update', 'breaking'],
    rumor: ['rumor', 'could', 'may', 'might', 'trade', 'signing'],
    analysis: ['analysis', 'breakdown', 'film', 'review', 'grade'],
  }

  const { data: posts, error } = await supabaseAdmin
    .from('sm_posts')
    .select(POST_SUMMARY_SELECT)
    .eq('status', 'published')
    .in('category_id', categoryIds)
    .order('published_at', { ascending: false })
    .limit(50) // Fetch more to filter

  if (error) {
    console.error('Error fetching Bears posts by type:', error)
    return []
  }

  // Filter by keywords in title
  const keywords = typeKeywords[type] || []
  const filtered = (posts || [])
    .filter(post =>
      keywords.some(kw => post.title.toLowerCase().includes(kw))
    )
    .slice(0, limit)

  return filtered.map(mapToPostSummary)
}

/**
 * Get AI-powered question suggestions for Bears content
 */
export function getAskBearsAISuggestions(
  categoryType: 'news' | 'rumor' | 'analysis' | 'default' = 'default'
): string[] {
  const suggestions: Record<string, string[]> = {
    news: [
      'What happened in the latest Bears game?',
      'Who are the injury updates for the Bears?',
      'What are the Bears playoff scenarios?',
    ],
    rumor: [
      'What trade rumors are surrounding the Bears?',
      'Will the Bears make coaching changes?',
      'What free agents might the Bears target?',
    ],
    analysis: [
      'How is Caleb Williams developing?',
      'What are the Bears biggest weaknesses?',
      'Grade the Bears draft class so far',
    ],
    default: [
      'How are the Bears doing this season?',
      'What should the Bears do in the draft?',
      'Summarize the latest Bears news',
      'Who are the top Bears players this year?',
      'What are fans saying about the Bears?',
    ],
  }

  return suggestions[categoryType] || suggestions.default
}

/**
 * Get Bears storyline links for navigation
 */
export function getBearsStorylineLinks(): Array<{
  title: string
  slug: string
  description: string
}> {
  return [
    {
      title: 'Caleb Williams Watch',
      slug: '/bears/caleb-williams',
      description: 'Track the rookie QB development',
    },
    {
      title: 'Coaching Staff',
      slug: '/bears/coaching',
      description: 'Matt Eberflus and staff updates',
    },
    {
      title: 'Draft Central',
      slug: '/bears/draft',
      description: '2025 NFL Draft coverage',
    },
    {
      title: 'Stadium News',
      slug: '/bears/stadium',
      description: 'Soldier Field and Arlington Heights updates',
    },
    {
      title: 'Injury Report',
      slug: '/bears/injuries',
      description: 'Latest injury updates',
    },
  ]
}

/**
 * Map database row to PostSummary type
 */
function mapToPostSummary(row: any): PostSummary {
  const category = row.category || {}
  const author = row.author || {}

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    featuredImage: row.featured_image,
    publishedAt: row.published_at,
    views: row.views || 0,
    author: {
      id: author.id || 0,
      displayName: author.display_name || 'Staff',
      avatarUrl: author.avatar_url || null,
    },
    team: categorySlugToTeam(category.slug),
    categorySlug: category.slug || 'bears',
    categoryName: category.name || 'Bears',
  }
}
