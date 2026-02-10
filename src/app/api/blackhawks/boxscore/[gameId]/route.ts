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
        blackhawks_win, is_overtime`)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) {
      // Debug: try to find any game to see what IDs look like
      const { data: sampleGame } = await datalabAdmin
        .from('blackhawks_games_master')
        .select('id, external_id, game_date, opponent')
        .limit(1)
      return NextResponse.json({
        error: 'Game not found',
        _debug: {
          requestedGameId: gameId,
          gameIdType: typeof gameId,
          queryError: gameError?.message,
          sampleGame: sampleGame?.[0],
        }
      }, { status: 404 })
    }

    // First, check what columns exist in the stats table
    const { data: sampleStat } = await datalabAdmin
      .from('blackhawks_player_game_stats')
      .select('*')
      .limit(1)
    const availableColumns = Object.keys(sampleStat?.[0] || {})

    // Stats table uses external_id (ESPN game ID) as game_id
    // Only select columns that exist
    const [hawksResult, oppResult] = await Promise.all([
      datalabAdmin
        .from('blackhawks_player_game_stats')
        .select('*')
        .eq('game_id', gameData.external_id)
        .eq('is_opponent', false),
      datalabAdmin
        .from('blackhawks_player_game_stats')
        .select('*')
        .eq('game_id', gameData.external_id)
        .eq('is_opponent', true),
    ])

    // Fetch Blackhawks player info separately and join in code
    const hawksPlayerIds = (hawksResult.data || []).map(s => s.player_id).filter(Boolean)
    let playersMap: Record<string, { name: string; position: string; headshot_url: string | null }> = {}

    if (hawksPlayerIds.length > 0) {
      const { data: playersData } = await datalabAdmin
        .from('blackhawks_players')
        .select('espn_id, name, position, headshot_url')
        .in('espn_id', hawksPlayerIds)

      if (playersData) {
        playersMap = Object.fromEntries(
          playersData.map(p => [p.espn_id, { name: p.name, position: p.position, headshot_url: p.headshot_url }])
        )
      }
    }

    const transform = (s: any, isOpp: boolean): PlayerBoxStats => {
      const playerInfo = !isOpp ? playersMap[s.player_id] : null
      return {
        name: isOpp ? (s.opponent_player_name || 'Unknown') : (playerInfo?.name || 'Unknown'),
        position: isOpp ? (s.opponent_player_position || '') : (playerInfo?.position || ''),
        headshotUrl: isOpp ? (s.opponent_player_headshot_url || null) : (playerInfo?.headshot_url || null),
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
      }
    }

    const hawksStats = (hawksResult.data || []).map(s => transform(s, false))
    const oppStats = (oppResult.data || []).map(s => transform(s, true))

    const splitStats = (stats: PlayerBoxStats[]) => ({
      skaters: stats.filter(s => s.saves === null || s.saves === 0).sort((a, b) => (b.points || 0) - (a.points || 0)),
      goalies: stats.filter(s => s.saves !== null && s.saves > 0),
    })

    const isOT = gameData.is_overtime

    return NextResponse.json({
      gameId: String(gameData.id),
      date: gameData.game_date,
      venue: gameData.arena,
      isOT,
      isShootout: false,  // Not tracked in DB
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
      _debug: {
        externalId: gameData.external_id,
        availableColumns,
        hawksStatsCount: hawksResult.data?.length || 0,
        oppStatsCount: oppResult.data?.length || 0,
        sampleStat: hawksResult.data?.[0],
        hawksPlayerIds: hawksPlayerIds.slice(0, 5),
        playersMapCount: Object.keys(playersMap).length,
        hawksError: hawksResult.error?.message,
        oppError: oppResult.error?.message,
      },
    })
  } catch (error) {
    console.error('Blackhawks box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
