import { supabaseAdmin } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/views - Track a post view (server-side only via service role)
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
    const { post_id, user_id } = body

    if (!post_id) {
      return NextResponse.json(
        { error: 'post_id is required' },
        { status: 400 }
      )
    }

    // 1. Increment view_count on the post
    // First try the RPC function
    const { error: rpcError } = await supabaseAdmin.rpc('increment_view_count', {
      post_id: parseInt(post_id)
    })

    // Fallback to manual increment if RPC doesn't exist
    if (rpcError) {
      const { data: post } = await supabaseAdmin
        .from('sm_posts')
        .select('views')
        .eq('id', post_id)
        .single()

      if (post) {
        await supabaseAdmin
          .from('sm_posts')
          .update({ views: (post.views || 0) + 1 })
          .eq('id', post_id)
      }
    }

    // 2. If user_id provided, record in sm_user_views for personalization
    // (user_id is passed from client if user is logged in)
    if (user_id) {
      try {
        await supabaseAdmin
          .from('sm_user_views')
          .upsert(
            {
              user_id,
              post_id: parseInt(post_id),
              viewed_at: new Date().toISOString()
            },
            {
              onConflict: 'user_id,post_id',
              ignoreDuplicates: false
            }
          )
      } catch {
        // Table might not exist yet - ignore
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('View tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}
