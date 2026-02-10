import { NextRequest, NextResponse } from 'next/server'
import { simulateSeason } from '@/lib/sim/season-engine'

/**
 * POST /api/gm/sim/season
 * Full season simulation with game-by-game results, standings, playoffs, and championship
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    const result = await simulateSeason({
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Simulation API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
