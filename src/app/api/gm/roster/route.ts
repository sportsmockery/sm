import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

const TEAM_CONFIG: Record<string, {
  table: string
  activeCol: string
  sport: string
  nameCol: string
  statsTable: string
  statsJoinCol: string
  seasonValue: number
}> = {
  bears: { table: 'bears_players', activeCol: 'is_active', sport: 'nfl', nameCol: 'name', statsTable: 'bears_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025 },
  bulls: { table: 'bulls_players', activeCol: 'is_current_bulls', sport: 'nba', nameCol: 'display_name', statsTable: 'bulls_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026 },
  blackhawks: { table: 'blackhawks_players', activeCol: 'is_active', sport: 'nhl', nameCol: 'name', statsTable: 'blackhawks_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2026 },
  cubs: { table: 'cubs_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'cubs_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025 },
  whitesox: { table: 'whitesox_players', activeCol: 'is_active', sport: 'mlb', nameCol: 'name', statsTable: 'whitesox_player_game_stats', statsJoinCol: 'player_id', seasonValue: 2025 },
}

interface PlayerData {
  player_id: string
  full_name: string
  position: string
  jersey_number: number | null
  headshot_url: string | null
  age: number | null
  weight_lbs: number | null
  college: string | null
  years_exp: number | null
  draft_info: string | null
  espn_id: string | null
  stat_line: string
  stats: Record<string, number | string | null>
}

const SPORT_ROSTER_TABLE: Record<string, string> = {
  nfl: 'gm_nfl_rosters',
  nba: 'gm_nba_rosters',
  nhl: 'gm_nhl_rosters',
  mlb: 'gm_mlb_rosters',
}

async function fetchOpponentRoster(teamKey: string, sport: string, search?: string, posFilter?: string) {
  const table = SPORT_ROSTER_TABLE[sport]
  if (!table) throw new Error('Invalid sport')

  const { data: rawPlayers, error } = await datalabAdmin
    .from(table)
    .select('espn_player_id, full_name, position, jersey_number, headshot_url, age, weight_lbs, college, years_exp, draft_year, draft_round, draft_pick, base_salary, cap_hit, contract_years_remaining, is_rookie_deal, status')
    .eq('team_key', teamKey)
    .eq('is_active', true)
    .order('position')
    .order('full_name')

  if (error) throw error

  let players: PlayerData[] = (rawPlayers || []).map((p: any) => {
    const draftInfo = p.draft_year && p.draft_round
      ? `${p.draft_year} R${p.draft_round}${p.draft_pick ? ` P${p.draft_pick}` : ''}`
      : null

    return {
      player_id: p.espn_player_id?.toString() || p.full_name,
      full_name: p.full_name || 'Unknown',
      position: p.position || 'Unknown',
      jersey_number: p.jersey_number,
      headshot_url: p.headshot_url,
      age: p.age,
      weight_lbs: p.weight_lbs,
      college: p.college,
      years_exp: p.years_exp,
      draft_info: draftInfo,
      espn_id: p.espn_player_id?.toString() || null,
      stat_line: '',
      stats: {},
      status: p.status || 'Active',
      cap_hit: p.cap_hit,
      contract_years: p.contract_years_remaining,
      is_rookie_deal: p.is_rookie_deal,
    }
  })

  if (search) {
    players = players.filter(p => p.full_name.toLowerCase().includes(search))
  }
  if (posFilter && posFilter !== 'ALL') {
    players = players.filter(p => p.position === posFilter)
  }

  return players
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const search = request.nextUrl.searchParams.get('search')?.toLowerCase()
    const posFilter = request.nextUrl.searchParams.get('position')

    // Opponent roster path: team_key + sport params
    const teamKey = request.nextUrl.searchParams.get('team_key')
    const sportParam = request.nextUrl.searchParams.get('sport')
    if (teamKey && sportParam) {
      const players = await fetchOpponentRoster(teamKey, sportParam, search || undefined, posFilter || undefined)
      return NextResponse.json({ players, sport: sportParam })
    }

    // Chicago roster path: team param
    const team = request.nextUrl.searchParams.get('team')
    if (!team || !TEAM_CONFIG[team]) {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
    }

    const config = TEAM_CONFIG[team]

    const selectCols = team === 'bulls'
      ? 'player_id, display_name, position, jersey_number, headshot_url, age, weight_lbs, college, years_pro, draft_year, draft_round, draft_pick, espn_player_id'
      : team === 'bears'
        ? 'player_id, name, position, jersey_number, headshot_url, age, weight_lbs, college, years_exp, draft_year, draft_round, draft_pick, espn_id'
        : team === 'blackhawks'
          ? 'player_id, name, position, jersey_number, headshot_url, age, weight_lbs, college, years_experience, draft_year, draft_round, draft_pick, espn_id'
          : 'player_id, name, position, jersey_number, headshot_url, age, weight_lbs, college, espn_id'

    let query = datalabAdmin
      .from(config.table)
      .select(selectCols)
      .eq(config.activeCol, true)
      .order('position')
      .order(config.nameCol)

    const { data: rawPlayers, error } = await query
    if (error) throw error

    const statsMap = await fetchSeasonStats(team, config)

    const players: PlayerData[] = (rawPlayers || []).map((p: any) => {
      const fullName = p.display_name || p.name || 'Unknown'
      const espnId = p.espn_player_id || p.espn_id || null
      const yearsExp = p.years_exp ?? p.years_pro ?? p.years_experience ?? null
      const draftInfo = p.draft_year && p.draft_round
        ? `${p.draft_year} R${p.draft_round}${p.draft_pick ? ` P${p.draft_pick}` : ''}`
        : null

      const playerStats = statsMap.get(espnId || p.player_id) || {}
      const statLine = buildStatLine(config.sport, playerStats, p.position)

      return {
        player_id: p.player_id?.toString() || p.espn_player_id || p.espn_id || '',
        full_name: fullName,
        position: p.position || 'Unknown',
        jersey_number: p.jersey_number,
        headshot_url: p.headshot_url,
        age: p.age,
        weight_lbs: p.weight_lbs,
        college: p.college,
        years_exp: yearsExp,
        draft_info: draftInfo,
        espn_id: espnId,
        stat_line: statLine,
        stats: playerStats,
      }
    })

    let filtered = players
    if (search) {
      filtered = filtered.filter(p => p.full_name.toLowerCase().includes(search))
    }
    if (posFilter && posFilter !== 'ALL') {
      filtered = filtered.filter(p => p.position === posFilter)
    }

    return NextResponse.json({ players: filtered, sport: config.sport })
  } catch (error) {
    console.error('GM roster error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/roster' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 })
  }
}

async function fetchSeasonStats(
  team: string,
  config: typeof TEAM_CONFIG[string]
): Promise<Map<string, Record<string, any>>> {
  const map = new Map<string, Record<string, any>>()

  try {
    if (config.sport === 'nfl') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, passing_yards, passing_touchdowns, passing_interceptions, rushing_yards, rushing_touchdowns, rushing_carries, receiving_yards, receiving_touchdowns, receiving_receptions, defensive_total_tackles, defensive_sacks')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, pass_yds: 0, pass_td: 0, pass_int: 0, rush_yds: 0, rush_td: 0, rush_car: 0, rec_yds: 0, rec_td: 0, rec: 0, tackles: 0, sacks: 0 })
          const a = agg.get(pid)!
          a.games++
          a.pass_yds += s.passing_yards || 0
          a.pass_td += s.passing_touchdowns || 0
          a.pass_int += s.passing_interceptions || 0
          a.rush_yds += s.rushing_yards || 0
          a.rush_td += s.rushing_touchdowns || 0
          a.rush_car += s.rushing_carries || 0
          a.rec_yds += s.receiving_yards || 0
          a.rec_td += s.receiving_touchdowns || 0
          a.rec += s.receiving_receptions || 0
          a.tackles += s.defensive_total_tackles || 0
          a.sacks += s.defensive_sacks || 0
        }
        agg.forEach((v, k) => map.set(k, v))
      }
    } else if (config.sport === 'nba') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, points, total_rebounds, assists, steals, blocks, field_goal_pct, three_point_pct')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, pts: 0, reb: 0, ast: 0, stl: 0, blk: 0, fg_pct_sum: 0, tp_pct_sum: 0 })
          const a = agg.get(pid)!
          a.games++
          a.pts += s.points || 0
          a.reb += s.total_rebounds || 0
          a.ast += s.assists || 0
          a.stl += s.steals || 0
          a.blk += s.blocks || 0
          a.fg_pct_sum += s.field_goal_pct || 0
          a.tp_pct_sum += s.three_point_pct || 0
        }
        agg.forEach((v, k) => {
          if (v.games > 0) {
            map.set(k, {
              games: v.games,
              ppg: +(v.pts / v.games).toFixed(1),
              rpg: +(v.reb / v.games).toFixed(1),
              apg: +(v.ast / v.games).toFixed(1),
              spg: +(v.stl / v.games).toFixed(1),
              bpg: +(v.blk / v.games).toFixed(1),
              fg_pct: +(v.fg_pct_sum / v.games).toFixed(1),
              tp_pct: +(v.tp_pct_sum / v.games).toFixed(1),
            })
          }
        })
      }
    } else if (config.sport === 'nhl') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, goals, assists, points, plus_minus, shots_on_goal')
        .eq('season', config.seasonValue)
        .eq('is_opponent', false)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, goals: 0, assists: 0, points: 0, pm: 0, shots: 0 })
          const a = agg.get(pid)!
          a.games++
          a.goals += s.goals || 0
          a.assists += s.assists || 0
          a.points += s.points || 0
          a.pm += s.plus_minus || 0
          a.shots += s.shots_on_goal || 0
        }
        agg.forEach((v, k) => map.set(k, v))
      }
    } else if (config.sport === 'mlb') {
      const { data: stats } = await datalabAdmin
        .from(config.statsTable)
        .select('player_id, at_bats, hits, home_runs, rbi, runs, stolen_bases, walks, strikeouts, innings_pitched, earned_runs, strikeouts_pitched, win, loss, save')
        .eq('season', config.seasonValue)

      if (stats) {
        const agg = new Map<string, any>()
        for (const s of stats) {
          const pid = s.player_id?.toString()
          if (!pid) continue
          if (!agg.has(pid)) agg.set(pid, { games: 0, ab: 0, h: 0, hr: 0, rbi: 0, r: 0, sb: 0, bb: 0, k: 0, ip: 0, er: 0, kp: 0, w: 0, l: 0, sv: 0 })
          const a = agg.get(pid)!
          a.games++
          a.ab += s.at_bats || 0
          a.h += s.hits || 0
          a.hr += s.home_runs || 0
          a.rbi += s.rbi || 0
          a.r += s.runs || 0
          a.sb += s.stolen_bases || 0
          a.bb += s.walks || 0
          a.k += s.strikeouts || 0
          a.ip += s.innings_pitched || 0
          a.er += s.earned_runs || 0
          a.kp += s.strikeouts_pitched || 0
          a.w += s.win ? 1 : 0
          a.l += s.loss ? 1 : 0
          a.sv += s.save ? 1 : 0
        }
        agg.forEach((v, k) => {
          const avg = v.ab > 0 ? (v.h / v.ab) : 0
          const era = v.ip > 0 ? (v.er / v.ip * 9) : 0
          map.set(k, { ...v, avg: +avg.toFixed(3), era: +era.toFixed(2) })
        })
      }
    }
  } catch (e) {
    console.error('Stats fetch error:', e)
  }

  return map
}

