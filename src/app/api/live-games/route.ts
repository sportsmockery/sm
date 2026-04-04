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

    // Prefer Supabase (shared DB) first
    const supabaseResult = await fetchFromSupabase(team)

    // If Supabase returned any games, or we successfully hit the DB, use that
    if (supabaseResult?.games && supabaseResult.games.length > 0) {
      return NextResponse.json(supabaseResult)
    }

    // Fallback: DataLab REST API
    const datalabGames = await fetchFromDatalabApi(team)
    if (datalabGames) {
      return NextResponse.json(datalabGames)
    }

    // If DataLab is also unavailable, still return the Supabase payload (likely empty)
    return NextResponse.json(supabaseResult ?? { games: [], count: 0 })
  } catch (error) {
    console.error('[API /api/live-games] Error:', error)
    return NextResponse.json({
      games: [],
      count: 0,
      error: 'Failed to fetch live games',
    })
  }
}

const CENTRAL_TZ = 'America/Chicago'

function toCentralTimeString(dateLike: string | Date | null | undefined): string | null {
  if (!dateLike) return null
  const date = typeof dateLike === 'string' ? new Date(dateLike) : dateLike
  if (Number.isNaN(date.getTime())) return null

  const datePart = date.toLocaleDateString('en-US', {
    timeZone: CENTRAL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const timePart = date.toLocaleTimeString('en-US', {
    timeZone: CENTRAL_TZ,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${datePart}, ${timePart} CT`
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
      // DataLab uses home_team/away_team (abbrs like "CHI", "CHC", "CHW")
      const homeAbbr = game.home_team || game.home_team_abbr || ''
      const awayAbbr = game.away_team || game.away_team_abbr || ''
      const isChicagoHome = homeAbbr === 'CHI' || homeAbbr === 'CHC' || homeAbbr === 'CHW'

      // game_time_central is already formatted by DataLab: "03/17/2026, 6:30 PM CT"
      const gameTimeDisplay = parseGameTimeCentral(game.game_time_central)

      return {
        game_id: game.game_id,
        sport: game.sport,
        status: game.status === 'pre' ? 'upcoming' : game.status,
        game_start_time: game.game_date,
        game_time_display: gameTimeDisplay,
        home_team_id: game.team_id || '',
        away_team_id: '',
        home_team_name: game.home_team_full || game.home_team_name || homeAbbr,
        away_team_name: game.away_team_full || game.away_team_name || awayAbbr,
        home_team_abbr: homeAbbr,
        away_team_abbr: awayAbbr,
        home_logo_url: game.home_logo_url || '',
        away_logo_url: game.away_logo_url || '',
        home_score: game.home_score || 0,
        away_score: game.away_score || 0,
        period: game.period || null,
        period_label: game.period_label || game.period || null,
        clock: game.clock || null,
        venue_name: game.venue || game.venue_name || null,
        broadcast_network: game.broadcast_network || null,
        plays_count: game.plays_count || 0,
        updated_at: game.last_updated || game.updated_at,
        chicago_team: game.team_id || '',
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

  // Query all team tables in parallel instead of sequentially
  const results = await Promise.all(
    teams.map(async (t) => {
      const table = TEAM_TABLES[t]
      if (!table) return []

      const { data, error } = await datalabAdmin
        .from(table)
        .select('*')
        .in('status', ['in_progress', 'pre', 'live', 'upcoming', 'final'])
        .order('updated_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error(`[live-games] Error querying ${table}:`, error.message)
        return []
      }

      if (!data || data.length === 0) return []

      return data.map((game: any) => {
        const gameTimeCentral = toCentralTimeString(game.game_date)
        const gameTimeDisplay = parseGameTimeCentral(gameTimeCentral)

        return {
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
        }
      })
    })
  )
  allGames.push(...results.flat())

  // Fallback enrichment: if game_time_display is still null for upcoming games, try games_master
  const MASTER_TABLES: Record<string, string> = {
    bears: 'bears_games_master',
    bulls: 'bulls_games_master',
    blackhawks: 'blackhawks_games_master',
    cubs: 'cubs_games_master',
    whitesox: 'whitesox_games_master',
  }

  // Enrich upcoming games missing display times — in parallel
  const gamesToEnrich = allGames.filter(
    (g) => g.status === 'upcoming' && !g.game_time_display && MASTER_TABLES[g.chicago_team]
  )
  if (gamesToEnrich.length > 0) {
    const enrichResults = await Promise.all(
      gamesToEnrich.map(async (game) => {
        const masterTable = MASTER_TABLES[game.chicago_team]
        const dateOnly = String(game.game_start_time || '').slice(0, 10)
        if (!dateOnly || dateOnly.length < 10) return null
        try {
          const { data: masterRow } = await datalabAdmin
            .from(masterTable)
            .select('game_time, game_time_display')
            .eq('game_date', dateOnly)
            .limit(1)
            .single()
          return { game, masterRow }
        } catch { return null }
      })
    )
    for (const result of enrichResults) {
      if (!result?.masterRow) continue
      if (result.masterRow.game_time_display) {
        result.game.game_time_display = result.masterRow.game_time_display
      }
      if (result.masterRow.game_time) {
        const dateOnly = String(result.game.game_start_time || '').slice(0, 10)
        result.game.game_start_time = `${dateOnly}T${result.masterRow.game_time}-06:00`
      }
    }
  }

  return {
    games: allGames,
    count: allGames.length,
    timestamp: new Date().toISOString(),
  }
}
