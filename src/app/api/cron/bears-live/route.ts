import { NextRequest, NextResponse } from 'next/server'
import { syncLiveGame, hasLiveGame } from '@/lib/bears-sync'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Allow sufficient timeout for live sync
export const maxDuration = 30

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/bears-live - Real-time Bears game sync
 *
 * Vercel Cron: runs every minute
 * Schedule: "* * * * *"
 *
 * This endpoint checks if there's a live Bears game and syncs
 * scores/status in real-time. It's designed to be lightweight
 * and only do actual work when a game is in progress.
 *
 * Polling logic:
 * - First: Quick check if there's a game today near current time
 * - If yes: Check ESPN for live game and sync if found
 * - Significant updates trigger immediate data refresh for UI
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request (optional)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Live Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()

  try {
    // Quick check: Is there a game scheduled within the live window?
    const shouldPoll = await isWithinGameWindow()

    if (!shouldPoll) {
      // No game in the window, skip expensive API calls
      return NextResponse.json({
        success: true,
        type: 'live',
        action: 'skipped',
        reason: 'No game in active window',
        duration: `${Date.now() - startTime}ms`,
        timestamp: new Date().toISOString(),
      })
    }

    // There might be a game - do the full live sync
    console.log('[Live Cron] Game window active, checking for live game...')
    const result = await syncLiveGame()

    const duration = Date.now() - startTime

    if (!result.gameId) {
      return NextResponse.json({
        success: true,
        type: 'live',
        action: 'checked',
        reason: 'No live game found',
        source: result.source,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    }

    console.log(`[Live Cron] Synced live game: ${result.gameId}, score changed: ${result.scoreChanged}`)

    return NextResponse.json({
      success: result.success,
      type: 'live',
      action: result.updated ? 'synced' : 'unchanged',
      gameId: result.gameId,
      scoreChanged: result.scoreChanged,
      source: result.source,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Live Cron] Error:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'live',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * Check if we're within a reasonable window for a Bears game
 *
 * NFL games typically occur:
 * - Sundays: 12:00 PM - 11:30 PM CT (main game window)
 * - Mondays: 7:00 PM - 11:30 PM CT (MNF)
 * - Thursdays: 7:00 PM - 11:30 PM CT (TNF)
 * - Some Saturdays (late season)
 *
 * We check the database for any Bears game scheduled today
 * within a 5-hour window around now.
 */
async function isWithinGameWindow(): Promise<boolean> {
  if (!datalabAdmin) return false

  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Check for any Bears game today
    const { data: todayGames } = await datalabAdmin
      .from('bears_games_master')
      .select('game_date, game_time')
      .eq('game_date', today)
      .limit(1)

    if (!todayGames || todayGames.length === 0) {
      return false
    }

    // There's a game today - check if we're within the game window
    // Games typically last ~3-4 hours, so we check:
    // - 1 hour before kickoff
    // - 4 hours after kickoff
    const game = todayGames[0]
    if (!game.game_time) {
      // No time specified, assume we should poll on game day
      return true
    }

    // Parse game time (assuming UTC or local)
    const [hours, minutes] = game.game_time.split(':').map(Number)
    const gameStart = new Date(today)
    gameStart.setUTCHours(hours, minutes, 0, 0)

    const windowStart = new Date(gameStart.getTime() - 60 * 60 * 1000) // 1 hour before
    const windowEnd = new Date(gameStart.getTime() + 4 * 60 * 60 * 1000) // 4 hours after

    return now >= windowStart && now <= windowEnd
  } catch (error) {
    console.error('[Live Cron] Window check error:', error)
    // On error, be safe and assume we should poll
    return true
  }
}
