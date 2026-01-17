import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, POST_SUMMARY_SELECT, TEAM_CATEGORY_SLUGS } from '@/lib/db'
import { TeamSlug, TEAM_INFO, PostSummary, categorySlugToTeam } from '@/lib/types'

/**
 * GET /api/team/[slug]
 * Returns team-specific data including posts, stats, and metadata
 *
 * Query params:
 * - limit: Number of posts to return (default 20, max 50)
 * - offset: Pagination offset (default 0)
 * - sort: Sort order (latest, popular)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'latest'

    // Validate team slug
    const teamSlug = slug as TeamSlug
    if (!TEAM_INFO[teamSlug]) {
      return NextResponse.json(
        { error: 'Invalid team slug' },
        { status: 400 }
      )
    }

    const teamInfo = TEAM_INFO[teamSlug]
    const categorySlugs = TEAM_CATEGORY_SLUGS[teamSlug]

    if (!categorySlugs) {
      return NextResponse.json(
        { error: 'Team category not configured' },
        { status: 500 }
      )
    }

    // Get category IDs for this team
    const { data: categories, error: catError } = await supabaseAdmin
      .from('sm_categories')
      .select('id, name, slug')
      .in('slug', categorySlugs)

    if (catError || !categories || categories.length === 0) {
      return NextResponse.json({
        team: teamInfo,
        posts: [],
        pagination: { offset, limit, hasMore: false, total: 0 },
      })
    }

    const categoryIds = categories.map(c => c.id)

    // Get total count
    const { count } = await supabaseAdmin
      .from('sm_posts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
      .in('category_id', categoryIds)

    // Build posts query
    let postsQuery = supabaseAdmin
      .from('sm_posts')
      .select(POST_SUMMARY_SELECT)
      .eq('status', 'published')
      .in('category_id', categoryIds)

    // Apply sort
    if (sort === 'popular') {
      postsQuery = postsQuery.order('views', { ascending: false, nullsFirst: false })
    } else {
      postsQuery = postsQuery.order('published_at', { ascending: false })
    }

    // Apply pagination
    postsQuery = postsQuery.range(offset, offset + limit - 1)

    const { data: posts, error: postsError } = await postsQuery

    if (postsError) {
      console.error('Team API posts error:', postsError)
      return NextResponse.json(
        { error: 'Failed to fetch team posts' },
        { status: 500 }
      )
    }

    // Map to PostSummary format
    const formattedPosts: PostSummary[] = (posts || []).map((row: any) => {
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
        categorySlug: category.slug || teamSlug,
        categoryName: category.name || teamInfo.name,
      }
    })

    // Get featured posts (top 3 by views)
    const { data: featured } = await supabaseAdmin
      .from('sm_posts')
      .select(POST_SUMMARY_SELECT)
      .eq('status', 'published')
      .in('category_id', categoryIds)
      .order('views', { ascending: false, nullsFirst: false })
      .limit(3)

    const formattedFeatured: PostSummary[] = (featured || []).map((row: any) => {
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
        categorySlug: category.slug || teamSlug,
        categoryName: category.name || teamInfo.name,
      }
    })

    return NextResponse.json({
      team: teamInfo,
      posts: formattedPosts,
      featured: formattedFeatured,
      pagination: {
        offset,
        limit,
        hasMore: (count || 0) > offset + limit,
        total: count || 0,
      },
    })
  } catch (error) {
    console.error('Team API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
