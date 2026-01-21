import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * Get article by slug - used by mobile app
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch post by slug with author and category
    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        content,
        excerpt,
        featured_image,
        published_at,
        views,
        seo_title,
        seo_description,
        author:sm_authors(id, display_name, avatar_url),
        category:sm_categories(slug, name)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Get related posts from same category
    let relatedPosts: any[] = []
    const postCategory = post.category as { slug?: string; name?: string } | { slug?: string; name?: string }[] | null
    if (postCategory) {
      const categorySlug = Array.isArray(postCategory)
        ? postCategory[0]?.slug
        : postCategory?.slug

      if (categorySlug) {
        const { data: related } = await supabaseAdmin
          .from('sm_posts')
          .select(`
            id,
            title,
            slug,
            excerpt,
            featured_image,
            published_at,
            category:sm_categories(slug, name)
          `)
          .eq('status', 'published')
          .neq('id', post.id)
          .order('published_at', { ascending: false })
          .limit(5)

        relatedPosts = related || []
      }
    }

    // Format response for mobile app
    const article = {
      id: post.id,
      title: post.title,
      slug: post.slug,
      content_html: post.content || '',
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      views: post.views || 0,
      seo_title: post.seo_title,
      seo_description: post.seo_description,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      category: Array.isArray(post.category) ? post.category[0] : post.category,
      related_posts: relatedPosts.map(p => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featured_image: p.featured_image,
        published_at: p.published_at,
        category: Array.isArray(p.category) ? p.category[0] : p.category,
      })),
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error in GET /api/posts/slug/[slug]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
