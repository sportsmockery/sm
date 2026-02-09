import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const revalidate = 300

interface PlayerBoxStats {
  name: string
  position: string
  headshotUrl: string | null
  goals: number | null
  assists: number | null
  points: number | null
  plusMinus: number | null
  pim: number | null
  shots: number | null
  hits: number | null
  blockedShots: number | null
  toi: string | null
  // Goalie
  saves: number | null
  goalsAgainst: number | null
  shotsAgainst: number | null
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

    // Get game info - include external_id for stats join
    const { data: gameData, error: gameError } = await datalabAdmin
      .from('blackhawks_games_master')
      .select(`id, external_id, game_date, season, opponent, opponent_full_name,
        is_blackhawks_home, arena, blackhawks_score, opponent_score,
        blackhawks_win, overtime, shootout`)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 })
    }

    // Stats table uses external_id (ESPN game ID) as game_id
    const [hawksResult, oppResult] = await Promise.all([
      datalabAdmin
        .from('blackhawks_player_game_stats')
        .select(`player_id, goals, assists, points, plus_minus, pim, shots, hits, blocked_shots, toi,
          saves, goals_against, shots_against, is_opponent,
          blackhawks_players!inner(name, position, headshot_url)`)
        .eq('game_id', gameData.external_id)
        .eq('is_opponent', false),
      datalabAdmin
        .from('blackhawks_player_game_stats')
        .select(`player_id, goals, assists, points, plus_minus, pim, shots, hits, blocked_shots, toi,
          saves, goals_against, shots_against, is_opponent,
          opponent_player_name, opponent_player_position, opponent_player_headshot_url`)
        .eq('game_id', gameData.external_id)
        .eq('is_opponent', true),
    ])

    const transform = (s: any, isOpp: boolean): PlayerBoxStats => ({
      name: isOpp ? (s.opponent_player_name || 'Unknown') : (s.blackhawks_players?.name || 'Unknown'),
      position: isOpp ? (s.opponent_player_position || '') : (s.blackhawks_players?.position || ''),
      headshotUrl: isOpp ? (s.opponent_player_headshot_url || null) : (s.blackhawks_players?.headshot_url || null),
      goals: s.goals,
      assists: s.assists,
      points: s.points,
      plusMinus: s.plus_minus,
      pim: s.pim,
      shots: s.shots,
      hits: s.hits,
      blockedShots: s.blocked_shots,
      toi: s.toi,
      saves: s.saves,
      goalsAgainst: s.goals_against,
      shotsAgainst: s.shots_against,
    })

    const hawksStats = (hawksResult.data || []).map(s => transform(s, false))
    const oppStats = (oppResult.data || []).map(s => transform(s, true))

    const splitStats = (stats: PlayerBoxStats[]) => ({
      skaters: stats.filter(s => s.saves === null || s.saves === 0).sort((a, b) => (b.points || 0) - (a.points || 0)),
      goalies: stats.filter(s => s.saves !== null && s.saves > 0),
    })

    const isOT = gameData.overtime || gameData.shootout

    return NextResponse.json({
      gameId: String(gameData.id),
      date: gameData.game_date,
      venue: gameData.arena,
      isOT,
      isShootout: gameData.shootout,
      blackhawks: {
        score: gameData.blackhawks_score || 0,
        result: gameData.blackhawks_win !== null ? (gameData.blackhawks_win ? 'W' : (isOT ? 'OTL' : 'L')) : null,
        isHome: gameData.is_blackhawks_home,
        ...splitStats(hawksStats),
      },
      opponent: {
        abbrev: gameData.opponent,
        fullName: gameData.opponent_full_name || gameData.opponent,
        score: gameData.opponent_score || 0,
        logo: `https://a.espncdn.com/i/teamlogos/nhl/500/${gameData.opponent.toLowerCase()}.png`,
        ...splitStats(oppStats),
      },
    })
  } catch (error) {
    console.error('Blackhawks box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
