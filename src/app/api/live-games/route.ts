import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

/**
 * GET /api/live-games
 *
 * Returns live games for Chicago teams.
 * Primary: DataLab REST API (/api/live) — returns game_time_central pre-formatted.
 * Fallback: Direct Supabase queries to {team}_live tables.
 *
 * Query params:
 * - team: Filter by specific team ID (e.g., 'bears', 'bulls')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')

    // Try DataLab REST API first
    const datalabGames = await fetchFromDatalabApi(team)
    if (datalabGames) {
      return NextResponse.json(datalabGames)
    }

    // Fallback: direct Supabase queries
    return NextResponse.json(await fetchFromSupabase(team))
  } catch (error) {
    console.error('[API /api/live-games] Error:', error)
    return NextResponse.json({
      games: [],
      count: 0,
      error: 'Failed to fetch live games',
    })
  }
}

/**
 * Primary source: DataLab REST API /api/live
 * Returns game_time_central already formatted as "MM/DD/YYYY, H:MM PM CT"
 */
async function fetchFromDatalabApi(team: string | null) {
  try {
    const url = team
      ? `${DATALAB_API_URL}/api/live?team=${team}`
      : `${DATALAB_API_URL}/api/live`

    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null

    const data = await res.json()
    const rawGames: any[] = Array.isArray(data) ? data : (data.games || [])

    const games = rawGames.map((game: any) => {
      const isChicagoHome = game.home_team_abbr === 'CHI' || game.home_team_abbr === 'CHC' || game.home_team_abbr === 'CHW'

      // game_time_central is now formatted: "03/17/2026, 6:30 PM CT"
      // Extract just the time portion for display
      const gameTimeDisplay = parseGameTimeCentral(game.game_time_central)

      return {
        game_id: game.game_id,
        sport: game.sport,
        status: game.status === 'pre' ? 'upcoming' : game.status,
        game_start_time: game.game_date,
        game_time_display: gameTimeDisplay,
        home_team_id: game.chicago_team || '',
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
        plays_count: game.plays_count || 0,
        updated_at: game.updated_at,
        chicago_team: game.chicago_team || '',
        is_chicago_home: isChicagoHome,
      }
    })

    return {
      games,
      count: games.length,
      poll_interval_ms: data.poll_interval_recommended_ms || 10000,
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[live-games] DataLab API unavailable, falling back to Supabase:', (err as Error).message)
    return null
  }
}

/**
 * Parse game_time_central from DataLab format "03/17/2026, 6:30 PM CT" → "6:30 PM CT"
 */
function parseGameTimeCentral(value: string | null | undefined): string | null {
  if (!value) return null
  // Format: "MM/DD/YYYY, H:MM PM CT" — extract everything after the ", "
  const commaIdx = value.indexOf(', ')
  if (commaIdx >= 0) {
    return value.slice(commaIdx + 2) // "6:30 PM CT"
  }
  // If already just a time string, return as-is
  return value
}

/**
 * Fallback: Direct Supabase queries to {team}_live tables
 * Enriches upcoming games from games_master for game_time_display
 */
async function fetchFromSupabase(team: string | null) {
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
        // game_time_central is now formatted in the DB too
        const gameTimeDisplay = parseGameTimeCentral(game.game_time_central)

        allGames.push({
          game_id: game.game_id,
          sport: game.sport,
          status: game.status === 'pre' ? 'upcoming' : game.status,
          game_start_time: game.game_date,
          game_time_display: gameTimeDisplay,
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

  // Fallback enrichment: if game_time_display is still null for upcoming games, try games_master
  const MASTER_TABLES: Record<string, string> = {
    bears: 'bears_games_master',
    bulls: 'bulls_games_master',
    blackhawks: 'blackhawks_games_master',
    cubs: 'cubs_games_master',
    whitesox: 'whitesox_games_master',
  }

  for (const game of allGames) {
    if (game.status === 'upcoming' && !game.game_time_display) {
      const masterTable = MASTER_TABLES[game.chicago_team]
      if (!masterTable) continue
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
          game.game_start_time = `${dateOnly}T${masterRow.game_time}-06:00`
        }
      } catch { /* skip enrichment on error */ }
    }
  }

  return {
    games: allGames,
    count: allGames.length,
    timestamp: new Date().toISOString(),
  }
}
