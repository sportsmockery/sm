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
 * Resolve a display_name to a chat_users.id UUID.
 * Looks up an existing chat_user; creates one if not found.
 */
async function getOrCreateChatUser(
  displayName: string,
  isAI: boolean
): Promise<string | null> {
  // Look up existing
  const { data: existing } = await supabaseAdmin
    .from('chat_users')
    .select('id')
    .eq('display_name', displayName)
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  // Create new
  const { data: created, error } = await supabaseAdmin
    .from('chat_users')
    .insert({
      display_name: displayName,
      badge: isAI ? 'ai' : 'fan',
    })
    .select('id')
    .single()

  if (error) {
    // Race condition: retry lookup
    const { data: retry } = await supabaseAdmin
      .from('chat_users')
      .select('id')
      .eq('display_name', displayName)
      .limit(1)
      .maybeSingle()

    return retry?.id ?? null
  }

  return created.id
}

/**
 * GET /api/fan-chat/messages?channel=bears&limit=50&before=<iso>
 * Fetches persisted messages for a fan-chat channel.
 * Joins with chat_users to include display_name and badge.
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
      .select('id, room_id, user_id, content, content_type, created_at, is_deleted, moderation_status, chat_users!inner(display_name, badge)')
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

    // Flatten the joined data so each message has display_name and badge at top level
    const flattened = (messages || []).map((msg: Record<string, unknown>) => {
      const chatUser = msg.chat_users as { display_name: string; badge: string } | null
      return {
        id: msg.id,
        room_id: msg.room_id,
        user_id: msg.user_id,
        content: msg.content,
        content_type: msg.content_type,
        created_at: msg.created_at,
        is_deleted: msg.is_deleted,
        moderation_status: msg.moderation_status,
        display_name: chatUser?.display_name ?? 'Unknown',
        badge: chatUser?.badge ?? 'fan',
      }
    })

    return NextResponse.json({
      messages: flattened.reverse(),
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
 * Body: { channel, content, userId?, displayName, isAI?, personality? }
 *
 * userId: the chat_users.id UUID (preferred, used by frontend after registration)
 * displayName: fallback — will be resolved to a chat_users.id via lookup/create
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, content, userId, displayName, isAI, personality } = body

    if (!channel || !content) {
      return NextResponse.json({ error: 'channel and content required' }, { status: 400 })
    }

    const roomId = await getRoomId(channel)
    if (!roomId) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    // Resolve the chat_users UUID
    let chatUserId: string | null = null

    if (userId) {
      // Frontend already has the UUID from user registration
      chatUserId = userId
    } else {
      // Fallback: resolve by display_name (lookup or create)
      const name = isAI ? (personality || 'AI Fan') : (displayName || 'Anonymous')
      chatUserId = await getOrCreateChatUser(name, !!isAI)
    }

    if (!chatUserId) {
      return NextResponse.json({ error: 'Failed to resolve user' }, { status: 500 })
    }

    const { data: message, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        room_id: roomId,
        user_id: chatUserId,
        content,
        content_type: 'text',
        moderation_status: 'approved',
        moderation_score: 0,
      })
      .select('id, room_id, user_id, content, content_type, created_at, is_deleted, moderation_status')
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
