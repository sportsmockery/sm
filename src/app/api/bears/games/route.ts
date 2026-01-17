import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin, BearsGame } from '@/lib/supabase-datalab'

// GET /api/bears/games - Fetch Bears game data
// Query params:
//   season: Filter by season year (e.g., 2024)
//   week: Filter by week number
//   game_type: Filter by game type (REG, POST, PRE)
//   limit: Number of results (default 20, max 100)
//   offset: Pagination offset
//   order: 'asc' or 'desc' by game_date (default desc)

export async function GET(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json(
        { error: 'Datalab database not configured' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const season = searchParams.get('season')
    const week = searchParams.get('week')
    const gameType = searchParams.get('game_type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')
    const order = searchParams.get('order') === 'asc' ? true : false

    let query = datalabAdmin
      .from('bears_games_master')
      .select('*')
      .order('game_date', { ascending: order })
      .range(offset, offset + limit - 1)

    if (season) {
      query = query.eq('season', parseInt(season))
    }

    if (week) {
      query = query.eq('week', parseInt(week))
    }

    if (gameType) {
      query = query.eq('game_type', gameType.toUpperCase())
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Bears games fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch games' },
        { status: 500 }
      )
    }

    // Transform to cleaner response format
    const games = (data || []).map((game: any) => ({
      id: game.id,
      gameId: game.game_id || game.external_id,
      date: game.game_date,
      time: game.game_time,
      season: game.season,
      week: game.week,
      gameType: game.game_type,
      opponent: game.opponent,
      isHome: game.is_bears_home,
      bearsScore: game.bears_score,
      opponentScore: game.opponent_score,
      result: game.bears_win === true ? 'W' : game.bears_win === false ? 'L' : null,
      stadium: game.stadium,
      weather: {
        roof: game.roof,
        tempF: game.temp_f,
        windMph: game.wind_mph,
      },
      isPlayoff: game.is_playoff,
      verified: game.verified,
    }))

    return NextResponse.json({
      games,
      meta: {
        total: games.length,
        limit,
        offset,
        season: season ? parseInt(season) : null,
      },
    })
  } catch (error) {
    console.error('Bears games API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
