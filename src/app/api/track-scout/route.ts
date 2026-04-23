// src/app/api/track-scout/route.ts
// Scout AI event tracking — fires from ScoutSearchBox on homepage

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { checkRateLimitRedis } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

const VALID_EVENTS = new Set(['open', 'summary_viewed', 'close'])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { anon_id, session_id, user_id, event, path, team_slug, duration_ms, query } = body

    if (!anon_id || typeof anon_id !== 'string') {
      return NextResponse.json({ error: 'anon_id required' }, { status: 400 })
    }

    if (!event || !VALID_EVENTS.has(event)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }

    // Rate limit: 10 events per minute per anon_id (persistent via Redis)
    const rl = await checkRateLimitRedis({
      prefix: 'scout-track',
      key: anon_id,
      maxRequests: 10,
      windowSeconds: 60,
    })
    if (!rl.success) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    await supabaseAdmin.from('scout_events').insert({
      anon_id,
      session_id: session_id || null,
      user_id: user_id || null,
      event,
      path: path || null,
      team_slug: team_slug || null,
      duration_ms: typeof duration_ms === 'number' ? duration_ms : null,
      query: query || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
