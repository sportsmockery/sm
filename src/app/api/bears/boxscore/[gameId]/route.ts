import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const revalidate = 300 // 5 minutes

// Position group mapping
const POSITION_TO_SIDE: Record<string, string> = {
  QB: 'OFF', RB: 'OFF', FB: 'OFF', WR: 'OFF', TE: 'OFF',
  OT: 'OFF', OG: 'OFF', C: 'OFF', T: 'OFF', G: 'OFF', OL: 'OFF',
  DE: 'DEF', DT: 'DEF', NT: 'DEF', DL: 'DEF',
  LB: 'DEF', ILB: 'DEF', OLB: 'DEF', MLB: 'DEF',
  CB: 'DEF', S: 'DEF', FS: 'DEF', SS: 'DEF', DB: 'DEF',
  K: 'ST', P: 'ST', LS: 'ST',
}

interface PlayerBoxStats {
  playerId: number
  name: string
  position: string
  headshotUrl: string | null
  // Passing
  passingCmp: number | null
  passingAtt: number | null
  passingYds: number | null
  passingTd: number | null
  passingInt: number | null
  passingRating: number | null
  // Rushing
  rushingCar: number | null
  rushingYds: number | null
  rushingTd: number | null
  rushingLng: number | null
  // Receiving
  receivingRec: number | null
  receivingTgts: number | null
  receivingYds: number | null
  receivingTd: number | null
  receivingLng: number | null
  // Defense
  defTacklesTotal: number | null
  defTacklesSolo: number | null
  defSacks: number | null
  defTfl: number | null
  defPassesDefended: number | null
  defInt: number | null
  // Fumbles
  fumFum: number | null
  fumLost: number | null
}

interface BoxScoreData {
  gameId: string
  date: string
  week: number
  isPlayoff: boolean
  playoffRound: string | null
  venue: string | null
  weather: {
    tempF: number | null
    windMph: number | null
    summary: string | null
  } | null
  bears: {
    score: number
    result: 'W' | 'L' | null
    isHome: boolean
    passing: PlayerBoxStats[]
    rushing: PlayerBoxStats[]
    receiving: PlayerBoxStats[]
    defense: PlayerBoxStats[]
  }
  opponent: {
    abbrev: string
    fullName: string
    score: number
    logo: string
  }
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params

    if (!datalabAdmin) {
      return NextResponse.json({ error: 'Datalab not configured' }, { status: 500 })
    }

    // Get game info from bears_games_master
    const { data: gameData, error: gameError } = await datalabAdmin
      .from('bears_games_master')
      .select(`
        id,
        week,
        game_date,
        game_type,
        opponent,
        opponent_full_name,
        is_bears_home,
        stadium,
        bears_score,
        opponent_score,
        bears_win,
        temp_f,
        wind_mph,
        weather_summary
      `)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Get player stats for this game
    // Column names match actual datalab schema: passing_*, rushing_*, receiving_*, def_*
    const { data: playerStats, error: statsError } = await datalabAdmin
      .from('bears_player_game_stats')
      .select(`
        player_id,
        passing_cmp,
        passing_att,
        passing_yds,
        passing_td,
        passing_int,
        def_sacks,
        rushing_car,
        rushing_yds,
        rushing_td,
        receiving_tgts,
        receiving_rec,
        receiving_yds,
        receiving_td,
        fum_fum,
        def_tackles_total,
        interceptions,
        bears_players!inner(
          id,
          name,
          position,
          headshot_url
        )
      `)
      .eq('bears_game_id', gameId)

    if (statsError) {
      console.error('Stats fetch error:', statsError)
    }

    // Transform player stats into categorized arrays
    // Maps datalab column names (passing_*, rushing_*, receiving_*, def_*) to API response format
    const transformPlayerStats = (stat: any): PlayerBoxStats => ({
      playerId: stat.player_id,
      name: stat.bears_players?.name || 'Unknown',
      position: stat.bears_players?.position || '',
      headshotUrl: stat.bears_players?.headshot_url || null,
      passingCmp: stat.passing_cmp,
      passingAtt: stat.passing_att,
      passingYds: stat.passing_yds,
      passingTd: stat.passing_td,
      passingInt: stat.passing_int,
      passingRating: null, // Calculate if needed
      rushingCar: stat.rushing_car,
      rushingYds: stat.rushing_yds,
      rushingTd: stat.rushing_td,
      rushingLng: null, // Not in datalab schema
      receivingRec: stat.receiving_rec,
      receivingTgts: stat.receiving_tgts,
      receivingYds: stat.receiving_yds,
      receivingTd: stat.receiving_td,
      receivingLng: null, // Not in datalab schema
      defTacklesTotal: stat.def_tackles_total,
      defTacklesSolo: null, // Not in datalab schema
      defSacks: parseFloat(stat.def_sacks) || null,
      defTfl: null, // Not in datalab schema
      defPassesDefended: null, // Not in datalab schema
      defInt: stat.interceptions,
      fumFum: stat.fum_fum,
      fumLost: null, // Not in datalab schema
    })

    const allStats = (playerStats || []).map(transformPlayerStats)

    // Categorize players by stats they have
    const passing = allStats
      .filter(s => s.passingAtt !== null && s.passingAtt > 0)
      .sort((a, b) => (b.passingYds || 0) - (a.passingYds || 0))

    const rushing = allStats
      .filter(s => s.rushingCar !== null && s.rushingCar > 0)
      .sort((a, b) => (b.rushingYds || 0) - (a.rushingYds || 0))

    const receiving = allStats
      .filter(s => s.receivingRec !== null && s.receivingRec > 0)
      .sort((a, b) => (b.receivingYds || 0) - (a.receivingYds || 0))

    const defense = allStats
      .filter(s => s.defTacklesTotal !== null && s.defTacklesTotal > 0)
      .sort((a, b) => (b.defTacklesTotal || 0) - (a.defTacklesTotal || 0))

    const isPlayoff = gameData.game_type === 'postseason' || gameData.game_type === 'POST'

    const boxScore: BoxScoreData = {
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
        passing,
        rushing,
        receiving,
        defense,
      },
      opponent: {
        abbrev: gameData.opponent,
        fullName: gameData.opponent_full_name || gameData.opponent,
        score: gameData.opponent_score || 0,
        logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${gameData.opponent.toLowerCase()}.png`,
      },
    }

    return NextResponse.json(boxScore)
  } catch (error) {
    console.error('Box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
