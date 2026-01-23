import { NextRequest, NextResponse } from 'next/server'
import { liveGamesCache, CHICAGO_TEAM_IDS } from '@/lib/live-games-cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/live-games
 *
 * Returns all in-progress live games for Chicago teams.
 * Used by Team Top Bar and other UI components.
 *
 * Query params:
 * - team: Filter by specific team ID (e.g., 'bears', 'bulls')
 * - all: If 'true', return all games (not just in-progress)
 * - include_upcoming: If 'true', include games starting within 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team')
    const all = searchParams.get('all') === 'true'
    const includeUpcoming = searchParams.get('include_upcoming') === 'true'

    let games

    if (team) {
      // Filter by specific team
      games = includeUpcoming
        ? liveGamesCache.getTeamGamesWithUpcoming(team, 5)
        : liveGamesCache.getTeamGames(team)
    } else if (all) {
      // Return all games
      games = liveGamesCache.getAllGames()
    } else {
      // Default: return all Chicago teams' in-progress games (include upcoming by default for UI sync)
      games = includeUpcoming
        ? liveGamesCache.getChicagoGamesWithUpcoming(5)
        : liveGamesCache.getChicagoGames()
    }

    // Transform to a lighter payload for the UI
    const liveGames = games.map(game => ({
      game_id: game.game_id,
      sport: game.sport,
      status: game.status,
      game_start_time: game.game_start_time,
      home_team_id: game.home_team_id,
      away_team_id: game.away_team_id,
      home_team_name: game.home_team_name,
      away_team_name: game.away_team_name,
      home_team_abbr: game.home_team_abbr,
      away_team_abbr: game.away_team_abbr,
      home_logo_url: game.home_logo_url,
      away_logo_url: game.away_logo_url,
      home_score: game.home_score,
      away_score: game.away_score,
      period: game.period,
      period_label: game.period_label,
      clock: game.clock,
      venue_name: game.venue_name,
      broadcast_network: game.broadcast_network,
      updated_at: game.updated_at,
      // Include which Chicago team is playing
      chicago_team: CHICAGO_TEAM_IDS.includes(game.home_team_id)
        ? game.home_team_id
        : game.away_team_id,
      is_chicago_home: CHICAGO_TEAM_IDS.includes(game.home_team_id),
    }))

    return NextResponse.json({
      games: liveGames,
      count: liveGames.length,
      cache_age_seconds: liveGamesCache.getCacheAge(),
      is_stale: liveGamesCache.isStale(),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[API /api/live-games] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch live games',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
