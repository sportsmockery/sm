import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { datalabClient } from '@/lib/supabase-datalab'

// Allow longer timeout for sync operations
export const maxDuration = 60

// Vercel cron requires GET method
export const dynamic = 'force-dynamic'

const TEAM_PATHS = [
  '/chicago-bears',
  '/chicago-bulls',
  '/chicago-blackhawks',
  '/chicago-cubs',
  '/chicago-white-sox',
]

const SUBPATHS = ['', '/schedule', '/scores', '/stats', '/roster']

/**
 * GET /api/cron/sync-teams - Hourly team data sync
 *
 * Vercel Cron: runs every hour at minute 0
 * Schedule: "0 * * * *"
 *
 * This endpoint triggers revalidation of all team pages to ensure
 * fresh data from DataLab Supabase. Uses Next.js ISR revalidation
 * to clear cached pages.
 */
export async function GET(request: NextRequest) {
  // Verify this is a Vercel cron request (optional)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.log('[Sync Teams Cron] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Sync Teams Cron] Starting hourly team data sync...')
  const startTime = Date.now()
  const revalidated: string[] = []
  const errors: string[] = []

  try {
    // Verify DataLab connection is working
    if (!datalabClient) {
      throw new Error('DataLab client not configured')
    }

    // Quick health check on DataLab
    const { error: healthError } = await datalabClient
      .from('bears_games_master')
      .select('id')
      .limit(1)

    if (healthError) {
      console.warn('[Sync Teams Cron] DataLab health check warning:', healthError.message)
    }

    // Revalidate all team pages
    for (const teamPath of TEAM_PATHS) {
      for (const subpath of SUBPATHS) {
        const fullPath = `${teamPath}${subpath}`
        try {
          revalidatePath(fullPath)
          revalidated.push(fullPath)
        } catch (e) {
          console.error(`[Sync Teams Cron] Failed to revalidate ${fullPath}:`, e)
          errors.push(fullPath)
        }
      }
    }

    const duration = Date.now() - startTime

    console.log(`[Sync Teams Cron] Hourly sync complete in ${duration}ms:`, {
      revalidatedCount: revalidated.length,
      errorsCount: errors.length,
    })

    return NextResponse.json({
      success: true,
      type: 'hourly-sync',
      revalidatedPaths: revalidated.length,
      errors: errors.length > 0 ? errors : undefined,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('[Sync Teams Cron] Hourly sync failed:', error)

    return NextResponse.json(
      {
        success: false,
        type: 'hourly-sync',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
