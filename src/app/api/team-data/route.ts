import { NextRequest, NextResponse } from 'next/server'
import { getCompleteTeamSeasonData, type TeamKey } from '@/lib/team-data'
import { supabaseAdmin } from '@/lib/db'

// Team category slugs for database queries
const TEAM_CATEGORY_SLUGS: Record<TeamKey, string[]> = {
  bears: ['bears', 'chicago-bears'],
  bulls: ['bulls', 'chicago-bulls'],
  cubs: ['cubs', 'chicago-cubs'],
  whitesox: ['whitesox', 'white-sox', 'chicago-white-sox'],
  blackhawks: ['blackhawks', 'chicago-blackhawks'],
}

/**
 * GET /api/team-data?team=bears
 * Returns team season data and recent posts
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const teamParam = searchParams.get('team') || 'bears'

  // Validate team parameter
  const validTeams: TeamKey[] = ['bears', 'bulls', 'cubs', 'whitesox', 'blackhawks']
  const team = validTeams.includes(teamParam as TeamKey)
    ? (teamParam as TeamKey)
    : 'bears'

  try {
    // Fetch season data and posts in parallel
    const [seasonData, posts] = await Promise.all([
      getCompleteTeamSeasonData(team),
      fetchTeamPosts(team),
    ])

    return NextResponse.json({
      team,
      seasonData,
      posts,
    })
  } catch (error) {
    console.error(`Error fetching data for team ${team}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch team data' },
      { status: 500 }
    )
  }
}

/**
 * Fetch recent posts for a team
 */
async function fetchTeamPosts(team: TeamKey, limit: number = 10) {
  try {
    // Get category IDs for this team
    const categorySlugs = TEAM_CATEGORY_SLUGS[team] || []

    const { data: categories } = await supabaseAdmin
      .from('sm_categories')
      .select('id')
      .in('slug', categorySlugs)

    const categoryIds = categories?.map((c) => c.id) || []

    if (categoryIds.length === 0) {
      return []
    }

    // Fetch recent posts
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        slug,
        title,
        excerpt,
        featured_image,
        published_at,
        category:sm_categories!inner(slug, name),
        author:sm_users!sm_posts_author_id_fkey(display_name, avatar_url)
      `)
      .eq('status', 'published')
      .in('category_id', categoryIds)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    // Transform to expected format
    return (posts || []).map((post: any) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      publishedAt: post.published_at,
      author: {
        displayName: post.author?.display_name || 'Staff',
        avatarUrl: post.author?.avatar_url || null,
      },
      categorySlug: post.category?.slug || team,
    }))
  } catch (error) {
    console.error('Error in fetchTeamPosts:', error)
    return []
  }
}
