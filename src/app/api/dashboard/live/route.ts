import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// =============================================================================
// Dashboard Live — reads from dashboard_live_snapshot (source of truth)
// =============================================================================
// Primary source: dashboard_live_snapshot table (DataLab Supabase)
// Updated every 10-15s by ingest-live when games are active.
// Single-row table with CHECK (id = 1) — cheapest possible Supabase read.
//
// Returns: is_active, game_count, games, updated_at, computed_at, ttl_seconds, source
// The frontend uses ttl_seconds to control its own poll interval.
// =============================================================================

const EMPTY_LIVE = { is_active: false, game_count: 0, games: [], ttl_seconds: 300 }

export async function GET() {
  if (process.env.DASHBOARD_USE_MOCK !== 'true') {
    try {
      const { data, error } = await datalabAdmin
        .from('dashboard_live_snapshot')
        .select('is_active, game_count, games, updated_at, computed_at, ttl_seconds, source')
        .single()

      if (!error && data) {
        return NextResponse.json(data, {
          headers: { 'Cache-Control': 'no-store' },
        })
      }

      console.warn('[dashboard/live] Supabase read failed:', error?.message || 'no data')
    } catch (err) {
      console.warn('[dashboard/live] Supabase unreachable, returning empty live', err)
    }
  }

  return NextResponse.json(EMPTY_LIVE, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Data-Source': 'local-dev-mock',
    },
  })
}
