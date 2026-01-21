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
import { fetchTeamRecord, fetchNextGame } from './team-config'
import { getBearsSchedule } from './bearsData'

/**
 * Get Bears season overview data
 * Returns current record, standings, next/last game info
 * Now fetches LIVE data from ESPN API and Datalab
 */
export async function getBearsSeasonOverview(): Promise<BearsSeasonOverview> {
  try {
    // Fetch live data from ESPN API and Datalab in parallel
    const [espnRecord, espnNextGame, schedule] = await Promise.all([
      fetchTeamRecord('bears'),
      fetchNextGame('bears'),
      getBearsSchedule(2025),
    ])

    // Get the most recent completed game for "last game" info
    const completedGames = schedule
      .filter(g => g.status === 'final')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const lastGame = completedGames[0]

    // Use ESPN data if available, otherwise fall back to calculated data from schedule
    const wins = espnRecord?.wins ?? completedGames.filter(g => g.result === 'W').length
    const losses = espnRecord?.losses ?? completedGames.filter(g => g.result === 'L').length
    const ties = espnRecord?.ties ?? 0

    // Calculate standing (simplified - could be enhanced with division standings API)
    const standing = `${wins}-${losses} in NFC North`

    return {
      season: 2025,
      record: {
        wins,
        losses,
        ties,
      },
      standing,
      nextGame: espnNextGame ? {
        opponent: espnNextGame.opponent,
        date: espnNextGame.date,
        time: espnNextGame.time,
        isHome: espnNextGame.isHome,
      } : null,
      lastGame: lastGame ? {
        opponent: lastGame.opponent,
        result: lastGame.result as 'W' | 'L' | 'T',
        score: `${lastGame.bearsScore}-${lastGame.oppScore}`,
      } : null,
    }
  } catch (error) {
    console.error('Error fetching Bears season overview:', error)
    // Return minimal data on error
    return {
      season: 2025,
      record: { wins: 0, losses: 0, ties: 0 },
      standing: 'NFC North',
      nextGame: null,
      lastGame: null,
    }
  }
}

/**
 * Get Bears key players for roster highlights
 * Now fetches LIVE data from Datalab
 */
export async function getBearsKeyPlayers(): Promise<BearsPlayer[]> {
  try {
    // Import dynamically to avoid circular dependency
    const { getBearsStats, getBearsPlayers } = await import('./bearsData')

    // Get players and stats from Datalab
    const [players, stats] = await Promise.all([
      getBearsPlayers(),
      getBearsStats(2025),
    ])

    const { leaderboards } = stats

    // Build key players from leaderboard data (top performers)
    const keyPlayers: BearsPlayer[] = []

    // Add top passer
    if (leaderboards.passing[0]) {
      const p = leaderboards.passing[0]
      keyPlayers.push({
        id: parseInt(p.player.playerId) || 1,
        name: p.player.fullName,
        position: p.player.position,
        number: p.player.jerseyNumber || 0,
        imageUrl: p.player.headshotUrl || undefined,
        stats: {
          passingYards: p.primaryStat,
          touchdowns: p.secondaryStat || 0,
          interceptions: p.tertiaryStat || 0,
        },
      })
    }

    // Add top rusher
    if (leaderboards.rushing[0]) {
      const p = leaderboards.rushing[0]
      keyPlayers.push({
        id: parseInt(p.player.playerId) || 2,
        name: p.player.fullName,
        position: p.player.position,
        number: p.player.jerseyNumber || 0,
        imageUrl: p.player.headshotUrl || undefined,
        stats: {
          rushingYards: p.primaryStat,
          touchdowns: p.secondaryStat || 0,
          attempts: p.tertiaryStat || 0,
        },
      })
    }

    // Add top receivers (2)
    leaderboards.receiving.slice(0, 2).forEach((p, idx) => {
      keyPlayers.push({
        id: parseInt(p.player.playerId) || (3 + idx),
        name: p.player.fullName,
        position: p.player.position,
        number: p.player.jerseyNumber || 0,
        imageUrl: p.player.headshotUrl || undefined,
        stats: {
          receivingYards: p.primaryStat,
          touchdowns: p.secondaryStat || 0,
          receptions: p.tertiaryStat || 0,
        },
      })
    })

    // Add top defender
    if (leaderboards.defense[0]) {
      const p = leaderboards.defense[0]
      keyPlayers.push({
        id: parseInt(p.player.playerId) || 5,
        name: p.player.fullName,
        position: p.player.position,
        number: p.player.jerseyNumber || 0,
        imageUrl: p.player.headshotUrl || undefined,
        stats: {
          tackles: p.primaryStat,
          sacks: p.secondaryStat || 0,
        },
      })
    }

    // If we got live data, return it
    if (keyPlayers.length > 0) {
      return keyPlayers
    }

    // Fall back to basic player list if no stats available
    const fallbackPlayers = players.slice(0, 5).map((p, idx) => ({
      id: parseInt(p.playerId) || idx + 1,
      name: p.fullName,
      position: p.position,
      number: p.jerseyNumber || 0,
      imageUrl: p.headshotUrl || undefined,
    }))

    return fallbackPlayers.length > 0 ? fallbackPlayers : getStaticKeyPlayers()
  } catch (error) {
    console.error('Error fetching key players:', error)
    return getStaticKeyPlayers()
  }
}

/**
 * Static fallback key players (used when live data unavailable)
 */
function getStaticKeyPlayers(): BearsPlayer[] {
  return [
    { id: 1, name: 'Caleb Williams', position: 'QB', number: 18 },
    { id: 2, name: "D'Andre Swift", position: 'RB', number: 4 },
    { id: 3, name: 'DJ Moore', position: 'WR', number: 2 },
    { id: 4, name: 'Rome Odunze', position: 'WR', number: 15 },
    { id: 5, name: 'Montez Sweat', position: 'DE', number: 98 },
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
