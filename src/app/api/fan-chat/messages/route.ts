import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

/**
 * Channel slug mapping — frontend uses "whitesox" / "global",
 * DataLab uses "whitesox" for the team param and "global" for the lounge.
 */
const VALID_CHANNELS = new Set([
  'bears', 'bulls', 'cubs', 'whitesox', 'blackhawks', 'global',
])

/**
 * Direct Supabase fallback — queries chat_messages via the main SM Supabase
 * when DataLab is unavailable or returns no messages.
 */
async function fetchMessagesFromSupabase(
  channel: string,
  limit: number,
  before?: string | null
) {
  try {
    // Look up the room by team_slug
    const { data: room } = await supabaseAdmin
      .from('chat_rooms')
      .select('id')
      .eq('team_slug', channel)
      .single()

    if (!room) return { messages: [], roomId: null }

    let query = supabaseAdmin
      .from('chat_messages')
      .select(`
        id,
        room_id,
        user_id,
        content,
        content_type,
        created_at,
        is_deleted,
        moderation_status,
        chat_users ( display_name, badge )
      `)
      .eq('room_id', room.id)
      .eq('moderation_status', 'approved')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: rawMessages, error } = await query

    if (error) {
      console.error('[fan-chat/messages] Supabase fallback error:', error.message)
      return { messages: [], roomId: room.id }
    }

    // Normalize to the same shape the frontend expects (flat with display_name/badge)
    const messages = (rawMessages || [])
      .reverse()
      .map((m: any) => ({
        id: m.id,
        room_id: m.room_id,
        user_id: m.user_id,
        content: m.content,
        content_type: m.content_type,
        created_at: m.created_at,
        is_deleted: m.is_deleted,
        moderation_status: m.moderation_status,
        display_name: m.chat_users?.display_name || 'Fan',
        badge: m.chat_users?.badge || 'fan',
      }))

    return { messages, roomId: room.id }
  } catch (err) {
    console.error('[fan-chat/messages] Supabase fallback exception:', err)
    return { messages: [], roomId: null }
  }
}

/**
 * GET /api/fan-chat/messages?channel=bears&limit=200&before=<iso>
 * Proxies to DataLab first, falls back to direct Supabase query.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const limit = searchParams.get('limit') || '200'
    const before = searchParams.get('before')

    if (!channel || !VALID_CHANNELS.has(channel)) {
      return NextResponse.json({ error: 'channel is required' }, { status: 400 })
    }

    const params = new URLSearchParams({ team: channel, limit })
    if (before) params.set('before', before)

    // Try DataLab first
    try {
      const res = await fetch(`${DATALAB_BASE}/api/fan-chat/messages?${params}`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      })

      if (res.ok) {
        const data = await res.json()
        // If DataLab returned messages, use them
        if (data.messages && data.messages.length > 0) {
          return NextResponse.json(data)
        }
      } else {
        console.error('[fan-chat/messages GET] DataLab error', res.status)
      }
    } catch (dlErr) {
      console.error('[fan-chat/messages GET] DataLab unreachable:', dlErr)
    }

    // Fallback: query Supabase directly
    const fallbackData = await fetchMessagesFromSupabase(
      channel,
      parseInt(limit, 10),
      before
    )
    return NextResponse.json(fallbackData)
  } catch (err) {
    console.error('[fan-chat/messages GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/fan-chat/messages
 * Proxies to DataLab POST /api/fan-chat/messages
 * DataLab handles persistence, user resolution, and AI auto-response when solo.
 * Body: { channel, content, userId?, displayName, isAI?, personality? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, content } = body

    if (!channel || !content) {
      return NextResponse.json({ error: 'channel and content required' }, { status: 400 })
    }

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      console.error('[fan-chat/messages POST] DataLab error', res.status, errData)
      return NextResponse.json(
        { error: errData.error || 'Failed to save message' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[fan-chat/messages POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
