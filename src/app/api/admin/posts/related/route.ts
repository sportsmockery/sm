import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/admin/posts/related
 * Find related posts based on keywords and category
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')
    const excludeId = searchParams.get('exclude')
    const limit = parseInt(searchParams.get('limit') || '5')

    let dbQuery = supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        category:sm_categories(name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (excludeId) {
      dbQuery = dbQuery.neq('id', excludeId)
    }

    if (category) {
      dbQuery = dbQuery.eq('category_id', category)
    }

    // Search in title and content if query provided
    if (query) {
      // Split query into words and search for any of them
      const words = query.split(' ').filter(w => w.length > 3)
      if (words.length > 0) {
        // Use textSearch if available, otherwise use ilike on title
        const searchPattern = words.map(w => `%${w}%`).join('|')
        dbQuery = dbQuery.or(words.map(w => `title.ilike.%${w}%`).join(','))
      }
    }

    const { data: posts, error } = await dbQuery

    if (error) {
      console.error('Error fetching related posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch related posts' },
        { status: 500 }
      )
    }

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error in related posts API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
