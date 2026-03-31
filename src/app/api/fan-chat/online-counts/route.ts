import { NextResponse } from 'next/server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

const DEFAULT_COUNTS: Record<string, number> = {
  global: 1, bears: 1, bulls: 1, cubs: 1, whitesox: 1, blackhawks: 1,
}

/**
 * GET /api/fan-chat/online-counts
 * Returns count of users currently online per channel.
 * Proxies to DataLab GET /api/fan-chat (rooms listing) and extracts online counts.
 */
export async function GET() {
  try {
    const res = await fetch(`${DATALAB_BASE}/api/fan-chat`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json(DEFAULT_COUNTS)
    }

    const data = await res.json()

    // DataLab returns a rooms array — extract online_count per team slug
    const counts: Record<string, number> = { ...DEFAULT_COUNTS }

    if (Array.isArray(data.rooms || data)) {
      const rooms = data.rooms || data
      for (const room of rooms) {
        const slug = room.team_slug || room.team || room.channel
        if (slug && slug in counts) {
          counts[slug] = Math.max(room.online_count ?? room.onlineCount ?? 1, 1)
        }
      }
    }

    return NextResponse.json(counts)
  } catch (err) {
    console.error('[fan-chat/online-counts]', err)
    return NextResponse.json(DEFAULT_COUNTS)
  }
}
