import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const revalidate = 300 // 5 minutes

interface PlayerBoxStats {
  playerId: number
  name: string
  position: string
  headshotUrl: string | null
  passingCmp: number | null
  passingAtt: number | null
  passingYds: number | null
  passingTd: number | null
  passingInt: number | null
  rushingCar: number | null
  rushingYds: number | null
  rushingTd: number | null
  receivingRec: number | null
  receivingTgts: number | null
  receivingYds: number | null
  receivingTd: number | null
  defTacklesTotal: number | null
  defSacks: number | null
  defInt: number | null
  fumFum: number | null
}

interface TeamStats {
  score: number
  result: 'W' | 'L' | null
  isHome: boolean
  passing: PlayerBoxStats[]
  rushing: PlayerBoxStats[]
  receiving: PlayerBoxStats[]
  defense: PlayerBoxStats[]
}

// Playoff round names - DataLab uses week 1-4 for postseason, ESPN uses 19-22
const PLAYOFF_ROUNDS: Record<number, string> = {
  1: 'Wild Card',
  2: 'Divisional Round',
  3: 'Conference Championship',
  4: 'Super Bowl',
  18: 'Wild Card',
  19: 'Wild Card',
  20: 'Divisional Round',
  21: 'Conference Championship',
  22: 'Super Bowl',
}

