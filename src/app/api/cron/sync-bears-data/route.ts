import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { datalabAdmin } from '@/lib/supabase-datalab'

/**
 * ETL Sync Job: Datalab → SportsMockery
 *
 * This endpoint syncs Bears data from Datalab (source of truth) to
 * the SportsMockery database (mirrored tables for fast reads).
 *
 * Should be called by a cron job every hour.
 *
 * POST /api/cron/sync-bears-data
 * Authorization: Bearer <CRON_SECRET>
 */

// Create admin client for SportsMockery DB
const SM_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SM_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const smAdmin = createClient(SM_URL, SM_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || ''

interface SyncResult {
  table: string
  status: 'success' | 'error' | 'skipped'
  rowsProcessed: number
  error?: string
}

export async function POST(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!datalabAdmin) {
    return NextResponse.json(
      { error: 'Datalab not configured' },
      { status: 503 }
    )
  }

  const results: SyncResult[] = []
  const startTime = Date.now()

  try {
    // 1. Sync bears_players
    results.push(await syncTable('bears_players', [
      'player_id', 'full_name', 'first_name', 'last_name', 'position',
      'position_group', 'jersey_number', 'height', 'weight', 'age',
      'college', 'experience', 'status', 'headshot_url', 'slug',
      'primary_role', 'created_at', 'updated_at'
    ], 'player_id'))

    // 2. Sync bears_player_season_stats (VIEW with game_type column)
    results.push(await syncTable('bears_player_season_stats', [
      'id', 'player_id', 'season', 'game_type', 'games_played',
      'pass_att', 'pass_cmp', 'pass_yds', 'pass_td', 'pass_int',
      'rush_att', 'rush_yds', 'rush_td',
      'rec', 'rec_yds', 'rec_td', 'rec_tgt',
      'fumbles', 'tackles', 'sacks', 'interceptions',
      'passes_defended', 'forced_fumbles', 'fumble_recoveries',
      'snaps', 'created_at', 'updated_at'
    ], 'id'))

    // 3. Sync bears_player_game_stats (now includes game_type column)
    results.push(await syncTable('bears_player_game_stats', [
      'id', 'game_id', 'player_id', 'team_key', 'opp_key', 'game_type',
      'pass_att', 'pass_cmp', 'pass_yds', 'pass_td', 'pass_int', 'sacks',
      'rush_att', 'rush_yds', 'rush_td',
      'rec_tgt', 'rec', 'rec_yds', 'rec_td',
      'fumbles', 'tackles', 'interceptions',
      'created_at'
    ], 'id'))

    // 4. Sync bears_games_master
    results.push(await syncTable('bears_games_master', [
      'id', 'game_id', 'external_id', 'game_date', 'game_time',
      'season', 'week', 'game_type', 'opponent', 'is_bears_home',
      'bears_score', 'opponent_score', 'bears_win', 'stadium',
      'roof', 'temp_f', 'wind_mph', 'is_playoff', 'verified',
      'status', 'article_slug'
    ], 'game_id'))

    // 5. Sync bears_game_context
    results.push(await syncTable('bears_game_context', [
      'id', 'game_id', 'tv', 'broadcast', 'venue', 'weather_summary',
      'is_playoff', 'article_slug', 'created_at', 'updated_at'
    ], 'game_id'))

    // 6. Sync bears_team_season_stats (now has game_type column: 'regular' or 'postseason')
    results.push(await syncTable('bears_team_season_stats', [
      'id', 'season', 'game_type', 'wins', 'losses', 'ties',
      'points_for', 'points_against',
      'yards_for', 'yards_against',
      'turnovers_committed', 'turnovers_forced',
      'offensive_rank', 'defensive_rank'
    ], 'id'))

  } catch (error: any) {
    console.error('Sync job failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
      duration: Date.now() - startTime,
    }, { status: 500 })
  }

  const duration = Date.now() - startTime
  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  console.log(`Bears data sync completed: ${successCount} tables synced, ${errorCount} errors, ${duration}ms`)

  return NextResponse.json({
    success: errorCount === 0,
    results,
    summary: {
      tablesProcessed: results.length,
      success: successCount,
      errors: errorCount,
      skipped: results.filter(r => r.status === 'skipped').length,
    },
    duration,
    timestamp: new Date().toISOString(),
  })
}

async function syncTable(
  tableName: string,
  columns: string[],
  primaryKey: string
): Promise<SyncResult> {
  try {
    // Fetch all rows from Datalab
    const { data: sourceData, error: fetchError } = await datalabAdmin!
      .from(tableName)
      .select(columns.join(','))

    if (fetchError) {
      console.error(`Error fetching ${tableName} from Datalab:`, fetchError)
      return {
        table: tableName,
        status: 'error',
        rowsProcessed: 0,
        error: fetchError.message,
      }
    }

    if (!sourceData || sourceData.length === 0) {
      return {
        table: tableName,
        status: 'skipped',
        rowsProcessed: 0,
        error: 'No data in source table',
      }
    }

    // Filter to only columns that exist in source data
    const validColumns = columns.filter(col =>
      sourceData.length > 0 && col in sourceData[0]
    )

    // Clean data - only include valid columns
    const cleanedData = sourceData.map((row: any) => {
      const cleaned: Record<string, any> = {}
      validColumns.forEach(col => {
        if (row[col] !== undefined) {
          cleaned[col] = row[col]
        }
      })
      return cleaned
    })

    // Upsert to SportsMockery DB
    // First, try to delete existing data (full replace strategy)
    await smAdmin.from(tableName).delete().neq(primaryKey, 'impossible_value_to_match_nothing')

    // Then insert all rows
    const { error: insertError } = await smAdmin
      .from(tableName)
      .insert(cleanedData)

    if (insertError) {
      // Table might not exist, try upsert instead
      console.warn(`Insert failed for ${tableName}, trying upsert:`, insertError.message)

      const { error: upsertError } = await smAdmin
        .from(tableName)
        .upsert(cleanedData, { onConflict: primaryKey })

      if (upsertError) {
        console.error(`Upsert failed for ${tableName}:`, upsertError)
        return {
          table: tableName,
          status: 'error',
          rowsProcessed: 0,
          error: upsertError.message,
        }
      }
    }

    return {
      table: tableName,
      status: 'success',
      rowsProcessed: cleanedData.length,
    }
  } catch (error: any) {
    console.error(`Exception syncing ${tableName}:`, error)
    return {
      table: tableName,
      status: 'error',
      rowsProcessed: 0,
      error: error.message,
    }
  }
}

// GET endpoint for health check / manual trigger
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/cron/sync-bears-data',
    method: 'POST',
    description: 'Syncs Bears data from Datalab to SportsMockery DB',
    tables: [
      'bears_players',
      'bears_player_season_stats (with game_type)',
      'bears_player_game_stats (with game_type)',
      'bears_games_master',
      'bears_game_context',
      'bears_team_season_stats (with game_type: regular/postseason)',
    ],
    authentication: 'Bearer token required (CRON_SECRET)',
    schedule: 'Every hour',
  })
}
