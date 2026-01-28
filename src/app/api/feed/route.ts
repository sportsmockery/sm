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

// Column names match actual sm_posts table schema
const POST_SELECT = 'id,title,slug,excerpt,featured_image,category_id,author_id,importance_score,published_at,views,author:sm_authors!author_id(display_name),category:sm_categories!category_id(slug,name)'

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
    let recentQuery = supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(30)

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
        .limit(30)
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

    return NextResponse.json({
      featured,
      topHeadlines,
      latestNews,
      teamSections,
      trending: trending?.slice(0, 5) || [],
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

    // Default feed: High score + recent, no personalization
    let { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(POST_SELECT)
      .eq('status', 'published')
      .order('importance_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Feed GET error:', error)
    }

    // FALLBACK: If no posts found, try without importance_score ordering
    if (!posts || posts.length === 0) {
      const fallback = await supabaseAdmin
        .from('sm_posts')
        .select(POST_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(30)
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

    return NextResponse.json({
      featured,
      topHeadlines,
      latestNews,
      teamSections,
      trending: posts?.slice(0, 5) || [],
      meta: {
        total: posts?.length || 0,
        viewedCount: 0,
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
