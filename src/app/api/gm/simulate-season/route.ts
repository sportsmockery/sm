import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // V3 deep mode can take up to 15s

const DATALAB_URL = 'https://datalab.sportsmockery.com'

/**
 * Fetch accepted trades for this session with full player/pick data.
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
 * Uses X-Source + X-User-Id auth (same pattern as other GM DataLab routes).
 * Includes full trade data so simulation accounts for roster changes.
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

    // Auth via X-API-Key (validated against DataLab's GM_API_KEY)
    const res = await fetch(`${DATALAB_URL}/api/gm/simulate-season`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.GM_API_KEY || '',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error(`[Simulate Season V3] DataLab returned ${res.status}:`, errorText)
      return NextResponse.json(
        { success: false, error: `DataLab simulation failed (${res.status})` },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('[Simulate Season] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
