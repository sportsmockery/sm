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

// Playoff round names
const PLAYOFF_ROUNDS: Record<number, string> = {
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
    // The game_id in bears_player_game_stats references bears_games_master.id
    // Try querying with the game ID directly
    let playerStats: any[] | null = null
    let statsError: any = null

    // First try matching by game_id (the internal ID)
    const { data: stats1, error: err1 } = await datalabAdmin
      .from('bears_player_game_stats')
      .select(`
        player_id,
        game_id,
        pass_cmp,
        pass_att,
        pass_yds,
        pass_td,
        pass_int,
        sacks,
        rush_att,
        rush_yds,
        rush_td,
        rec_tgt,
        rec,
        rec_yds,
        rec_td,
        fumbles,
        tackles,
        interceptions,
        bears_players(
          id,
          name,
          position,
          headshot_url
        )
      `)
      .eq('game_id', parseInt(gameId, 10) || gameId)

    if (!err1 && stats1 && stats1.length > 0) {
      playerStats = stats1
    } else {
      // Fallback: try to find stats by matching game date and season
      const { data: stats2, error: err2 } = await datalabAdmin
        .from('bears_player_game_stats')
        .select(`
          player_id,
          game_id,
          pass_cmp,
          pass_att,
          pass_yds,
          pass_td,
          pass_int,
          sacks,
          rush_att,
          rush_yds,
          rush_td,
          rec_tgt,
          rec,
          rec_yds,
          rec_td,
          fumbles,
          tackles,
          interceptions,
          bears_players(
            id,
            name,
            position,
            headshot_url
          )
        `)
        .eq('season', 2025)
        .eq('game_date', gameData.game_date)

      if (!err2 && stats2 && stats2.length > 0) {
        playerStats = stats2
      } else {
        statsError = err1 || err2
        console.error('Stats fetch error:', statsError)
      }
    }

    // Transform player stats into categorized arrays
    // Maps datalab column names (pass_*, rush_*, rec_*) to API response format
    const transformPlayerStats = (stat: any): PlayerBoxStats => ({
      playerId: stat.player_id,
      name: stat.bears_players?.name || 'Unknown',
      position: stat.bears_players?.position || '',
      headshotUrl: stat.bears_players?.headshot_url || null,
      passingCmp: stat.pass_cmp,
      passingAtt: stat.pass_att,
      passingYds: stat.pass_yds,
      passingTd: stat.pass_td,
      passingInt: stat.pass_int,
      passingRating: null, // Calculate if needed
      rushingCar: stat.rush_att,
      rushingYds: stat.rush_yds,
      rushingTd: stat.rush_td,
      rushingLng: null, // Not in datalab schema
      receivingRec: stat.rec,
      receivingTgts: stat.rec_tgt,
      receivingYds: stat.rec_yds,
      receivingTd: stat.rec_td,
      receivingLng: null, // Not in datalab schema
      defTacklesTotal: stat.tackles,
      defTacklesSolo: null, // Not in datalab schema
      defSacks: parseFloat(stat.sacks) || null,
      defTfl: null, // Not in datalab schema
      defPassesDefended: null, // Not in datalab schema
      defInt: stat.interceptions,
      fumFum: stat.fumbles,
      fumLost: null, // Not in datalab schema
    })

    const allStats = (playerStats || [])
      .filter(s => s.bears_players) // Only include stats with valid player data
      .map(transformPlayerStats)

    // Categorize players by stats they have
    // Use >= 0 to include players with 0 attempts/carries if they have other stats
    const passing = allStats
      .filter(s => (s.passingAtt ?? 0) > 0 || (s.passingYds ?? 0) > 0)
      .sort((a, b) => (b.passingYds || 0) - (a.passingYds || 0))

    const rushing = allStats
      .filter(s => (s.rushingCar ?? 0) > 0 || (s.rushingYds ?? 0) > 0)
      .sort((a, b) => (b.rushingYds || 0) - (a.rushingYds || 0))

    const receiving = allStats
      .filter(s => (s.receivingRec ?? 0) > 0 || (s.receivingYds ?? 0) > 0)
      .sort((a, b) => (b.receivingYds || 0) - (a.receivingYds || 0))

    const defense = allStats
      .filter(s => (s.defTacklesTotal ?? 0) > 0 || (s.defSacks ?? 0) > 0 || (s.defInt ?? 0) > 0)
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
