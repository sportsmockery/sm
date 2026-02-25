// src/app/api/track-scout/route.ts
// Scout AI event tracking — fires from ScoutSearchBox on homepage

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

const VALID_EVENTS = new Set(['open', 'summary_viewed', 'close'])

// In-memory rate limiter: 10 events/min per anon_id
const rateLimitStore = new Map<string, { count: number; lastReset: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

function isRateLimited(anonId: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(anonId)

  if (!entry || now - entry.lastReset > RATE_WINDOW_MS) {
    rateLimitStore.set(anonId, { count: 1, lastReset: now })
    return false
  }

  if (entry.count >= RATE_LIMIT) return true

  entry.count++
  return false
}

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

    if (isRateLimited(anon_id)) {
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
