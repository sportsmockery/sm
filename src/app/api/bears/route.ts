import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// GET /api/bears - Bears Data API Index
// Returns available endpoints and basic team info

export async function GET(request: NextRequest) {
  const baseUrl = request.nextUrl.origin

  const isConnected = !!datalabAdmin

  return NextResponse.json({
    team: 'Chicago Bears',
    slug: 'chicago-bears',
    api: {
      version: '1.0',
      source: 'datalab.sportsmockery.com',
      connected: isConnected,
    },
    endpoints: {
      games: {
        url: `${baseUrl}/api/bears/games`,
        description: 'Game scores and results',
        params: ['season', 'week', 'game_type', 'limit', 'offset', 'order'],
        example: `${baseUrl}/api/bears/games?season=2024&limit=10`,
      },
      roster: {
        url: `${baseUrl}/api/bears/roster`,
        description: 'Current player roster',
        params: ['position', 'position_group', 'status', 'search', 'limit'],
        example: `${baseUrl}/api/bears/roster?position=QB`,
      },
      schedule: {
        url: `${baseUrl}/api/bears/schedule`,
        description: 'Season schedule with results',
        params: ['season', 'upcoming', 'past', 'limit'],
        example: `${baseUrl}/api/bears/schedule?season=2024&upcoming=true`,
      },
      stats: {
        url: `${baseUrl}/api/bears/stats`,
        description: 'Player and team statistics',
        params: ['type', 'season', 'player_id', 'game_id', 'category', 'limit'],
        examples: [
          `${baseUrl}/api/bears/stats?type=team&season=2024`,
          `${baseUrl}/api/bears/stats?type=player&season=2024&category=passing`,
          `${baseUrl}/api/bears/stats?type=game&player_id=12345`,
        ],
      },
    },
    tables: [
      'bears_games_master',
      'bears_players',
      'bears_player_game_stats',
      'bears_player_season_stats',
      'bears_team_season_stats',
    ],
    documentation: 'https://datalab.sportsmockery.com/docs',
  })
}
