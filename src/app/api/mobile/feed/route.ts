import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { getTeamFromCategory } from '@/lib/transform-post'
import { composeAdaptiveRiver } from '@/lib/river-composer'

const POST_SELECT =
  'id,title,slug,excerpt,featured_image,category_id,author_id,importance_score,published_at,views,comments_count,template_version,content,author:sm_authors!author_id(display_name),category:sm_categories!category_id(slug,name)'

const PAGE_SIZE = 40

// ─── Helpers ───

function formatRelativeTime(publishedAt: string | null): string {
  if (!publishedAt) return ''
  const diffMs = Date.now() - new Date(publishedAt).getTime()
  const mins = Math.floor(diffMs / 60000)
  const hrs = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)
  if (mins < 60) return `${Math.max(1, mins)}m`
  if (hrs < 24) return `${hrs}h`
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

function formatViewCount(views: number): string {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return String(views)
}

function mapPostToMobileCard(post: any): {
  id: string
  card_type: string
  team: string
  team_color: string
  timestamp: string
  data: any
} {
  const teamInfo = getTeamFromCategory(post.category_id)
  const authorName = Array.isArray(post.author)
    ? post.author[0]?.display_name
    : post.author?.display_name
  const categorySlug = (Array.isArray(post.category)
    ? post.category[0]?.slug
    : post.category?.slug) || ''

  let summary = post.excerpt || ''
  if (!summary && post.content) {
    const plain = String(post.content)
      .replace(/<[^>]+>/g, '')
      .replace(/<!--[^>]*-->/g, '')
      .trim()
    summary = plain.length > 200 ? plain.slice(0, 200) + '...' : plain
  }

  return {
    id: `post-${post.id}`,
    card_type: 'editorial',
    team: teamInfo?.name || 'Chicago Sports',
    team_color: teamInfo?.color || '#0B0F14',
    timestamp: formatRelativeTime(post.published_at),
    data: {
      headline: post.title,
      summary,
      slug: post.slug,
      postId: post.id,
      categorySlug,
      featuredImage: post.featured_image || '',
      author_name: authorName || 'Sports Mockery',
      commentsCount: post.comments_count || 0,
      views: post.views ? formatViewCount(post.views) : '0',
      published_at: post.published_at,
    },
  }
}

/**
 * Convert a HomepageRiverItem (from composeAdaptiveRiver) to the mobile
 * card shape. The river composer already maps candidates to types like
 * 'editorial', 'scout_summary', 'chart', 'hub_update', 'debate', 'poll',
 * 'video', 'trending_article', etc.
 */
function riverItemToMobileCard(item: any): {
  id: string
  card_type: string
  team: string
  team_color: string
  timestamp: string
  data: any
} {
  return {
    id: item.id,
    card_type: item.type || 'editorial',
    team: item.team || 'Chicago Sports',
    team_color: item.teamColor || '#0B0F14',
    timestamp: item.timestamp || '',
    data: item.data || {},
  }
}

// ─── Core fetch ───

async function fetchArticles(options: {
  cursor?: string | null
  teamFilter?: string | null
  viewedIds?: number[]
  limit: number
}) {
  if (!supabaseAdmin) return { articles: [], hasMore: false }

  const { cursor, teamFilter, viewedIds, limit } = options

  let query = supabaseAdmin
    .from('sm_posts')
    .select(POST_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit + 1) // fetch one extra to detect has_more

  if (cursor) {
    query = query.lt('published_at', cursor)
  }

  if (teamFilter) {
    // Map team slug to category_id
    const teamCategoryMap: Record<string, number> = {
      bears: 1,
      blackhawks: 2,
      bulls: 3,
      cubs: 4,
      whitesox: 6,
    }
    const catId = teamCategoryMap[teamFilter.toLowerCase()]
    if (catId) {
      query = query.eq('category_id', catId)
    }
  }

  if (viewedIds && viewedIds.length > 0) {
    query = query.not('id', 'in', `(${viewedIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Mobile feed query error:', error)
    return { articles: [], hasMore: false }
  }

  const articles = data || []
  const hasMore = articles.length > limit
  if (hasMore) articles.pop() // remove the extra

  return { articles, hasMore }
}

// ─── Build response ───

function buildResponse(articles: any[], hasMore: boolean) {
  // Try the adaptive river composer for richer card types
  let heroItem: any = null
  let riverCards: any[] = []

  try {
    const river = composeAdaptiveRiver(articles)

    heroItem = river.hero
      ? {
          mode: 'editorial',
          data: riverItemToMobileCard(river.hero),
        }
      : null

    riverCards = river.items.map(riverItemToMobileCard)
  } catch {
    // Fallback: simple editorial mapping
    heroItem = articles.length > 0
      ? { mode: 'editorial', data: mapPostToMobileCard(articles[0]) }
      : null

    riverCards = articles.slice(heroItem ? 1 : 0).map(mapPostToMobileCard)
  }

  const lastArticle = articles[articles.length - 1]
  const nextCursor = hasMore && lastArticle?.published_at
    ? lastArticle.published_at
    : null

  return {
    hero: heroItem,
    river_cards: riverCards,
    next_cursor: nextCursor,
    has_more: hasMore,
  }
}

// ─── GET handler ───

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const { searchParams } = request.nextUrl
    const cursor = searchParams.get('cursor') || null
    const teamFilter = searchParams.get('team_filter') || null

    const { articles, hasMore } = await fetchArticles({
      cursor,
      teamFilter,
      limit: PAGE_SIZE,
    })

    const payload = buildResponse(articles, hasMore)

    const response = NextResponse.json(payload)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    return response
  } catch (error) {
    console.error('Mobile feed GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}

// ─── POST handler ───

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const cursor: string | null = body.cursor || null
    const teamFilter: string | null = body.team_filter || null
    const viewedIds: number[] = Array.isArray(body.viewed_ids)
      ? body.viewed_ids
      : []

    const { articles, hasMore } = await fetchArticles({
      cursor,
      teamFilter,
      viewedIds,
      limit: PAGE_SIZE,
    })

    const payload = buildResponse(articles, hasMore)

    const response = NextResponse.json(payload)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    )
    return response
  } catch (error) {
    console.error('Mobile feed POST error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}
