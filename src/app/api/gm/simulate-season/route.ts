import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // V3 deep mode can take up to 15s

const DATALAB_BASE = 'https://datalab.sportsmockery.com'
const V3_ENDPOINT = `${DATALAB_BASE}/api/gm/simulate-season`
const V1_ENDPOINT = `${DATALAB_BASE}/api/gm/sim/season`

/**
 * POST /api/gm/simulate-season
 * Proxies to DataLab V3 season simulation API.
 * Falls back to V1 endpoint if V3 is completely unreachable.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear, simulationDepth } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    const payload = {
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
      simulationDepth: simulationDepth || 'standard',
    }

    const authKey = process.env.DATALAB_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

    // Try V3 endpoint first
    try {
      const v3Response = await fetch(V3_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`,
        },
        body: JSON.stringify(payload),
      })

      if (v3Response.ok) {
        const data = await v3Response.json()
        return NextResponse.json(data)
      }

      console.error('[Simulate Season V3] Non-OK response:', v3Response.status)
    } catch (v3Error) {
      console.error('[Simulate Season V3] Request failed:', v3Error)
    }

    // Fallback to V1 endpoint
    try {
      const v1Response = await fetch(V1_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authKey}`,
        },
        body: JSON.stringify({
          sessionId,
          sport,
          teamKey,
          seasonYear: seasonYear || 2026,
        }),
      })

      if (v1Response.ok) {
        const data = await v1Response.json()
        // Tag as v1 fallback
        return NextResponse.json({ ...data, simulation_version: data.simulation_version || 'v1' })
      }

      console.error('[Simulate Season V1 fallback] Non-OK response:', v1Response.status)
    } catch (v1Error) {
      console.error('[Simulate Season V1 fallback] Request failed:', v1Error)
    }

    // Both endpoints failed — fall back to local simulation engine
    const { simulateSeason } = await import('@/lib/sim/season-engine')
    const localResult = await simulateSeason({
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
    })

    return NextResponse.json({ ...localResult, simulation_version: 'v1' })

  } catch (error) {
    console.error('[Simulate Season] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
