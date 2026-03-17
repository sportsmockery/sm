import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'
const TEAM_TABLES = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'] as const
const CHICAGO_TEAM_IDS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

/**
 * GET /api/live-games/[gameId]
 *
 * Returns full game data: scores, player stats, play-by-play.
 * Primary: DataLab REST API (/api/live/{gameId}).
 * Fallback: Direct Supabase queries to {team}_live + {team}_player_stats_live.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 })
    }

    // Try DataLab REST API first
    const datalabResult = await fetchFromDatalabApi(gameId)
    if (datalabResult) {
      return NextResponse.json(datalabResult)
    }

    // Fallback: direct Supabase queries
    return await fetchFromSupabase(gameId)
  } catch (error) {
    console.error('[API /api/live-games/[gameId]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game data', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * Primary: DataLab REST API /api/live/{gameId}
 * Returns plays array, player_stats array, and game_time_central pre-formatted.
 */
async function fetchFromDatalabApi(gameId: string) {
  try {
    const res = await fetch(`${DATALAB_API_URL}/api/live/${gameId}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null

    const data = await res.json()

    // DataLab nests game info under game_data
    const gd = data.game_data || {}
    const homeAbbr = gd.home_team || ''
    const awayAbbr = gd.away_team || ''

    const isChicagoHome = homeAbbr === 'CHI' || homeAbbr === 'CHC' || homeAbbr === 'CHW'

    // Map plays from DataLab format
    const rawPlays: any[] = data.plays || []
    const playByPlay = rawPlays.map((p: any) => ({
      play_id: p.id || `${gameId}-${p.sequence}`,
      sequence: p.sequence || 0,
      game_clock: p.clock || '',
      period: p.period || 0,
      period_label: p.periodDisplay || `Period ${p.period}`,
      description: p.text || '',
      play_type: p.type || '',
      team_id: p.teamId || null,
      score_home: p.homeScore ?? 0,
      score_away: p.awayScore ?? 0,
      scoring_play: p.scoringPlay || false,
      score_value: p.scoreValue || 0,
      // Sport-specific fields
      shooting_play: p.shootingPlay,        // NBA
      points_attempted: p.pointsAttempted,  // NBA
      down: p.down,                         // NFL
      distance: p.distance,                 // NFL
      yard_line: p.yardLine,                // NFL
      drive_id: p.driveId,                  // NFL
      is_turnover: p.isTurnover,            // NFL
      strength: p.strength,                 // NHL (PP/SH/EV)
      at_bat_id: p.atBatId,                // MLB
      outs: p.outs,                         // MLB
      pitch_count: typeof p.pitchCount === 'object'
        ? p.pitchCount                      // MLB {balls, strikes} object
        : p.pitchCount,
    }))

    // Map player_stats from DataLab format (sport-prefixed columns)
    const rawPlayers: any[] = data.player_stats || []
    const players = rawPlayers.map((p: any) => ({
      player_id: p.player_id || p.espn_id,
      game_id: p.game_id || gameId,
      team_id: p.team_id,
      is_home_team: p.is_home_team,
      full_name: p.full_name,
      jersey_number: p.jersey_number,
      position: p.position,
      side: p.side || null,
      // NBA
      nba_minutes: p.nba_minutes,
      nba_points: p.nba_points,
      nba_fg_made: p.nba_fg_made,
      nba_fg_att: p.nba_fg_att,
      nba_3p_made: p.nba_3p_made,
      nba_3p_att: p.nba_3p_att,
      nba_ft_made: p.nba_ft_made,
      nba_ft_att: p.nba_ft_att,
      nba_reb_off: p.nba_reb_off,
      nba_reb_def: p.nba_reb_def,
      nba_reb_total: p.nba_reb_total ?? p.nba_rebounds,
      nba_assists: p.nba_assists,
      nba_steals: p.nba_steals,
      nba_blocks: p.nba_blocks,
      nba_turnovers: p.nba_turnovers,
      nba_fouls: p.nba_fouls,
      nba_plus_minus: p.nba_plus_minus,
      // NFL
      nfl_pass_attempts: p.nfl_pass_attempts,
      nfl_pass_completions: p.nfl_pass_completions,
      nfl_passing_yards: p.nfl_passing_yards,
      nfl_passing_tds: p.nfl_passing_tds,
      nfl_interceptions: p.nfl_interceptions,
      nfl_rush_attempts: p.nfl_rush_attempts,
      nfl_rushing_yards: p.nfl_rushing_yards,
      nfl_rushing_tds: p.nfl_rushing_tds,
      nfl_receptions: p.nfl_receptions,
      nfl_receiving_yards: p.nfl_receiving_yards,
      nfl_receiving_tds: p.nfl_receiving_tds,
      nfl_tackles: p.nfl_tackles,
      nfl_sacks: p.nfl_sacks,
      nfl_touchdowns: p.nfl_touchdowns,
      // NHL
      nhl_toi: p.nhl_toi,
      nhl_goals: p.nhl_goals,
      nhl_assists: p.nhl_assists,
      nhl_points: p.nhl_points,
      nhl_shots: p.nhl_shots,
      nhl_plus_minus: p.nhl_plus_minus,
      nhl_hits: p.nhl_hits,
      nhl_blocks: p.nhl_blocks,
      // MLB batting
      mlb_ab: p.mlb_ab,
      mlb_hits: p.mlb_hits,
      mlb_home_runs: p.mlb_home_runs ?? p.mlb_hr,
      mlb_rbi: p.mlb_rbi,
      mlb_bb: p.mlb_bb,
      mlb_so: p.mlb_so ?? p.mlb_k,
      mlb_avg: p.mlb_avg,
      mlb_runs: p.mlb_runs,
      // MLB pitching
      mlb_ip: p.mlb_ip,
      mlb_h_allowed: p.mlb_h_allowed ?? p.mlb_hits_allowed,
      mlb_er: p.mlb_er,
      mlb_k: p.mlb_k ?? p.mlb_k_pitched,
      mlb_era: p.mlb_era,
    }))

    // Linescore and team_stats are not in the DataLab REST API response,
    // so these remain null when using the API (Supabase fallback has raw_payload)
    const linescore: Record<string, { home: number; away: number }> | null = null
    const teamStats: { home: Record<string, number | string>; away: Record<string, number | string> } | null = null

    return {
      game_id: data.game_id,
      sport: data.sport,
      season: gd.season,
      game_date: gd.game_date,
      game_start_time: gd.game_date,
      status: data.status,
      home_team: {
        team_id: homeAbbr,
        name: gd.home_team_full || homeAbbr,
        abbr: homeAbbr,
        logo_url: gd.home_logo_url || '',
        score: gd.home_score ?? 0,
        timeouts: gd.home_timeouts ?? null,
        is_chicago: isChicagoHome,
      },
      away_team: {
        team_id: awayAbbr,
        name: gd.away_team_full || awayAbbr,
        abbr: awayAbbr,
        logo_url: gd.away_logo_url || '',
        score: gd.away_score ?? 0,
        timeouts: gd.away_timeouts ?? null,
        is_chicago: !isChicagoHome,
      },
      period: gd.period || null,
      period_label: gd.period || null,
      clock: gd.clock || null,
      venue: {
        name: gd.venue || null,
        city: gd.venue_city || null,
        state: gd.venue_state || null,
      },
      weather: {
        temperature: gd.temperature ?? null,
        condition: gd.weather_condition ?? null,
        wind_speed: gd.wind_speed ?? null,
      },
      broadcast: {
        network: gd.broadcast_network ?? null,
        announcers: gd.broadcast_announcers ?? null,
      },
      odds: {
        win_probability_home: gd.live_win_probability_home ?? null,
        win_probability_away: gd.live_win_probability_away ?? null,
        spread_favorite_team_id: gd.live_spread_favorite_team_id ?? null,
        spread_points: gd.live_spread_points ?? null,
        moneyline_home: gd.live_moneyline_home ?? null,
        moneyline_away: gd.live_moneyline_away ?? null,
        over_under: gd.live_over_under ?? null,
      },
      players,
      play_by_play: playByPlay,
      plays_count: data.plays_count || rawPlays.length,
      team_stats: teamStats,
      linescore,
      last_event_id: gd.last_event_id ?? null,
      poll_interval_ms: data.poll_interval_recommended_ms || 10000,
      cache_age_seconds: gd.last_updated
        ? Math.floor((Date.now() - new Date(gd.last_updated).getTime()) / 1000)
        : 0,
      updated_at: gd.last_updated,
      timestamp: new Date().toISOString(),
    }
  } catch (err) {
    console.warn('[live-games/gameId] DataLab API unavailable, falling back to Supabase:', (err as Error).message)
    return null
  }
}

/**
 * Fallback: Direct Supabase queries to {team}_live + {team}_player_stats_live
 */
async function fetchFromSupabase(gameId: string) {
  let gameRow: any = null
  let teamKey = ''

  for (const team of TEAM_TABLES) {
    const { data } = await datalabAdmin
      .from(`${team}_live`)
      .select('*')
      .eq('game_id', gameId)
      .limit(1)

    if (data && data.length > 0) {
      gameRow = data[0]
      teamKey = team
      break
    }
  }

  if (!gameRow) {
    return NextResponse.json({ error: 'Game not found', game_id: gameId }, { status: 404 })
  }

  // Fetch player stats
  const { data: playerRows } = await datalabAdmin
    .from(`${teamKey}_player_stats_live`)
    .select('*')
    .eq('game_id', gameId)

  const players = (playerRows || []).map((p: any) => ({
    player_id: p.player_id || p.espn_id,
    game_id: p.game_id,
    team_id: p.team_id,
    is_home_team: p.is_home_team,
    full_name: p.full_name,
    jersey_number: p.jersey_number,
    position: p.position,
    side: p.side || null,
    // NBA
    nba_minutes: p.nba_minutes,
    nba_points: p.nba_points,
    nba_fg_made: p.nba_fg_made,
    nba_fg_att: p.nba_fg_att,
    nba_3p_made: p.nba_3p_made,
    nba_3p_att: p.nba_3p_att,
    nba_ft_made: p.nba_ft_made,
    nba_ft_att: p.nba_ft_att,
    nba_reb_off: p.nba_reb_off,
    nba_reb_def: p.nba_reb_def,
    nba_reb_total: p.nba_reb_total,
    nba_assists: p.nba_assists,
    nba_steals: p.nba_steals,
    nba_blocks: p.nba_blocks,
    nba_turnovers: p.nba_turnovers,
    nba_fouls: p.nba_fouls,
    nba_plus_minus: p.nba_plus_minus,
    // NFL
    nfl_pass_attempts: p.nfl_pass_attempts,
    nfl_pass_completions: p.nfl_pass_completions,
    nfl_passing_yards: p.nfl_passing_yards,
    nfl_passing_tds: p.nfl_passing_tds,
    nfl_interceptions: p.nfl_interceptions,
    nfl_rush_attempts: p.nfl_rush_attempts,
    nfl_rushing_yards: p.nfl_rushing_yards,
    nfl_rushing_tds: p.nfl_rushing_tds,
    nfl_receptions: p.nfl_receptions,
    nfl_receiving_yards: p.nfl_receiving_yards,
    nfl_receiving_tds: p.nfl_receiving_tds,
    nfl_tackles: p.nfl_tackles,
    nfl_sacks: p.nfl_sacks,
    // NHL
    nhl_toi: p.nhl_toi,
    nhl_goals: p.nhl_goals,
    nhl_assists: p.nhl_assists,
    nhl_points: p.nhl_points,
    nhl_shots: p.nhl_shots,
    nhl_plus_minus: p.nhl_plus_minus,
    nhl_hits: p.nhl_hits,
    nhl_blocks: p.nhl_blocks,
    // MLB
    mlb_ab: p.mlb_ab,
    mlb_hits: p.mlb_hits,
    mlb_home_runs: p.mlb_home_runs,
    mlb_rbi: p.mlb_rbi,
    mlb_bb: p.mlb_bb,
    mlb_so: p.mlb_so,
    mlb_avg: p.mlb_avg,
    mlb_ip: p.mlb_ip,
    mlb_h_allowed: p.mlb_h_allowed,
    mlb_er: p.mlb_er,
    mlb_k: p.mlb_k,
    mlb_era: p.mlb_era,
  }))

  // Extract play-by-play from the plays JSONB column
  const rawPlays: any[] = gameRow.plays || []
  const playByPlay = rawPlays.map((p: any) => ({
    play_id: p.id || `${gameId}-${p.sequence}`,
    sequence: p.sequence || 0,
    game_clock: p.clock || '',
    period: p.period || 0,
    period_label: p.periodDisplay || `Period ${p.period}`,
    description: p.text || '',
    play_type: p.type || '',
    team_id: p.teamId || null,
    score_home: p.homeScore ?? 0,
    score_away: p.awayScore ?? 0,
    scoring_play: p.scoringPlay || false,
    score_value: p.scoreValue || 0,
    // Sport-specific
    shooting_play: p.shootingPlay,
    points_attempted: p.pointsAttempted,
    down: p.down,
    distance: p.distance,
    yard_line: p.yardLine,
    drive_id: p.driveId,
    is_turnover: p.isTurnover,
    strength: p.strength,
    at_bat_id: p.atBatId,
    outs: p.outs,
    pitch_count: p.pitchCount,
  }))

  // Build linescore from raw_payload if available
  let linescore: Record<string, { home: number; away: number }> | null = null
  const rawPayload = gameRow.raw_payload
  if (rawPayload?.competitions?.[0]?.competitors) {
    const competitors = rawPayload.competitions[0].competitors
    const home = competitors.find((c: any) => c.homeAway === 'home')
    const away = competitors.find((c: any) => c.homeAway === 'away')
    if (home?.linescores && away?.linescores) {
      linescore = {}
      for (let i = 0; i < Math.max(home.linescores.length, away.linescores.length); i++) {
        linescore[`${i + 1}`] = {
          home: home.linescores[i]?.value ?? 0,
          away: away.linescores[i]?.value ?? 0,
        }
      }
    }
  }

  // Build team stats from raw_payload
  let teamStats: { home: Record<string, number | string>; away: Record<string, number | string> } | null = null
  if (rawPayload?.competitions?.[0]?.competitors) {
    const competitors = rawPayload.competitions[0].competitors
    const home = competitors.find((c: any) => c.homeAway === 'home')
    const away = competitors.find((c: any) => c.homeAway === 'away')
    if (home?.statistics && away?.statistics) {
      const homeStats: Record<string, number | string> = {}
      const awayStats: Record<string, number | string> = {}
      for (const stat of home.statistics) homeStats[stat.name] = stat.displayValue
      for (const stat of away.statistics) awayStats[stat.name] = stat.displayValue
      teamStats = { home: homeStats, away: awayStats }
    }
  }

  const isChicagoHome = CHICAGO_TEAM_IDS.some(t => {
    if (t === 'bears') return gameRow.home_team_abbr === 'CHI' && gameRow.sport === 'nfl'
    if (t === 'bulls') return gameRow.home_team_abbr === 'CHI' && gameRow.sport === 'nba'
    if (t === 'blackhawks') return gameRow.home_team_abbr === 'CHI' && gameRow.sport === 'nhl'
    if (t === 'cubs') return gameRow.home_team_abbr === 'CHC'
    if (t === 'whitesox') return gameRow.home_team_abbr === 'CHW'
    return false
  })

  return NextResponse.json({
    game_id: gameRow.game_id,
    sport: gameRow.sport,
    season: gameRow.season,
    game_date: gameRow.game_date,
    game_start_time: gameRow.game_date,
    status: gameRow.status,
    home_team: {
      team_id: gameRow.home_team_id,
      name: gameRow.home_team_name,
      abbr: gameRow.home_team_abbr,
      logo_url: gameRow.home_logo_url,
      score: gameRow.home_score,
      timeouts: gameRow.home_timeouts,
      is_chicago: isChicagoHome,
    },
    away_team: {
      team_id: gameRow.away_team_id,
      name: gameRow.away_team_name,
      abbr: gameRow.away_team_abbr,
      logo_url: gameRow.away_logo_url,
      score: gameRow.away_score,
      timeouts: gameRow.away_timeouts,
      is_chicago: !isChicagoHome,
    },
    period: gameRow.period,
    period_label: gameRow.period_label,
    clock: gameRow.clock,
    venue: {
      name: gameRow.venue_name,
      city: gameRow.venue_city,
      state: gameRow.venue_state,
    },
    weather: {
      temperature: gameRow.temperature,
      condition: gameRow.weather_condition,
      wind_speed: gameRow.wind_speed,
    },
    broadcast: {
      network: gameRow.broadcast_network,
      announcers: gameRow.broadcast_announcers,
    },
    odds: {
      win_probability_home: gameRow.live_win_probability_home,
      win_probability_away: gameRow.live_win_probability_away,
      spread_favorite_team_id: gameRow.live_spread_favorite_team_id,
      spread_points: gameRow.live_spread_points,
      moneyline_home: gameRow.live_moneyline_home,
      moneyline_away: gameRow.live_moneyline_away,
      over_under: gameRow.live_over_under,
    },
    players,
    play_by_play: playByPlay,
    plays_count: rawPlays.length,
    team_stats: teamStats,
    linescore,
    last_event_id: gameRow.last_event_id,
    cache_age_seconds: Math.floor((Date.now() - new Date(gameRow.updated_at).getTime()) / 1000),
    updated_at: gameRow.updated_at,
    timestamp: new Date().toISOString(),
  })
}
