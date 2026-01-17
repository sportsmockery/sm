import { NextRequest, NextResponse } from 'next/server'
import {
  syncBearsSchedule,
  syncLiveGame,
  syncRecentGames,
  hasLiveGame,
  getNextGame,
} from '@/lib/bears-sync'

// Allow longer timeout for sync operations
export const maxDuration = 60

/**
 * GET /api/bears/sync - Check sync status and next game
 */
export async function GET(request: NextRequest) {
  try {
    const [liveGame, nextGame] = await Promise.all([
      hasLiveGame(),
      getNextGame(),
    ])

    return NextResponse.json({
      status: 'ok',
      hasLiveGame: liveGame,
      nextGame: nextGame ? {
        opponent: nextGame.opponent,
        date: nextGame.game_date,
        time: nextGame.game_time,
        isHome: nextGame.is_bears_home,
        week: nextGame.week,
      } : null,
      lastCheck: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync status error:', error)
    return NextResponse.json(
      { error: 'Failed to check sync status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bears/sync - Trigger manual sync
 *
 * Query params:
 *   type: 'full' | 'recent' | 'live' (default: 'recent')
 *   season: Season year (optional, for full sync)
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const syncType = searchParams.get('type') || 'recent'
    const season = searchParams.get('season')

    let result

    switch (syncType) {
      case 'full':
        // Full season sync - takes longer
        console.log('[Sync API] Starting full season sync...')
        result = await syncBearsSchedule({
          season: season ? parseInt(season, 10) : undefined,
        })
        break

      case 'live':
        // Live game sync - fast, for active games
        console.log('[Sync API] Starting live game sync...')
        result = await syncLiveGame()
        break

      case 'recent':
      default:
        // Recent games sync - balanced approach
        console.log('[Sync API] Starting recent games sync...')
        result = await syncRecentGames()
        break
    }

    return NextResponse.json({
      syncType,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json(
      {
        error: 'Sync failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
