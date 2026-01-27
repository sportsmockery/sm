import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const revalidate = 300

interface PlayerBoxStats {
  name: string
  position: string
  headshotUrl: string | null
  minutes: string | null
  points: number | null
  rebounds: number | null
  assists: number | null
  steals: number | null
  blocks: number | null
  turnovers: number | null
  fgm: number | null
  fga: number | null
  tpm: number | null
  tpa: number | null
  ftm: number | null
  fta: number | null
}

function categorizeNBAStats(stats: PlayerBoxStats[]) {
  return stats
    .filter(s => s.minutes !== null && s.minutes !== '0' && s.minutes !== '0:00')
    .sort((a, b) => (b.points || 0) - (a.points || 0))
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
      .from('bulls_games_master')
      .select(`id, game_date, season, opponent, opponent_full_name,
        is_bulls_home, arena, bulls_score, opponent_score, bulls_win, broadcast`)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Fetch Bulls and opponent stats in parallel
    // Bulls stats use game_date + opponent to match (no direct FK to games_master.id)
    const gameDate = gameData.game_date
    const opponent = gameData.opponent

    const [bullsStatsResult, oppStatsResult] = await Promise.all([
      datalabAdmin
        .from('bulls_player_game_stats')
        .select(`player_id, minutes_played, points, total_rebounds, assists, steals, blocks, turnovers,
          field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted,
          free_throws_made, free_throws_attempted, is_opponent,
          bulls_players!inner(name, position, headshot_url)`)
        .eq('game_date', gameDate)
        .eq('opponent', opponent)
        .eq('is_opponent', false),
      datalabAdmin
        .from('bulls_player_game_stats')
        .select(`player_id, minutes_played, points, total_rebounds, assists, steals, blocks, turnovers,
          field_goals_made, field_goals_attempted, three_pointers_made, three_pointers_attempted,
          free_throws_made, free_throws_attempted, is_opponent,
          opponent_player_name, opponent_player_position, opponent_player_headshot_url`)
        .eq('game_date', gameDate)
        .eq('opponent', opponent)
        .eq('is_opponent', true),
    ])

    const transformStat = (stat: any, isOpponent: boolean): PlayerBoxStats => ({
      name: isOpponent ? (stat.opponent_player_name || 'Unknown') : (stat.bulls_players?.name || 'Unknown'),
      position: isOpponent ? (stat.opponent_player_position || '') : (stat.bulls_players?.position || ''),
      headshotUrl: isOpponent ? (stat.opponent_player_headshot_url || null) : (stat.bulls_players?.headshot_url || null),
      minutes: stat.minutes_played,
      points: stat.points,
      rebounds: stat.total_rebounds,
      assists: stat.assists,
      steals: stat.steals,
      blocks: stat.blocks,
      turnovers: stat.turnovers,
      fgm: stat.field_goals_made,
      fga: stat.field_goals_attempted,
      tpm: stat.three_pointers_made,
      tpa: stat.three_pointers_attempted,
      ftm: stat.free_throws_made,
      fta: stat.free_throws_attempted,
    })

    const bullsPlayers = (bullsStatsResult.data || []).map(s => transformStat(s, false))
    const oppPlayers = (oppStatsResult.data || []).map(s => transformStat(s, true))

    return NextResponse.json({
      gameId: String(gameData.id),
      date: gameData.game_date,
      venue: gameData.arena,
      bulls: {
        score: gameData.bulls_score || 0,
        result: gameData.bulls_win !== null ? (gameData.bulls_win ? 'W' : 'L') : null,
        isHome: gameData.is_bulls_home,
        players: categorizeNBAStats(bullsPlayers),
      },
      opponent: {
        abbrev: gameData.opponent,
        fullName: gameData.opponent_full_name || gameData.opponent,
        score: gameData.opponent_score || 0,
        logo: `https://a.espncdn.com/i/teamlogos/nba/500/${gameData.opponent.toLowerCase()}.png`,
        players: categorizeNBAStats(oppPlayers),
      },
    })
  } catch (error) {
    console.error('Bulls box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
