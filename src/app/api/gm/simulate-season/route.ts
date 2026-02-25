import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // V3 deep mode can take up to 15s

const DATALAB_BASE = 'https://datalab.sportsmockery.com'
const V3_ENDPOINT = `${DATALAB_BASE}/api/gm/simulate-season`
const V1_ENDPOINT = `${DATALAB_BASE}/api/gm/sim/season`

/**
 * Fetch accepted trades for this session with full player/pick data.
 * This ensures the simulation has the complete roster picture.
 */
async function fetchSessionTrades(sessionId: string) {
  try {
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('id, players_sent, players_received, draft_picks_sent, draft_picks_received, trade_partner, partner_team_key, chicago_team, sport, grade, is_three_team, partner_2')
      .eq('session_id', sessionId)
      .eq('status', 'accepted')

    return trades || []
  } catch (err) {
    console.error('[Simulate Season] Failed to fetch trades:', err)
    return []
  }
}

/**
 * POST /api/gm/simulate-season
 * Proxies to DataLab V3 season simulation API.
 * Includes full trade data (players, picks, prospects) so simulation
 * accounts for the new assets on each team after trades.
 * Falls back to V1 endpoint, then local engine if both fail.
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

    // Fetch full trade data to include in simulation request
    const trades = await fetchSessionTrades(sessionId)

    const payload = {
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
      simulationDepth: simulationDepth || 'standard',
      // Include full trade data so simulation has the complete roster picture
      trades: trades.map((t: any) => ({
        tradeId: t.id,
        chicagoTeam: t.chicago_team,
        tradePartner: t.trade_partner,
        partnerTeamKey: t.partner_team_key,
        grade: t.grade,
        isThreeTeam: !!t.is_three_team,
        partner2: t.partner_2 || null,
        playersSent: t.players_sent || [],
        playersReceived: t.players_received || [],
        draftPicksSent: t.draft_picks_sent || [],
        draftPicksReceived: t.draft_picks_received || [],
      })),
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
          trades: payload.trades,
        }),
      })

      if (v1Response.ok) {
        const data = await v1Response.json()
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
