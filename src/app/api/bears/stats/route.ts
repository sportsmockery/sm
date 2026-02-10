import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// GET /api/bears/stats - Fetch Bears player and team statistics
// Query params:
//   type: 'player' | 'team' | 'game' (default 'team')
//   season: Season year (required for season stats)
//   player_id: Player ID (for individual player stats)
//   game_id: Game ID (for single game stats)
//   category: 'passing' | 'rushing' | 'receiving' | 'all' (default 'all')
//   limit: Number of results for player stats (default 20, max 100)

export async function GET(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json(
        { error: 'Datalab database not configured' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'team'
    const season = searchParams.get('season')
    const playerId = searchParams.get('player_id')
    const gameId = searchParams.get('game_id')
    const category = searchParams.get('category') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    // Team season stats
    if (type === 'team') {
      let query = datalabAdmin
        .from('bears_team_season_stats')
        .select('*')
        .order('season', { ascending: false })
        .limit(10)

      if (season) {
        query = query.eq('season', parseInt(season))
      }

      const { data, error } = await query

      if (error) {
        console.error('Bears team stats fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch team stats' },
          { status: 500 }
        )
      }

      const teamStats = (data || []).map((stats: any) => ({
        season: stats.season,
        record: `${stats.wins}-${stats.losses}${stats.ties > 0 ? `-${stats.ties}` : ''}`,
        wins: stats.wins,
        losses: stats.losses,
        ties: stats.ties,
        pointsFor: stats.points_for,
        pointsAgainst: stats.points_against,
        pointDifferential: stats.points_for - stats.points_against,
        yardsFor: stats.yards_for,
        yardsAgainst: stats.yards_against,
        turnoversCommitted: stats.turnovers_committed,
        turnoversForced: stats.turnovers_forced,
        turnoverDifferential: stats.turnovers_forced - stats.turnovers_committed,
      }))

      return NextResponse.json({
        type: 'team',
        stats: teamStats,
        meta: { total: teamStats.length },
      })
    }

    // Player season stats
    if (type === 'player') {
      let query = datalabAdmin
        .from('bears_player_season_stats')
        .select('*')
        .order('season', { ascending: false })
        .limit(limit)

      if (season) {
        query = query.eq('season', parseInt(season))
      }

      if (playerId) {
        query = query.eq('player_id', playerId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Bears player stats fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch player stats' },
          { status: 500 }
        )
      }

      // Fetch player info separately and join in code (ESPN ID based)
      const playerIds = [...new Set((data || []).map((s: any) => s.player_id).filter(Boolean))]
      let playersMap: Record<string, any> = {}
      if (playerIds.length > 0) {
        const { data: playersData } = await datalabAdmin
          .from('bears_players')
          .select('espn_id, name, position, jersey_number, headshot_url')
          .in('espn_id', playerIds)
        if (playersData) {
          playersMap = Object.fromEntries(
            playersData.map(p => [String(p.espn_id), p])
          )
        }
      }

      const playerStats = (data || []).map((stats: any) => {
        const playerInfo = playersMap[String(stats.player_id)]
        const base = {
          playerId: stats.player_id,
          season: stats.season,
          gamesPlayed: stats.games_played,
          player: playerInfo ? {
            name: playerInfo.name,
            position: playerInfo.position,
            number: playerInfo.jersey_number,
            headshot: playerInfo.headshot_url,
          } : null,
        }

        // Include stats based on category filter
        if (category === 'all' || category === 'passing') {
          Object.assign(base, {
            passing: {
              attempts: stats.pass_att,
              completions: stats.pass_cmp,
              yards: stats.pass_yds,
              touchdowns: stats.pass_td,
              interceptions: stats.pass_int,
              completionPct: stats.pass_att > 0
                ? ((stats.pass_cmp / stats.pass_att) * 100).toFixed(1)
                : null,
              yardsPerAttempt: stats.pass_att > 0
                ? (stats.pass_yds / stats.pass_att).toFixed(1)
                : null,
            },
          })
        }

        if (category === 'all' || category === 'rushing') {
          Object.assign(base, {
            rushing: {
              attempts: stats.rush_att,
              yards: stats.rush_yds,
              touchdowns: stats.rush_td,
              yardsPerCarry: stats.rush_att > 0
                ? (stats.rush_yds / stats.rush_att).toFixed(1)
                : null,
            },
          })
        }

        if (category === 'all' || category === 'receiving') {
          Object.assign(base, {
            receiving: {
              receptions: stats.rec,
              yards: stats.rec_yds,
              touchdowns: stats.rec_td,
              yardsPerReception: stats.rec > 0
                ? (stats.rec_yds / stats.rec).toFixed(1)
                : null,
            },
          })
        }

        return base
      })

      return NextResponse.json({
        type: 'player',
        stats: playerStats,
        meta: {
          total: playerStats.length,
          season: season ? parseInt(season) : null,
          category,
        },
      })
    }

    // Game-by-game stats
    if (type === 'game') {
      if (!gameId && !playerId) {
        return NextResponse.json(
          { error: 'game_id or player_id required for game stats' },
          { status: 400 }
        )
      }

      let query = datalabAdmin
        .from('bears_player_game_stats')
        .select('*')
        .order('game_date', { ascending: false })
        .limit(limit)

      if (gameId) {
        query = query.eq('bears_game_id', gameId)
      }

      if (playerId) {
        query = query.eq('player_id', playerId)
      }

      if (season) {
        query = query.eq('season', parseInt(season))
      }

      const { data, error } = await query

      if (error) {
        console.error('Bears game stats fetch error:', error)
        return NextResponse.json(
          { error: 'Failed to fetch game stats' },
          { status: 500 }
        )
      }

      // Fetch player info separately and join in code (ESPN ID based)
      const gamePlayerIds = [...new Set((data || []).map((s: any) => s.player_id).filter(Boolean))]
      let gamePMap: Record<string, any> = {}
      if (gamePlayerIds.length > 0) {
        const { data: pData } = await datalabAdmin
          .from('bears_players')
          .select('espn_id, name, position, jersey_number')
          .in('espn_id', gamePlayerIds)
        if (pData) {
          gamePMap = Object.fromEntries(pData.map(p => [String(p.espn_id), p]))
        }
      }

      // Fetch game info separately
      const gameIds = [...new Set((data || []).map((s: any) => s.bears_game_id).filter(Boolean))]
      let gamesMap: Record<string, any> = {}
      if (gameIds.length > 0) {
        const { data: gData } = await datalabAdmin
          .from('bears_games_master')
          .select('id, game_date, opponent, is_bears_home, season, week')
          .in('id', gameIds)
        if (gData) {
          gamesMap = Object.fromEntries(gData.map(g => [String(g.id), g]))
        }
      }

      const gameStats = (data || []).map((stats: any) => {
        const playerInfo = gamePMap[String(stats.player_id)]
        const gameInfo = gamesMap[String(stats.bears_game_id)]
        return {
          gameId: stats.bears_game_id,
          playerId: stats.player_id,
          player: playerInfo ? {
            name: playerInfo.name,
            position: playerInfo.position,
            number: playerInfo.jersey_number,
          } : null,
          game: gameInfo ? {
            date: gameInfo.game_date,
            opponent: gameInfo.opponent,
            isHome: gameInfo.is_bears_home,
            season: gameInfo.season,
            week: gameInfo.week,
          } : (stats.game_date ? {
            date: stats.game_date,
            opponent: stats.opponent,
            isHome: stats.is_home,
            season: stats.season,
            week: null,
          } : null),
          passing: {
            attempts: stats.passing_attempts ?? stats.passing_att,
            completions: stats.passing_completions ?? stats.passing_cmp,
            yards: stats.passing_yards ?? stats.passing_yds,
            touchdowns: stats.passing_touchdowns ?? stats.passing_td,
            interceptions: stats.passing_interceptions ?? stats.passing_int,
            sacks: stats.defensive_sacks ?? stats.def_sacks,
          },
          rushing: {
            attempts: stats.rushing_carries ?? stats.rushing_car,
            yards: stats.rushing_yards ?? stats.rushing_yds,
            touchdowns: stats.rushing_touchdowns ?? stats.rushing_td,
          },
          receiving: {
            targets: stats.receiving_targets ?? stats.receiving_tgts,
            receptions: stats.receiving_receptions ?? stats.receiving_rec,
            yards: stats.receiving_yards ?? stats.receiving_yds,
            touchdowns: stats.receiving_touchdowns ?? stats.receiving_td,
          },
          fumbles: stats.fum_fum,
        }
      })

      return NextResponse.json({
        type: 'game',
        stats: gameStats,
        meta: { total: gameStats.length },
      })
    }

    return NextResponse.json(
      { error: 'Invalid type parameter. Use: team, player, or game' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Bears stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
