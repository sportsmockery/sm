import { NextRequest, NextResponse } from 'next/server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

/**
 * POST /api/fan-chat/presence
 * Heartbeat — tells DataLab the user is still in a chat room.
 * Frontend sends: { channel, userId, displayName }
 * DataLab expects: { team, user_id, user_name }
 *
 * Also handles sendBeacon leave-room requests when `?_method=DELETE` is present.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const methodOverride = searchParams.get('_method')

    if (methodOverride === 'DELETE') {
      return handleDelete(request)
    }

    const body = await request.json()

    // Translate to DataLab's expected format
    const datalabBody = {
      team: body.channel,
      user_id: body.userId,
      user_name: body.displayName,
    }

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/presence`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datalabBody),
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

async function handleDelete(request: NextRequest) {
  try {
    const body = await request.json()

    const datalabBody = {
      team: body.channel,
      user_id: body.userId,
    }

    const res = await fetch(`${DATALAB_BASE}/api/fan-chat/presence`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datalabBody),
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
