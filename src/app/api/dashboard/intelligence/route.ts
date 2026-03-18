import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// =============================================================================
// Dashboard Intelligence — reads from DataLab Supabase (source of truth)
// =============================================================================
// Primary source: dashboard_intelligence_snapshot table (DataLab Supabase)
// The snapshot is pre-computed by DataLab and contains the full contract payload.
// This route reads the latest row and returns it verbatim.
//
// Dev fallback: DASHBOARD_USE_MOCK=true serves a static fixture when Supabase
// is unreachable. The mock lives in ./dev-mock.ts, isolated from production code.
// =============================================================================

export async function GET() {
  // ------------------------------------------------------------------
  // 1. Production — read latest snapshot from DataLab Supabase
  // ------------------------------------------------------------------
  if (process.env.DASHBOARD_USE_MOCK !== 'true') {
    try {
      const { data, error } = await datalabAdmin
        .from('dashboard_intelligence_snapshot')
        .select('payload')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data?.payload) {
        return NextResponse.json(data.payload, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          },
        })
      }

      console.warn('[dashboard/intelligence] Supabase read failed:', error?.message || 'no data')
    } catch (err) {
      console.warn('[dashboard/intelligence] Supabase unreachable, falling back to dev mock', err)
    }
  }

  // ------------------------------------------------------------------
  // 2. Dev fallback — static fixture (DASHBOARD_USE_MOCK=true or Supabase down)
  // ------------------------------------------------------------------
  const { buildDevMock } = await import('./dev-mock')
  return NextResponse.json(buildDevMock(), {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Data-Source': 'local-dev-mock',
    },
  })
}
