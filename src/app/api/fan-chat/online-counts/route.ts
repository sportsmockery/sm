import { NextResponse } from 'next/server'

const DATALAB_BASE = 'https://datalab.sportsmockery.com'

const DEFAULT_COUNTS: Record<string, number> = {
  bears: 1, bulls: 1, cubs: 1, whitesox: 1, blackhawks: 1,
}

/**
 * GET /api/fan-chat/online-counts
 * Returns count of users currently online per channel.
 * Proxies to DataLab GET /api/fan-chat (rooms listing) and extracts active_users.
 */
export async function GET() {
  try {
    const res = await fetch(`${DATALAB_BASE}/api/fan-chat`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json(DEFAULT_COUNTS)
    }

    const data = await res.json()

    const counts: Record<string, number> = { ...DEFAULT_COUNTS }

    if (Array.isArray(data.rooms)) {
      for (const room of data.rooms) {
        const slug = room.team_key
        if (slug && slug in counts) {
          counts[slug] = Math.max(room.active_users ?? 1, 1)
        }
      }
    }

    return NextResponse.json(counts)
  } catch (err) {
    console.error('[fan-chat/online-counts]', err)
    return NextResponse.json(DEFAULT_COUNTS)
  }
}
