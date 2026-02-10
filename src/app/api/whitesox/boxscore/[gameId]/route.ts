import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const revalidate = 300

const BATTING_COLS = `at_bats, runs, hits, doubles, triples, home_runs, rbi, walks, strikeouts, stolen_bases`
const PITCHING_COLS = `innings_pitched, hits_allowed, runs_allowed, earned_runs, walks_allowed, strikeouts_pitched, win, loss, save`

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params
    if (!datalabAdmin) return NextResponse.json({ error: 'Datalab not configured' }, { status: 500 })

    const { data: gameData, error: gameError } = await datalabAdmin
      .from('whitesox_games_master')
      .select(`id, game_id, game_date, season, opponent, opponent_full_name,
        is_whitesox_home, venue, whitesox_score, opponent_score, whitesox_win, broadcast, game_type`)
      .eq('id', gameId)
      .single()

    if (gameError || !gameData) return NextResponse.json({ error: 'Game not found' }, { status: 404 })

    // Stats table uses game_id (ESPN game ID) for joining
    const espnGameId = gameData.game_id
    const [soxResult, oppResult] = await Promise.all([
      datalabAdmin
        .from('whitesox_player_game_stats')
        .select(`player_id, ${BATTING_COLS}, ${PITCHING_COLS}, is_opponent`)
        .eq('game_id', espnGameId)
        .eq('is_opponent', false),
      datalabAdmin
        .from('whitesox_player_game_stats')
        .select(`player_id, ${BATTING_COLS}, ${PITCHING_COLS}, is_opponent,
          opponent_player_name, opponent_player_position, opponent_player_headshot_url`)
        .eq('game_id', espnGameId)
        .eq('is_opponent', true),
    ])

    // Fetch White Sox player info separately and join in code
    const soxPlayerIds = (soxResult.data || []).map(s => s.player_id).filter(Boolean)
    let playersMap: Record<string, { name: string; position: string; headshot_url: string | null }> = {}

    if (soxPlayerIds.length > 0) {
      const { data: playersData } = await datalabAdmin
        .from('whitesox_players')
        .select('espn_id, name, position, headshot_url')
        .in('espn_id', soxPlayerIds)

      if (playersData) {
        playersMap = Object.fromEntries(
          playersData.map(p => [p.espn_id, { name: p.name, position: p.position, headshot_url: p.headshot_url }])
        )
      }
    }

    const transform = (s: any, isOpp: boolean) => {
      const playerInfo = !isOpp ? playersMap[s.player_id] : null
      return {
        name: isOpp ? (s.opponent_player_name || 'Unknown') : (playerInfo?.name || 'Unknown'),
        position: isOpp ? (s.opponent_player_position || '') : (playerInfo?.position || ''),
        headshotUrl: isOpp ? (s.opponent_player_headshot_url || null) : (playerInfo?.headshot_url || null),
      ab: s.at_bats, r: s.runs, h: s.hits, doubles: s.doubles, triples: s.triples,
      hr: s.home_runs, rbi: s.rbi, bb: s.walks, so: s.strikeouts, sb: s.stolen_bases,
      ip: s.innings_pitched, ha: s.hits_allowed, ra: s.runs_allowed, er: s.earned_runs,
      bba: s.walks_allowed, k: s.strikeouts_pitched, w: s.win, l: s.loss, sv: s.save,
      }
    }

    const splitMLB = (stats: any[]) => ({
      batters: stats.filter(s => s.ab !== null && s.ab > 0).sort((a, b) => (b.h || 0) - (a.h || 0)),
      pitchers: stats.filter(s => s.ip !== null && s.ip > 0).sort((a, b) => (b.ip || 0) - (a.ip || 0)),
    })

    const soxStats = (soxResult.data || []).map(s => transform(s, false))
    const oppStats = (oppResult.data || []).map(s => transform(s, true))

    return NextResponse.json({
      gameId: String(gameData.id),
      date: gameData.game_date,
      venue: gameData.venue,
      gameType: gameData.game_type,
      whitesox: {
        score: gameData.whitesox_score || 0,
        result: gameData.whitesox_win !== null ? (gameData.whitesox_win ? 'W' : 'L') : null,
        isHome: gameData.is_whitesox_home,
        ...splitMLB(soxStats),
      },
      opponent: {
        abbrev: gameData.opponent,
        fullName: gameData.opponent_full_name || gameData.opponent,
        score: gameData.opponent_score || 0,
        logo: `https://a.espncdn.com/i/teamlogos/mlb/500/${gameData.opponent.toLowerCase()}.png`,
        ...splitMLB(oppStats),
      },
    })
  } catch (error) {
    console.error('White Sox box score API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
