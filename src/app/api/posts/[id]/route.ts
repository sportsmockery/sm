import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      title,
      slug,
      content,
      excerpt,
      featured_image,
      status,
      category_id,
      author_id,
      seo_title,
      seo_description,
    } = body

    // Validate required fields
    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Title and slug are required' },
        { status: 400 }
      )
    }

    // Check if slug is unique (excluding current post)
    const { data: existingPost } = await supabaseAdmin
      .from('sm_posts')
      .select('id')
      .eq('slug', slug)
      .neq('id', id)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      title,
      slug,
      content: content || '',
      excerpt: excerpt || null,
      featured_image: featured_image || null,
      status: status || 'draft',
      category_id: category_id || null,
      author_id: author_id || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      updated_at: new Date().toISOString(),
    }

    // Set published_at if publishing for the first time
    if (status === 'published') {
      const { data: currentPost } = await supabaseAdmin
        .from('sm_posts')
        .select('status, published_at')
        .eq('id', id)
        .single()

      if (currentPost && currentPost.status !== 'published' && !currentPost.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    // Update the post
    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating post:', error)
      return NextResponse.json(
        { error: 'Failed to update post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Error in POST /api/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: post, error } = await supabaseAdmin
      .from('sm_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error in GET /api/posts/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
