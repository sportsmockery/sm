// In-memory cache for live games data from Datalab
// This cache is populated by the cron job and consumed by the API routes

export interface LiveGame {
  game_id: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
  season: number
  game_date: string
  game_start_time?: string // ISO timestamp of scheduled start time
  status: 'upcoming' | 'in_progress' | 'final' | 'suspended'
  home_team_id: string
  away_team_id: string
  home_team_name: string
  away_team_name: string
  home_team_abbr: string
  away_team_abbr: string
  home_logo_url: string
  away_logo_url: string
  home_score: number
  away_score: number
  period: number | null
  period_label: string | null
  clock: string | null
  home_timeouts: number | null
  away_timeouts: number | null
  venue_name: string | null
  venue_city: string | null
  venue_state: string | null
  temperature: number | null
  weather_condition: string | null
  wind_speed: number | null
  broadcast_network: string | null
  broadcast_announcers: string | null
  live_win_probability_home: number | null
  live_win_probability_away: number | null
  live_spread_favorite_team_id: string | null
  live_spread_points: number | null
  live_moneyline_home: string | null
  live_moneyline_away: string | null
  live_over_under: number | null
  last_event_id: string | null
  raw_payload: Record<string, unknown>
  players?: LivePlayerStats[]
  play_by_play?: LivePlay[]
  team_stats?: LiveTeamStats
  linescore?: Record<string, { home: number; away: number }>
  updated_at: string
}

export interface LivePlayerStats {
  player_id: string
  game_id: string
  team_id: string
  is_home_team: boolean
  full_name: string
  jersey_number: string | null
  position: string | null
  side: string | null
  // NFL stats
  nfl_pass_attempts?: number
  nfl_pass_completions?: number
  nfl_passing_yards?: number
  nfl_passing_tds?: number
  nfl_interceptions?: number
  nfl_rush_attempts?: number
  nfl_rushing_yards?: number
  nfl_rushing_tds?: number
  nfl_targets?: number
  nfl_receptions?: number
  nfl_receiving_yards?: number
  nfl_receiving_tds?: number
  nfl_tackles?: number
  nfl_sacks?: number
  nfl_forced_fumbles?: number
  nfl_fumble_recoveries?: number
  nfl_passes_defended?: number
  nfl_qb_hits?: number
  // NBA stats
  nba_minutes?: string
  nba_points?: number
  nba_fg_made?: number
  nba_fg_att?: number
  nba_fg_pct?: number
  nba_3p_made?: number
  nba_3p_att?: number
  nba_3p_pct?: number
  nba_ft_made?: number
  nba_ft_att?: number
  nba_ft_pct?: number
  nba_reb_off?: number
  nba_reb_def?: number
  nba_reb_total?: number
  nba_assists?: number
  nba_steals?: number
  nba_blocks?: number
  nba_turnovers?: number
  nba_fouls?: number
  nba_plus_minus?: number
  // NHL stats
  nhl_toi?: string
  nhl_goals?: number
  nhl_assists?: number
  nhl_points?: number
  nhl_shots?: number
  nhl_plus_minus?: number
  nhl_pim?: number
  nhl_hits?: number
  nhl_blocks?: number
  nhl_faceoffs_won?: number
  nhl_faceoffs_total?: number
  // MLB batting stats
  mlb_ab?: number
  mlb_runs?: number
  mlb_hits?: number
  mlb_doubles?: number
  mlb_triples?: number
  mlb_home_runs?: number
  mlb_rbi?: number
  mlb_bb?: number
  mlb_so?: number
  mlb_sb?: number
  mlb_cs?: number
  mlb_avg?: number
  mlb_obp?: number
  mlb_slg?: number
  mlb_ops?: number
  // MLB pitching stats
  mlb_ip?: number
  mlb_h_allowed?: number
  mlb_r_allowed?: number
  mlb_er?: number
  mlb_bb_allowed?: number
  mlb_k?: number
  mlb_hr_allowed?: number
  mlb_era?: number
  mlb_pitches?: number
  mlb_strikes?: number
}

export interface LivePlay {
  play_id: string
  sequence: number
  game_clock: string
  period: number
  period_label: string
  description: string
  play_type: string
  team_id: string | null
  player_ids: string[]
  score_home: number
  score_away: number
  // Sport-specific
  down?: number
  distance?: number
  yard_line?: number
  possession?: string
}

export interface LiveTeamStats {
  home: Record<string, number | string>
  away: Record<string, number | string>
}

// Chicago team IDs for filtering
export const CHICAGO_TEAM_IDS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

// In-memory cache
class LiveGamesCache {
  private games: Map<string, LiveGame> = new Map()
  private lastFetchTime: number = 0
  private fetchInterval: number = 10000 // 10 seconds

  // Get all live games
  getAllGames(): LiveGame[] {
    return Array.from(this.games.values())
  }

  // Get all in-progress games
  getInProgressGames(): LiveGame[] {
    return this.getAllGames().filter(g => g.status === 'in_progress')
  }

  // Get Chicago teams' live games
  getChicagoGames(): LiveGame[] {
    return this.getInProgressGames().filter(g =>
      CHICAGO_TEAM_IDS.includes(g.home_team_id) ||
      CHICAGO_TEAM_IDS.includes(g.away_team_id)
    )
  }

