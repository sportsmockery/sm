import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30
export const dynamic = 'force-dynamic'

const MAX_DAYS = 30
const MAX_TABLE_SIZE = 100000 // Alert if table exceeds this many rows

/**
 * GET /api/cron/cleanup-scout-history
 *
 * Daily cleanup of scout_query_history table.
 * - Deletes entries older than 30 days
 * - Monitors table size
 *
 * Vercel Cron: runs daily at 3am UTC
 * Schedule: "0 3 * * *"
 */
export async function GET(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[Scout History Cleanup] Starting daily cleanup...')
  const startTime = Date.now()

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase credentials not configured',
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Calculate cutoff date (30 days ago)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - MAX_DAYS)

    // Get count of entries to delete
    const { count: toDeleteCount } = await supabase
      .from('scout_query_history')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', cutoff.toISOString())

    // Delete old entries
    const { error: deleteError } = await supabase
      .from('scout_query_history')
      .delete()
      .lt('created_at', cutoff.toISOString())

    if (deleteError) {
      console.error('[Scout History Cleanup] Delete error:', deleteError)
      return NextResponse.json({
        success: false,
        error: deleteError.message,
      }, { status: 500 })
    }

    // Get current table size
    const { count: totalCount } = await supabase
      .from('scout_query_history')
      .select('*', { count: 'exact', head: true })

    // Check if table is getting too large
    const tableSizeWarning = (totalCount || 0) > MAX_TABLE_SIZE

    if (tableSizeWarning) {
      console.warn(`[Scout History Cleanup] WARNING: Table has ${totalCount} rows (threshold: ${MAX_TABLE_SIZE})`)
    }

    const duration = Date.now() - startTime

    console.log(`[Scout History Cleanup] Completed in ${duration}ms - Deleted: ${toDeleteCount || 0}, Remaining: ${totalCount || 0}`)

    return NextResponse.json({
      success: true,
      deleted: toDeleteCount || 0,
      remaining: totalCount || 0,
      tableSizeWarning,
      cutoffDate: cutoff.toISOString(),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[Scout History Cleanup] Failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