function categorizeStats(allStats: PlayerBoxStats[]) {
  return {
    passing: allStats
      .filter(s => s.passingAtt !== null && s.passingAtt > 0)
      .sort((a, b) => (b.passingYds || 0) - (a.passingYds || 0)),
    rushing: allStats
      .filter(s => s.rushingCar !== null && s.rushingCar > 0)
      .sort((a, b) => (b.rushingYds || 0) - (a.rushingYds || 0)),
    receiving: allStats
      .filter(s => s.receivingRec !== null && s.receivingRec > 0)
      .sort((a, b) => (b.receivingYds || 0) - (a.receivingYds || 0)),
    defense: allStats
      .filter(s => s.defTacklesTotal !== null && s.defTacklesTotal > 0)
      .sort((a, b) => (b.defTacklesTotal || 0) - (a.defTacklesTotal || 0)),
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params

    if (!datalabAdmin) {
      return NextResponse.json({ error: 'Datalab not configured' }, { status: 500 })
    }

    // Get game info
    const { data: gameData, error: gameError } = await datalabAdmin
      .from('bears_games_master')
      .select(`id, week, game_date, game_type, opponent, opponent_full_name,
        is_bears_home, stadium, bears_score, opponent_score, bears_win,
        temp_f, wind_mph, weather_summary`)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Fetch Bears team stats and opponent stats in parallel
    // Select both short (passing_yds) and long (passing_yards) column variants
    const statColumns = `player_id,
      passing_completions, passing_attempts, passing_yards, passing_touchdowns, passing_interceptions,
      passing_cmp, passing_att, passing_yds, passing_td, passing_int,
      rushing_carries, rushing_yards, rushing_touchdowns,
      rushing_car, rushing_yds, rushing_td,
      receiving_targets, receiving_receptions, receiving_yards, receiving_touchdowns,
      receiving_tgts, receiving_rec, receiving_yds, receiving_td,
      defensive_total_tackles, defensive_sacks, defensive_tackles_for_loss,
      def_tackles_total, def_sacks,
      fum_fum, interceptions, is_opponent`

    const [bearsStatsResult, oppStatsResult] = await Promise.all([
      datalabAdmin
        .from('bears_player_game_stats')
        .select(statColumns)
        .eq('bears_game_id', gameId)
        .eq('is_opponent', false),
      datalabAdmin
        .from('bears_player_game_stats')
        .select(`${statColumns},
          opponent_player_name, opponent_player_position, opponent_player_headshot_url`)
        .eq('bears_game_id', gameId)
        .eq('is_opponent', true),
    ])

    // Fetch Bears player info separately and join in code
    // player_id in bears_player_game_stats now contains ESPN IDs
    const bearsPlayerIds = (bearsStatsResult.data || []).map(s => s.player_id).filter(Boolean)
    let playersMap: Record<string, { name: string; position: string; headshot_url: string | null }> = {}

    if (bearsPlayerIds.length > 0) {
      const { data: playersData } = await datalabAdmin
        .from('bears_players')
        .select('espn_id, name, position, headshot_url')
        .in('espn_id', bearsPlayerIds)

      if (playersData) {
        playersMap = Object.fromEntries(
          playersData.map(p => [String(p.espn_id), { name: p.name, position: p.position, headshot_url: p.headshot_url }])
        )
      }
    }

    const transformStat = (stat: any, isOpponent: boolean): PlayerBoxStats => {
      const playerInfo = !isOpponent ? playersMap[String(stat.player_id)] : null
      return {
        playerId: stat.player_id,
        name: isOpponent ? (stat.opponent_player_name || 'Unknown') : (playerInfo?.name || 'Unknown'),
        position: isOpponent ? (stat.opponent_player_position || '') : (playerInfo?.position || ''),
        headshotUrl: isOpponent ? (stat.opponent_player_headshot_url || null) : (playerInfo?.headshot_url || null),
        // Handle both short (passing_yds) and long (passing_yards) column name formats
        passingCmp: stat.passing_completions ?? stat.passing_cmp,
        passingAtt: stat.passing_attempts ?? stat.passing_att,
        passingYds: stat.passing_yards ?? stat.passing_yds,
        passingTd: stat.passing_touchdowns ?? stat.passing_td,
        passingInt: stat.passing_interceptions ?? stat.passing_int,
        rushingCar: stat.rushing_carries ?? stat.rushing_car,
        rushingYds: stat.rushing_yards ?? stat.rushing_yds,
        rushingTd: stat.rushing_touchdowns ?? stat.rushing_td,
        receivingRec: stat.receiving_receptions ?? stat.receiving_rec,
        receivingTgts: stat.receiving_targets ?? stat.receiving_tgts,
        receivingYds: stat.receiving_yards ?? stat.receiving_yds,
        receivingTd: stat.receiving_touchdowns ?? stat.receiving_td,
        defTacklesTotal: stat.defensive_total_tackles ?? stat.def_tackles_total,
        defSacks: parseFloat(stat.defensive_sacks ?? stat.def_sacks) || null,
        defInt: stat.interceptions,
        fumFum: stat.fum_fum,
      }
    }

    const bearsStats = (bearsStatsResult.data || []).map(s => transformStat(s, false))
    const oppStats = (oppStatsResult.data || []).map(s => transformStat(s, true))

    const isPlayoff = gameData.game_type === 'postseason' || gameData.game_type === 'POST'

    const boxScore = {
      gameId: String(gameData.id),
      date: gameData.game_date,
      week: gameData.week,
      isPlayoff,
      playoffRound: isPlayoff ? (PLAYOFF_ROUNDS[gameData.week] || null) : null,
      venue: gameData.stadium,
      weather: gameData.temp_f !== null ? {
        tempF: gameData.temp_f,
        windMph: gameData.wind_mph,
        summary: gameData.weather_summary,
      } : null,
      bears: {
        score: gameData.bears_score || 0,
        result: gameData.bears_win !== null ? (gameData.bears_win ? 'W' : 'L') : null,
        isHome: gameData.is_bears_home,
        ...categorizeStats(bearsStats),
      },
      opponent: {
        abbrev: gameData.opponent,
        fullName: gameData.opponent_full_name || gameData.opponent,
        score: gameData.opponent_score || 0,
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${gameData.opponent.toLowerCase()}.png`,
        ...categorizeStats(oppStats),
      },
    }

    return NextResponse.json(boxScore)
  } catch (error) {
    console.error('Box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