  // Get upcoming Chicago games starting within the next N minutes
  getUpcomingChicagoGames(withinMinutes: number = 5): LiveGame[] {
    const now = Date.now()
    const cutoff = now + withinMinutes * 60 * 1000

    return this.getAllGames().filter(g => {
      if (g.status !== 'upcoming') return false
      if (!CHICAGO_TEAM_IDS.includes(g.home_team_id) && !CHICAGO_TEAM_IDS.includes(g.away_team_id)) return false

      // Check if game starts within the window
      if (g.game_start_time) {
        const startTime = new Date(g.game_start_time).getTime()
        return startTime <= cutoff && startTime >= now - 60000 // Include games that just started (within last minute)
      }

      return false
    })
  }

  // Get Chicago games including those starting soon (for UI indicators)
  getChicagoGamesWithUpcoming(withinMinutes: number = 5): LiveGame[] {
    const inProgress = this.getChicagoGames()
    const upcoming = this.getUpcomingChicagoGames(withinMinutes)

    // Combine and deduplicate
    const gameMap = new Map<string, LiveGame>()
    for (const game of [...inProgress, ...upcoming]) {
      gameMap.set(game.game_id, game)
    }

    return Array.from(gameMap.values())
  }

  // Get games for a specific team
  getTeamGames(teamId: string): LiveGame[] {
    return this.getInProgressGames().filter(g =>
      g.home_team_id === teamId || g.away_team_id === teamId
    )
  }

  // Get team games including upcoming (starting within N minutes)
  getTeamGamesWithUpcoming(teamId: string, withinMinutes: number = 5): LiveGame[] {
    const now = Date.now()
    const cutoff = now + withinMinutes * 60 * 1000

    return this.getAllGames().filter(g => {
      if (g.home_team_id !== teamId && g.away_team_id !== teamId) return false

      // Include in-progress games
      if (g.status === 'in_progress') return true

      // Include upcoming games starting soon
      if (g.status === 'upcoming' && g.game_start_time) {
        const startTime = new Date(g.game_start_time).getTime()
        return startTime <= cutoff && startTime >= now - 60000
      }

      return false
    })
  }

  // Get a single game by ID
  getGame(gameId: string): LiveGame | undefined {
    return this.games.get(gameId)
  }

  // Update cache with new data
  updateGames(games: LiveGame[]): void {
    const now = Date.now()

    // Clear games that are no longer in the response (finished)
    const incomingIds = new Set(games.map(g => g.game_id))
    for (const [id, game] of this.games.entries()) {
      if (!incomingIds.has(id) && game.status === 'in_progress') {
        // Mark as final if no longer in live feed
        game.status = 'final'
      }
    }

    // Update/add games
    for (const game of games) {
      game.updated_at = new Date().toISOString()
      this.games.set(game.game_id, game)
    }

    this.lastFetchTime = now
  }

  // Check if cache is stale
  isStale(): boolean {
    return Date.now() - this.lastFetchTime > this.fetchInterval * 2
  }

  // Get cache age in seconds
  getCacheAge(): number {
    return Math.floor((Date.now() - this.lastFetchTime) / 1000)
  }

  // Get last fetch time
  getLastFetchTime(): number {
    return this.lastFetchTime
  }

  // Clear all games
  clear(): void {
    this.games.clear()
    this.lastFetchTime = 0
  }
}

// Singleton instance
export const liveGamesCache = new LiveGamesCache()

// Datalab API URL - calls /live/games endpoint
const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

// Fetch live games from Datalab
export async function fetchLiveGamesFromDatalab(): Promise<LiveGame[]> {
  try {
    const response = await fetch(`${DATALAB_API_URL}/live/games`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      // If Datalab endpoint doesn't exist yet, return empty array
      if (response.status === 404) {
        console.log('[Live Games] Datalab /live/games endpoint not found, returning empty array')
        return []
      }
      throw new Error(`Datalab API error: ${response.status}`)
    }

    const data = await response.json()

    // Normalize response to LiveGame[]
    const games: LiveGame[] = Array.isArray(data) ? data : (data.games || [])

    return games
  } catch (error) {
    console.error('[Live Games] Error fetching from Datalab:', error)
    return []
  }
}

// Fetch single game with full details from Datalab
export async function fetchLiveGameFromDatalab(gameId: string): Promise<LiveGame | null> {
  try {
    const response = await fetch(`${DATALAB_API_URL}/live/games/${gameId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Datalab API error: ${response.status}`)
    }

    const game: LiveGame = await response.json()
    return game
  } catch (error) {
    console.error(`[Live Games] Error fetching game ${gameId} from Datalab:`, error)
    return null
  }
}

// Update the cache from Datalab (called by cron)
export async function refreshLiveGamesCache(): Promise<{ success: boolean; gamesCount: number; error?: string }> {
  try {
    const games = await fetchLiveGamesFromDatalab()
    liveGamesCache.updateGames(games)

    return {
      success: true,
      gamesCount: games.length,
    }
  } catch (error) {
    return {
      success: false,
      gamesCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
