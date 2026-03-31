import { NextRequest, NextResponse } from 'next/server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

const VALID_CHANNELS = new Set([
  'bears', 'bulls', 'cubs', 'whitesox', 'blackhawks',
])

/**
 * Normalize DataLab message shape to a flat format the frontend can consume.
 * DataLab returns: { id, sender_type, sender_id, sender_name, message, created_at }
 * Frontend expects: { id, user_id, content, created_at, display_name, badge }
 */
function normalizeMessage(msg: any) {
  return {
    id: String(msg.id),
    user_id: msg.sender_id || '',
    content: msg.message,
    created_at: msg.created_at,
    display_name: msg.sender_name || 'Fan',
    badge: msg.sender_type === 'ai' ? 'ai' : 'fan',
  }
}

/**
 * GET /api/fan-chat/messages?channel=bears&limit=200&before=<iso>
 * Proxies to DataLab GET /api/fan-chat/messages?team=bears&limit=200&before=<iso>
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const channel = searchParams.get('channel')
    const limit = searchParams.get('limit') || '200'
    const before = searchParams.get('before')

    if (!channel || !VALID_CHANNELS.has(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 })
    }

    const params = new URLSearchParams({ team: channel, limit })
    if (before) params.set('before', before)

    try {
      const res = await fetch(`${DATALAB_BASE}/api/fan-chat/messages?${params}`, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      })

      if (res.ok) {
        const data = await res.json()
        // DataLab returns { success, team, messages: [...], has_more }
        const normalized = (data.messages || []).map(normalizeMessage)
        return NextResponse.json({
          messages: normalized,
          hasMore: data.has_more ?? false,
        })
      }

      console.error('[fan-chat/messages GET] DataLab error', res.status)
    } catch (dlErr) {
      console.error('[fan-chat/messages GET] DataLab unreachable:', dlErr)
    }

    // DataLab failed — return empty (messages exist in DataLab, not locally)
    return NextResponse.json({ messages: [], hasMore: false })
  } catch (err) {
    console.error('[fan-chat/messages GET]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/fan-chat/messages
 * Proxies to DataLab POST /api/fan-chat/messages
 * DataLab expects: { team, message, user_id, user_name }
 * DataLab returns: { success, user_message, ai_response?, active_users, ai_active }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channel, content, userId, displayName } = body

    if (!channel || !content) {
      return NextResponse.json({ error: 'channel and content required' }, { status: 400 })
    }

    // Translate to DataLab's expected format
    const datalabBody = {
      team: channel,
      message: content,
      user_id: userId || undefined,
      user_name: displayName || 'Fan',
    }

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datalabBody),
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

    // Normalize both user_message and ai_response to our message shape
    const result: any = { success: true }
    if (data.user_message) {
      result.userMessage = normalizeMessage(data.user_message)
    }
    if (data.ai_response) {
      result.aiResponse = normalizeMessage(data.ai_response)
    }
    result.activeUsers = data.active_users ?? 0
    result.aiActive = data.ai_active ?? false

    return NextResponse.json(result)
  } catch (err) {
    console.error('[fan-chat/messages POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
