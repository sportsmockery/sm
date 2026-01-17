import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Revalidate every hour (3600 seconds)
export const revalidate = 3600

// GET /api/bears/ticker - Lightweight endpoint for Bears sticky bar
// Returns: record, next game, last game result
// Cached for 1 hour with ISR

export async function GET() {
  try {
    if (!datalabAdmin) {
      // Return fallback data if datalab not configured
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Datalab not configured',
      })
    }

    // Get current season
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()
    // NFL season spans two years - use start year convention
    // Season starts in September (month 8), so Aug or earlier = previous season
    const season = currentMonth >= 8 ? currentYear : currentYear - 1

    const today = new Date().toISOString().split('T')[0]

    // Fetch all games for the season
    const { data: games, error } = await datalabAdmin
      .from('bears_games_master')
      .select('*')
      .eq('season', season)
      .order('game_date', { ascending: true })

    if (error) {
      console.error('Bears ticker fetch error:', error)
      return NextResponse.json({
        record: '--',
        nextGame: null,
        lastGame: null,
        error: 'Failed to fetch data',
      })
    }

    // Calculate record from completed games
    const completedGames = (games || []).filter(
      (g: any) => g.bears_score !== null && g.opponent_score !== null
    )
    const wins = completedGames.filter((g: any) => g.bears_win === true).length
    const losses = completedGames.filter((g: any) => g.bears_win === false).length
    const ties = completedGames.filter(
      (g: any) => g.bears_score === g.opponent_score
    ).length

    const record = ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`

    // Find next upcoming game
    const upcomingGames = (games || []).filter((g: any) => g.game_date >= today)
    const nextGameData = upcomingGames[0]

    let nextGame = null
    if (nextGameData) {
      const gameDate = new Date(nextGameData.game_date)
      const dayName = gameDate.toLocaleDateString('en-US', { weekday: 'short' })
      const monthDay = gameDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

      nextGame = {
        opponent: `${nextGameData.is_bears_home ? 'vs' : '@'} ${nextGameData.opponent}`,
        date: dayName,
        fullDate: monthDay,
        time: nextGameData.game_time || 'TBD',
        week: nextGameData.week,
        gameType: nextGameData.game_type,
      }
    }

    // Find last completed game
    const pastGames = (games || []).filter((g: any) => g.game_date < today && g.bears_score !== null)
    const lastGameData = pastGames[pastGames.length - 1]

    let lastGame = null
    if (lastGameData) {
      lastGame = {
        opponent: lastGameData.opponent,
        result: lastGameData.bears_win ? 'W' : 'L',
        score: `${lastGameData.bears_score}-${lastGameData.opponent_score}`,
        week: lastGameData.week,
      }
    }

    return NextResponse.json({
      record,
      season,
      nextGame,
      lastGame,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bears ticker API error:', error)
    return NextResponse.json({
      record: '--',
      nextGame: null,
      lastGame: null,
      error: 'Internal server error',
    })
  }
}
