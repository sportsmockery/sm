import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { GoogleIngestionService } from '@/lib/google/google-ingestion-service'
import { autoLinkPostContent } from '@/lib/postiq/auto-link'

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
      social_caption,
      social_posted_at,
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

    // PostIQ auto-linker on publish — see /api/admin/posts route for context.
    // Skipped for drafts so we only burn one round-trip per actual publish.
    let resolvedContent = content || ''
    if (status === 'published' && resolvedContent) {
      resolvedContent = await autoLinkPostContent(resolvedContent, {
        userId: author_id ?? null,
      })
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      title,
      slug,
      content: resolvedContent,
      excerpt: excerpt || null,
      featured_image: featured_image || null,
      status: status || 'draft',
      category_id: category_id || null,
      author_id: author_id || null,
      seo_title: seo_title || null,
      seo_description: seo_description || null,
      updated_at: new Date().toISOString(),
    }

    // Story Universe / Force Hero fields
    if (body.force_hero_featured !== undefined) {
      updateData.force_hero_featured = body.force_hero_featured
      // Track when hero override was activated (24h display cap)
      if (body.force_hero_featured) {
        updateData.hero_override_at = new Date().toISOString()
      } else if (!body.is_story_universe) {
        updateData.hero_override_at = null
      }
    }
    if (body.is_story_universe !== undefined) {
      updateData.is_story_universe = body.is_story_universe
      // Clear related IDs if unchecked
      updateData.story_universe_related_ids = body.is_story_universe
        ? (body.story_universe_related_ids || [])
        : []
      // Track when hero override was activated (24h display cap)
      if (body.is_story_universe) {
        updateData.hero_override_at = new Date().toISOString()
      } else if (!body.force_hero_featured) {
        updateData.hero_override_at = null
      }
    }

    // Only update social_caption if provided
    if (social_caption !== undefined) {
      updateData.social_caption = social_caption || null
    }

    // Only update social_posted_at if explicitly provided (to mark as posted)
    if (social_posted_at) {
      updateData.social_posted_at = social_posted_at
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

    // Update tags if provided
    if (body.tags !== undefined && Array.isArray(body.tags)) {
      // Remove existing tags
      await supabaseAdmin.from('sm_post_tags').delete().eq('post_id', id)
      // Insert new tags
      if (body.tags.length > 0) {
        const tagRows = body.tags.map((tagId: number) => ({
          post_id: parseInt(id),
          tag_id: tagId,
        }))
        await supabaseAdmin.from('sm_post_tags').insert(tagRows)
      }
    }

    // Enqueue a Google-intelligence rescore on update / republish. Fire-and-
    // forget — the worker idempotency-checks content + author hashes so this
    // is safe to call on every update, even if nothing meaningful changed.
    if (status === 'published') {
      const ingest = new GoogleIngestionService(supabaseAdmin)
      ingest.onArticleUpdated(String(id), 'editor').catch((e) => {
        console.error('[google-intelligence] enqueue on update failed:', e)
      })
    }

    // Auto-generate TOC via Scout when publishing (fire-and-forget)
    if (status === 'published' && resolvedContent) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
        || process.env.NEXT_PUBLIC_SITE_URL
        || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
      fetch(`${baseUrl}/api/admin/ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_toc',
          title: title || post.title,
          content: resolvedContent,
          postId: id,
        }),
      }).catch(err => console.error('[TOC] Auto-generate failed:', err))
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
      .select(
        '*,author:sm_authors!author_id(id,display_name,avatar_url),category:sm_categories!category_id(slug,name)'
      )
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
