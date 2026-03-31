import { NextRequest, NextResponse } from 'next/server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

/**
 * POST /api/fan-chat/presence
 * Heartbeat — tells DataLab the user is still in a chat room.
 * Body: { channel, userId, displayName }
 *
 * Also handles sendBeacon leave-room requests when `?_method=DELETE` is present
 * (sendBeacon can only POST, so the frontend uses this query param workaround).
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const methodOverride = searchParams.get('_method')

    // sendBeacon workaround — redirect to DELETE logic
    if (methodOverride === 'DELETE') {
      return handleDelete(request)
    }

    const body = await request.json()

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errData.error || 'Presence update failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[fan-chat/presence POST]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/fan-chat/presence
 * Leave room — tells DataLab the user left the chat room.
 * Body: { channel, userId }
 */
async function handleDelete(request: NextRequest) {
  try {
    const body = await request.json()

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/presence`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      return NextResponse.json(
        { error: errData.error || 'Leave room failed' },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[fan-chat/presence DELETE]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  return handleDelete(request)
}
