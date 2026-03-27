import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * Channel slug → chat_rooms.team_slug mapping.
 * The fan-chat page uses "whitesox" (no hyphen) while the DB uses "white-sox".
 * "global" maps to "bears" room as a shared lounge.
 */
const SLUG_TO_TEAM_SLUG: Record<string, string> = {
  bears: 'bears',
  bulls: 'bulls',
  cubs: 'cubs',
  whitesox: 'white-sox',
  blackhawks: 'blackhawks',
  global: 'bears',
}

async function getRoomId(channelSlug: string): Promise<string | null> {
  const teamSlug = SLUG_TO_TEAM_SLUG[channelSlug]
  if (!teamSlug) return null

  const { data } = await supabaseAdmin
    .from('chat_rooms')
    .select('id')
    .eq('team_slug', teamSlug)
    .single()

  return data?.id ?? null
}

/**
 * GET /api/fan-chat/messages?channel=bears&limit=50&before=<iso>
 * Fetches persisted messages for a fan-chat channel.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const before = searchParams.get('before')

    if (!channel) {
      return NextResponse.json({ error: 'channel is required' }, { status: 400 })
    }

    const roomId = await getRoomId(channel)
    if (!roomId) {
      return NextResponse.json({ messages: [], roomId: null })
    }

    let query = supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .eq('moderation_status', 'approved')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('[fan-chat/messages GET]', error)
      return NextResponse.json({ messages: [], roomId })
    }

    return NextResponse.json({
      messages: (messages || []).reverse(),
      roomId,
      hasMore: (messages?.length ?? 0) === limit,
    })
  } catch (err) {
    console.error('[fan-chat/messages GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/fan-chat/messages
 * Persists a fan-chat message. Accepts both user and AI messages.
 * Body: { channel, content, displayName, isAI?, personality? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, content, displayName, isAI, personality } = body

    if (!channel || !content) {
      return NextResponse.json({ error: 'channel and content required' }, { status: 400 })
    }

    const roomId = await getRoomId(channel)
    if (!roomId) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    // For AI messages, use a deterministic UUID based on personality name
    // For user messages, use a guest identifier
    const userId = isAI
      ? `ai-${personality || 'default'}`
      : `guest-${displayName || 'anonymous'}`

    const { data: message, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: userId,
        content,
        content_type: 'text',
        moderation_status: 'approved',
        moderation_score: 0,
      })
      .select('*')
      .single()

    if (error) {
      console.error('[fan-chat/messages POST]', error)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message })
  } catch (err) {
    console.error('[fan-chat/messages POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
