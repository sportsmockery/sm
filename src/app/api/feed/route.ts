import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import {
  calculatePostScore,
  calculateAnonymousScore,
  sortPostsByScore,
  DEFAULT_ENGAGEMENT_PROFILE,
  type ScoringContext,
  type UserEngagementProfile
} from '@/lib/scoring-v2'
import { getTeamFromCategory } from '@/lib/transform-post'
import type { HomepageRiverItem } from '@/lib/homepage-river-data'
import { getYouTubeFeedVideos, type YouTubeFeedVideo } from '@/lib/getYouTubeFeedVideos'
import { composeAdaptiveRiver } from '@/lib/river-composer'

// Column names match actual sm_posts table schema
const POST_SELECT = 'id,title,slug,excerpt,featured_image,category_id,author_id,importance_score,published_at,views,template_version,content,author:sm_authors!author_id(display_name),category:sm_categories!category_id(slug,name)'

export async function POST(request: NextRequest) {
  try {
    // Check if supabase client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()

    // Get viewed IDs from client (anonymous tracking via localStorage)
    const clientViewedIds: number[] = body.viewed_ids || []
    const teamPreferences: string[] = body.team_preferences || []

    // Build the feed query
    const now = new Date()

    // 1. Get HIGH IMPORTANCE unseen articles (score >= 50 for more inclusive results)
    let highImportanceQuery = supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .gte('importance_score', 50)
      .order('importance_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(10)

    // Exclude viewed articles if any
    if (clientViewedIds.length > 0) {
      highImportanceQuery = highImportanceQuery.not('id', 'in', `(${clientViewedIds.join(',')})`)
    }

    const { data: highImportance } = await highImportanceQuery

    // 2. Get RECENT articles (all time, no date filter to ensure content)
    // IMPORTANT: Always fetch full content set regardless of login state
    let recentQuery = supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(200)

    // Exclude already fetched high importance and viewed
    const excludeIds = [...clientViewedIds, ...(highImportance?.map(p => p.id) || [])]
    if (excludeIds.length > 0) {
      recentQuery = recentQuery.not('id', 'in', `(${excludeIds.join(',')})`)
    }

    const { data: recent } = await recentQuery

    // 3. Get TRENDING articles (high view count, no date filter)
    const { data: trending } = await supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .order('views', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(10)

    // 4. Calculate final scores with team preference boost
    const calculateFinalScore = (post: any) => {
      let score = post.importance_score || 50

      // Recency decay: -5 points per day old
      if (post.published_at) {
        const daysOld = (now.getTime() - new Date(post.published_at).getTime()) / (1000 * 60 * 60 * 24)
        score -= Math.min(daysOld * 5, 30) // Max 30 point penalty
      }

      // Team preference boost: +15 if user's favorite team
      // Note: team info would come from category or a team field
      const postTeam = post.category_id // Could map category_id to team
      if (teamPreferences.includes(postTeam)) {
        score += 15
      }

      // Trending boost: +10 if in trending (cap at 20% influence)
      const isTrending = trending?.some(t => t.id === post.id)
      if (isTrending) {
        score += 10
      }

      // Unseen bonus: +5 for articles not in viewed list
      if (!clientViewedIds.includes(post.id)) {
        score += 5
      }

      return { ...post, final_score: score }
    }

    // Combine and score all articles
    let allArticles = [
      ...(highImportance || []),
      ...(recent || []),
    ]

    // FALLBACK: If no articles found, fetch without any filters
    if (allArticles.length === 0) {
      const { data: fallbackPosts } = await supabaseAdmin
        .from('sm_posts')
        .select(POST_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(200)
      allArticles = fallbackPosts || []
    }

    // Remove duplicates
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.id === article.id)
    )

    // Score and sort
    const scoredArticles = uniqueArticles
      .map(calculateFinalScore)
      .sort((a, b) => b.final_score - a.final_score)

    // Split into sections
    const featured = scoredArticles[0] || null
    const topHeadlines = scoredArticles.slice(1, 7)
    const latestNews = scoredArticles.slice(7, 20)

    // Group by category for team sections
    const teamSections: Record<string, any[]> = {}
    const teams = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

    for (const team of teams) {
      teamSections[team] = scoredArticles
        .filter(a => {
          // Handle both array and object category structures
          const category = Array.isArray(a.category) ? a.category[0] : a.category
          return category?.slug?.toLowerCase()?.includes(team)
        })
        .slice(0, 4)
    }

    // ── Adaptive River composition ──
    const river = composeAdaptiveRiver(scoredArticles.slice(0, 60))
    const riverItems = river.hero ? [river.hero, ...river.items] : river.items
    const teamRiverItems = river.teamItems

    return NextResponse.json({
      featured,
      topHeadlines,
      latestNews,
      teamSections,
      trending: trending?.slice(0, 5) || [],
      riverItems,
      teamRiverItems,
      meta: {
        total: scoredArticles.length,
        viewedCount: clientViewedIds.length,
        isAuthenticated: false,
      }
    })

  } catch (error) {
    console.error('Feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}

// ─── Map posts to HomepageRiverItem format ───

function mapPostToRiverItem(post: any): HomepageRiverItem {
  const teamInfo = getTeamFromCategory(post.category_id)

  let summary = post.excerpt || ''
  let insight = ''

  // Try to extract richer data from structured content
  if (post.template_version === 1 && post.content) {
    try {
      let contentStr = String(post.content)
      // Strip SM_BLOCKS markers if present
      if (contentStr.includes('<!-- SM_BLOCKS -->')) {
        contentStr = contentStr.replace('<!-- SM_BLOCKS -->', '').replace('<!-- /SM_BLOCKS -->', '').trim()
      }
      const doc = JSON.parse(contentStr)
      const blocks = doc.blocks || []

      if (!summary) {
        const firstP = blocks.find((b: any) => b.type === 'paragraph' && b.data?.html)
        if (firstP) {
          const plain = firstP.data.html.replace(/<[^>]+>/g, '').trim()
          summary = plain.length > 200 ? plain.slice(0, 200) + '...' : plain
        }
      }

      // Extract first key takeaway as insight
      const takeawayHeading = blocks.findIndex((b: any) =>
        b.type === 'heading' && b.data?.text === 'Key Takeaways'
      )
      if (takeawayHeading >= 0) {
        const listBlock = blocks[takeawayHeading + 1]
        if (listBlock?.type === 'paragraph' && listBlock.data?.html?.includes('<li>')) {
          const liMatch = listBlock.data.html.match(/<li>([\s\S]*?)<\/li>/)
          if (liMatch) insight = liMatch[1].replace(/<[^>]+>/g, '').trim()
        }
      }
    } catch { /* fall through */ }
  }

  // Fallback excerpt from raw content
  if (!summary && post.content) {
    const plain = String(post.content).replace(/<[^>]+>/g, '').replace(/<!--[^>]*-->/g, '').trim()
    summary = plain.length > 200 ? plain.slice(0, 200) + '...' : plain
  }

  // Author display name
  const authorName = Array.isArray(post.author)
    ? post.author[0]?.display_name
    : post.author?.display_name
  const displayAuthor = authorName || 'Sports Mockery'

  // Relative timestamp
  const timestamp = formatRelativeTime(post.published_at)

  return {
    id: `post-${post.id}`,
    type: 'editorial' as const,
    team: teamInfo?.name || 'Chicago Sports',
    teamColor: teamInfo?.color || '#0B0F14',
    timestamp,
    data: {
      author: { name: displayAuthor, handle: 'SportsMockery', avatar: 'SM', verified: true },
      headline: post.title,
      summary,
      insight: insight || '',
      author_name: displayAuthor,
      breakingIndicator: 'REPORT' as const,
      stats: {
        comments: 0,
        retweets: 0,
        likes: 0,
        views: post.views ? formatViewCount(post.views) : '0',
      },
      slug: post.slug,
      postId: post.id,
      featuredImage: post.featured_image || '',
      categorySlug: (Array.isArray(post.category) ? post.category[0]?.slug : post.category?.slug) || '',
    },
  }
}

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

function mapYouTubeToRiverItem(video: YouTubeFeedVideo, index: number): HomepageRiverItem {
  return {
    id: `yt-${video.videoId}`,
    type: 'video' as const,
    team: video.team,
    teamColor: video.teamColor,
    timestamp: formatRelativeTime(video.publishedAt),
    data: {
      headline: video.title,
      title: video.title,
      summary: video.description?.slice(0, 200) || '',
      teaser: video.description?.slice(0, 150) || '',
      duration: video.duration,
      source: video.channelName,
      thumbnailUrl: video.thumbnailUrl,
      videoId: video.videoId,
      isShort: video.isShort,
      stats: { comments: 0, retweets: 0, likes: 0, views: '0' },
      slug: undefined,
      categorySlug: undefined,
    },
  }
}

function interleaveVideos(articles: HomepageRiverItem[], videos: HomepageRiverItem[]): HomepageRiverItem[] {
  if (videos.length === 0) return articles
  const result = [...articles]
  // Insert a video every 4 articles
  let videoIdx = 0
  for (let i = 3; i < result.length + videos.length && videoIdx < videos.length; i += 5) {
    result.splice(i, 0, videos[videoIdx])
    videoIdx++
  }
  return result
}

// GET endpoint for simple fetches (first-time visitors)
export async function GET() {
  try {
    // Check if supabase client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Default feed: All recent published posts, no personalization
    // IMPORTANT: Always fetch full content set for anonymous users
    let { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(200)

    if (error) {
      console.error('Feed GET error:', error)
    }

    // FALLBACK: Only if truly no posts found
    if (!posts || posts.length === 0) {
      const fallback = await supabaseAdmin
        .from('sm_posts')
        .select(POST_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(200)
      posts = fallback.data || []
    }

    const featured = posts?.[0] || null
    const topHeadlines = posts?.slice(1, 7) || []
    const latestNews = posts?.slice(7, 20) || []

    // Group by category for team sections
    const teamSections: Record<string, any[]> = {}
    const teams = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

    for (const team of teams) {
      teamSections[team] = (posts || [])
        .filter(a => {
          // Handle both array and object category structures
          const category = Array.isArray(a.category) ? a.category[0] : a.category
          return category?.slug?.toLowerCase()?.includes(team)
        })
        .slice(0, 4)
    }

    // ── Adaptive River composition ──
    // Use the composer to extract candidates, score, and compose a diverse feed
    const isDebug = process.env.NODE_ENV === 'development'
    const river = composeAdaptiveRiver((posts || []).slice(0, 60), { debug: isDebug })

    // Interleave YouTube videos into the river
    let ytRiverItems: HomepageRiverItem[] = []
    try {
      const ytVideos = await getYouTubeFeedVideos()
      ytRiverItems = ytVideos.map(mapYouTubeToRiverItem)
    } catch { /* YouTube fetch failure should not break the feed */ }

    const riverItems = interleaveVideos(
      river.hero ? [river.hero, ...river.items] : river.items,
      ytRiverItems
    )

    // Team-specific river items from composer
    const teamRiverItems = river.teamItems

    return NextResponse.json({
      featured,
      topHeadlines,
      latestNews,
      teamSections,
      trending: posts?.slice(0, 5) || [],
      riverItems,
      teamRiverItems,
      meta: {
        total: posts?.length || 0,
        viewedCount: 0,
        isAuthenticated: false,
      },
      ...(isDebug && river.debug ? { _riverDebug: river.debug } : {}),
    })
  } catch (error) {
    console.error('Feed API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    )
  }
}