function buildStatLine(sport: string, stats: Record<string, any>, position: string): string {
  if (!stats || !stats.games) return ''

  if (sport === 'nfl') {
    if (stats.pass_yds > 100) return `${stats.pass_yds.toLocaleString()} YDS / ${stats.pass_td} TD / ${stats.pass_int} INT`
    if (stats.rush_car > 10) return `${stats.rush_yds} YDS / ${stats.rush_td} TD`
    if (stats.rec > 5) return `${stats.rec} REC / ${stats.rec_yds} YDS / ${stats.rec_td} TD`
    if (stats.tackles > 5) return `${stats.tackles} TKL / ${stats.sacks} SCK`
    return `${stats.games} GP`
  }
  if (sport === 'nba') {
    return `${stats.ppg} PPG / ${stats.rpg} RPG / ${stats.apg} APG`
  }
  if (sport === 'nhl') {
    return `${stats.goals}G / ${stats.assists}A / ${stats.points}P`
  }
  if (sport === 'mlb') {
    if (stats.ip > 10) return `${stats.w}-${stats.l} / ${stats.era} ERA / ${stats.kp} K`
    if (stats.ab > 10) return `.${stats.avg.toString().replace('0.', '')} / ${stats.hr} HR / ${stats.rbi} RBI`
    return `${stats.games} GP`
  }
  return ''
}
