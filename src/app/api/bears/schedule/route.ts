import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// GET /api/bears/schedule - Fetch Bears schedule (past and upcoming games)
// Query params:
//   season: Season year (defaults to current season)
//   upcoming: 'true' to get only upcoming games
//   past: 'true' to get only past games
//   limit: Number of results (default 20, max 50)

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
    const upcoming = searchParams.get('upcoming') === 'true'
    const past = searchParams.get('past') === 'true'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Default to current/most recent season
    const currentYear = new Date().getFullYear()
    // NFL season spans two years, use the "start year" convention
    const currentMonth = new Date().getMonth()
    const defaultSeason = currentMonth >= 8 ? currentYear : currentYear - 1
    const targetSeason = season ? parseInt(season) : defaultSeason

    const today = new Date().toISOString().split('T')[0]

    let query = datalabAdmin
      .from('bears_games_master')
      .select('*')
      .eq('season', targetSeason)
      .order('game_date', { ascending: true })
      .limit(limit)

    if (upcoming) {
      query = query.gte('game_date', today)
    } else if (past) {
      query = query.lt('game_date', today)
    }

    const { data, error } = await query

    if (error) {
      console.error('Bears schedule fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch schedule' },
        { status: 500 }
      )
    }

    // Format schedule with additional context
    const schedule = (data || []).map((game: any) => {
      const gameDate = new Date(game.game_date)

      // Determine if game is actually completed vs scheduled
      // A game is completed if:
      // 1. Date is before today, OR
      // 2. Date is today AND the game has a non-zero score
      // A 0-0 score with today's date means the game hasn't started yet
      const isToday = game.game_date === today
      const hasScore = game.bears_score > 0 || game.opponent_score > 0
      const isCompleted = (game.game_date < today) || (isToday && hasScore)
      const isPast = isCompleted
      const isUpcoming = !isCompleted

      return {
        gameId: game.game_id || game.external_id,
        date: game.game_date,
        time: game.game_time,
        dayOfWeek: gameDate.toLocaleDateString('en-US', { weekday: 'long' }),
        formattedDate: gameDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        season: game.season,
        week: game.week,
        gameType: game.game_type,
        opponent: {
          name: game.opponent,
          isHome: game.is_bears_home,
          location: game.is_bears_home ? 'vs' : '@',
        },
        venue: {
          stadium: game.stadium,
          roof: game.roof,
          isIndoor: ['DOME', 'CLOSED', 'RETRACTABLE'].includes(game.roof),
        },
        // Only show result if game is completed AND has a real score
        result: isCompleted && hasScore ? {
          bearsScore: game.bears_score,
          opponentScore: game.opponent_score,
          outcome: game.bears_win ? 'W' : 'L',
          final: `${game.bears_win ? 'W' : 'L'} ${game.bears_score}-${game.opponent_score}`,
        } : null,
        weather: game.temp_f !== null ? {
          tempF: game.temp_f,
          windMph: game.wind_mph,
        } : null,
        isPlayoff: game.is_playoff,
        isPast,
        isUpcoming,
        isToday,
      }
    })

    // Calculate season record
    const completedGames = schedule.filter((g: any) => g.result !== null)
    const wins = completedGames.filter((g: any) => g.result?.outcome === 'W').length
    const losses = completedGames.filter((g: any) => g.result?.outcome === 'L').length

    // Find next game
    const nextGame = schedule.find((g: any) => g.isUpcoming) || null

    // Find last game
    const pastGames = schedule.filter((g: any) => g.isPast)
    const lastGame = pastGames.length > 0 ? pastGames[pastGames.length - 1] : null

    return NextResponse.json({
      schedule,
      season: targetSeason,
      record: {
        wins,
        losses,
        formatted: `${wins}-${losses}`,
      },
      nextGame,
      lastGame,
      meta: {
        total: schedule.length,
        upcoming: schedule.filter((g: any) => g.isUpcoming).length,
        completed: completedGames.length,
      },
    })
  } catch (error) {
    console.error('Bears schedule API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
