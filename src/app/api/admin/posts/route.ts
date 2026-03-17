import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/posts
 * List all posts for admin
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0)

    let query = supabaseAdmin
      .from('sm_posts')
      .select(`
        *,
        category:sm_categories(id, name, slug),
        author:sm_authors(id, display_name)
      `, { count: 'exact' })
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: posts, error, count } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      posts,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/posts
 * Create a new post
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const { data: existing } = await supabaseAdmin
      .from('sm_posts')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Prepare post data - only include columns that definitely exist in the schema
    const now = new Date().toISOString()
    const postData: Record<string, unknown> = {
      title: body.title,
      slug: body.slug,
      content: body.content || '',
      excerpt: body.excerpt || null,
      featured_image: body.featured_image || null,
      status: body.status || 'draft',
      category_id: body.category_id || null,
      author_id: body.author_id || null,
      seo_title: body.seo_title || null,
      seo_description: body.seo_description || null,
      created_at: now,
    }

    // Ensure published posts always have an author
    if (postData.status === 'published' && !postData.author_id) {
      const { data: staff } = await supabaseAdmin
        .from('sm_authors')
        .select('id')
        .ilike('display_name', '%Sports Mockery%')
        .limit(1)
        .single()
      if (staff) postData.author_id = staff.id
    }

    // Only add optional columns if they have values (avoids schema cache errors)
    if (body.social_caption) postData.social_caption = body.social_caption
    if (body.updated_at !== undefined) postData.updated_at = body.updated_at || now
    if (body.views !== undefined) postData.views = body.views
    if (body.importance_score !== undefined) postData.importance_score = body.importance_score
    if (body.force_hero_featured !== undefined) postData.force_hero_featured = body.force_hero_featured
    if (body.is_story_universe !== undefined) {
      postData.is_story_universe = body.is_story_universe
      postData.story_universe_related_ids = body.is_story_universe
        ? (body.story_universe_related_ids || [])
        : []
    }

    // Set published_at if status is published
    if (body.status === 'published') {
      postData.published_at = now
    }

    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      )
    }

    // Save tags if provided
    if (body.tags && Array.isArray(body.tags) && body.tags.length > 0) {
      const tagRows = body.tags.map((tagId: number) => ({
        post_id: post.id,
        tag_id: tagId,
      }))
      await supabaseAdmin.from('sm_post_tags').insert(tagRows)
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
