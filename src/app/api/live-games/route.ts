import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-games
 *
 * Returns live games for Chicago teams by querying DataLab Supabase directly.
 *
 * Query params:
 * - team: Filter by specific team ID (e.g., 'bears', 'bulls')
 * - include_upcoming: If 'true', include upcoming games
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')

    // Map team key to the live table name
    const TEAM_TABLES: Record<string, string> = {
      bears: 'bears_live',
      bulls: 'bulls_live',
      blackhawks: 'blackhawks_live',
      cubs: 'cubs_live',
      whitesox: 'whitesox_live',
    }

    const teams = team ? [team] : Object.keys(TEAM_TABLES)
    const allGames: any[] = []

    for (const t of teams) {
      const table = TEAM_TABLES[t]
      if (!table) continue

      const { data, error } = await datalabAdmin
        .from(table)
        .select('*')
        .in('status', ['in_progress', 'pre', 'live', 'upcoming', 'final'])
        .order('updated_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error(`[live-games] Error querying ${table}:`, error.message)
        continue
      }

      if (data && data.length > 0) {
        for (const game of data) {
          allGames.push({
            game_id: game.game_id,
            sport: game.sport,
            status: game.status === 'pre' ? 'upcoming' : game.status,
            game_start_time: game.game_date,
            home_team_id: t,
            away_team_id: '',
            home_team_name: game.home_team_name || '',
            away_team_name: game.away_team_name || '',
            home_team_abbr: game.home_team_abbr || '',
            away_team_abbr: game.away_team_abbr || '',
            home_logo_url: game.home_logo_url || '',
            away_logo_url: game.away_logo_url || '',
            home_score: game.home_score || 0,
            away_score: game.away_score || 0,
            period: game.period || null,
            period_label: game.period_label || null,
            clock: game.clock || null,
            venue_name: game.venue_name || null,
            broadcast_network: game.broadcast_network || null,
            updated_at: game.updated_at,
            chicago_team: t,
            is_chicago_home: game.home_team_abbr === 'CHI' || game.home_team_abbr === 'CHC' || game.home_team_abbr === 'CHW',
          })
        }
      }
    }

    // Enrich upcoming games with start times from games_master tables
    const MASTER_TABLES: Record<string, string> = {
      bears: 'bears_games_master',
      bulls: 'bulls_games_master',
      blackhawks: 'blackhawks_games_master',
      cubs: 'cubs_games_master',
      whitesox: 'whitesox_games_master',
    }

    for (const game of allGames) {
      if (game.status === 'upcoming') {
        // Enrich with game_time_display from games_master (CT formatted)
        const masterTable = MASTER_TABLES[game.chicago_team]
        if (masterTable && datalabAdmin) {
          // Extract date portion from game_start_time (could be "2026-03-17", "2026-03-17 15:05:00+00", etc.)
          const dateOnly = String(game.game_start_time || '').slice(0, 10)
          if (!dateOnly || dateOnly.length < 10) continue
          try {
            const { data: masterRow } = await datalabAdmin
              .from(masterTable)
              .select('game_time, game_time_display')
              .eq('game_date', dateOnly)
              .limit(1)
              .single()
            if (masterRow?.game_time_display) {
              game.game_time_display = masterRow.game_time_display
            }
            if (masterRow?.game_time) {
              // Set proper CT ISO for countdown timers
              game.game_start_time = `${dateOnly}T${masterRow.game_time}-06:00`
            }
          } catch { /* skip enrichment on error */ }
        }
      }
    }

    return NextResponse.json({
      games: allGames,
      count: allGames.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API /api/live-games] Error:', error)
    return NextResponse.json({
      games: [],
      count: 0,
      error: 'Failed to fetch live games',
    })
  }
}
