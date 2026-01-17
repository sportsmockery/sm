import { NextRequest, NextResponse } from 'next/server'
import { syncRecentGames } from '@/lib/bears-sync'

// Allow longer timeout for sync operations
export const maxDuration = 60

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/bears-sync - Hourly Bears data sync
 *
 * Vercel Cron: runs every hour at minute 0
 * Schedule: "0 * * * *"
 *
 * This endpoint syncs Bears game data from ESPN (primary)
 * with MySportsFeeds as backup. Updates all future-relevant
 * columns in bears_games_master.
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request (optional but recommended)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // If CRON_SECRET is set, verify the request
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Cron] Unauthorized request to bears-sync')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Cron] Starting hourly Bears sync...')
  const startTime = Date.now()

  try {
    const result = await syncRecentGames()

    const duration = Date.now() - startTime

    console.log(`[Cron] Hourly sync complete in ${duration}ms:`, {
      success: result.success,
      updated: result.gamesUpdated,
      inserted: result.gamesInserted,
      source: result.source,
      errors: result.errors.length,
    })

    return NextResponse.json({
      success: result.success,
      type: 'hourly',
      gamesUpdated: result.gamesUpdated,
      gamesInserted: result.gamesInserted,
      source: result.source,
      errors: result.errors,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Cron] Hourly sync failed:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'hourly',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
