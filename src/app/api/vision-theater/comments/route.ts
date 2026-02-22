import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/vision-theater/comments?videoId=xxx
export async function GET(req: NextRequest) {
  const videoId = req.nextUrl.searchParams.get('videoId')
  if (!videoId) {
    return NextResponse.json({ error: 'videoId is required' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('vision_theater_comments')
    .select('id, video_id, user_id, user_name, user_avatar, content, created_at')
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[VisionTheater Comments] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }

  return NextResponse.json({ comments: data ?? [] })
}

// POST /api/vision-theater/comments
export async function POST(req: NextRequest) {
  // Verify auth via Supabase SSR cookie
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Read-only in route handlers
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  let body: { videoId?: string; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { videoId, content } = body
  if (!videoId || !content) {
    return NextResponse.json({ error: 'videoId and content are required' }, { status: 400 })
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: 'Comment must be 1000 characters or less' }, { status: 400 })
  }

  // Get user metadata for display name and avatar
  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Anonymous'
  const userAvatar = user.user_metadata?.avatar_url || null

  const { data, error } = await supabaseAdmin
    .from('vision_theater_comments')
    .insert({
      video_id: videoId,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('[VisionTheater Comments] POST error:', error)
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
  }

  return NextResponse.json({ comment: data })
}
