import { NextRequest, NextResponse } from 'next/server'
import { liveGamesCache, fetchLiveGameFromDatalab, CHICAGO_TEAM_IDS } from '@/lib/live-games-cache'

export const dynamic = 'force-dynamic'

interface Params {
  gameId: string
}

/**
 * GET /api/live-games/[gameId]
 *
 * Returns full game data including player stats for a specific game.
 * Used by the live game page.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { gameId } = await params

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID is required' },
        { status: 400 }
      )
    }

    // First check the cache
    let game = liveGamesCache.getGame(gameId)

    // If not in cache or cache is stale, try fetching from Datalab
    if (!game || liveGamesCache.isStale()) {
      const freshGame = await fetchLiveGameFromDatalab(gameId)
      if (freshGame) {
        game = freshGame
        // Update the cache with this game
        liveGamesCache.updateGames([freshGame])
      }
    }

    if (!game) {
      return NextResponse.json(
        { error: 'Game not found', game_id: gameId },
        { status: 404 }
      )
    }

    // Return full game data
    const response = {
      game_id: game.game_id,
      sport: game.sport,
      season: game.season,
      game_date: game.game_date,
      status: game.status,

      // Teams
      home_team: {
        team_id: game.home_team_id,
        name: game.home_team_name,
        abbr: game.home_team_abbr,
        logo_url: game.home_logo_url,
        score: game.home_score,
        timeouts: game.home_timeouts,
        is_chicago: CHICAGO_TEAM_IDS.includes(game.home_team_id),
      },
      away_team: {
        team_id: game.away_team_id,
        name: game.away_team_name,
        abbr: game.away_team_abbr,
        logo_url: game.away_logo_url,
        score: game.away_score,
        timeouts: game.away_timeouts,
        is_chicago: CHICAGO_TEAM_IDS.includes(game.away_team_id),
      },

      // Game state
      period: game.period,
      period_label: game.period_label,
      clock: game.clock,

      // Venue
      venue: {
        name: game.venue_name,
        city: game.venue_city,
        state: game.venue_state,
      },

      // Weather (for outdoor sports)
      weather: {
        temperature: game.temperature,
        condition: game.weather_condition,
        wind_speed: game.wind_speed,
      },

      // Broadcast
      broadcast: {
        network: game.broadcast_network,
        announcers: game.broadcast_announcers,
      },

      // Odds & probability
      odds: {
        win_probability_home: game.live_win_probability_home,
        win_probability_away: game.live_win_probability_away,
        spread_favorite_team_id: game.live_spread_favorite_team_id,
        spread_points: game.live_spread_points,
        moneyline_home: game.live_moneyline_home,
        moneyline_away: game.live_moneyline_away,
        over_under: game.live_over_under,
      },

      // Player stats
      players: game.players || [],

      // Play-by-play
      play_by_play: game.play_by_play || [],

      // Team stats comparison
      team_stats: game.team_stats || null,

      // Metadata
      last_event_id: game.last_event_id,
      cache_age_seconds: liveGamesCache.getCacheAge(),
      updated_at: game.updated_at,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[API /api/live-games/[gameId]] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch game data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
