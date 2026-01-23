'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

// Polling interval: 10 seconds
const POLL_INTERVAL = 10000

// Team configuration
const TEAM_CONFIG: Record<string, { slug: string; name: string; abbr: string }> = {
  bears: { slug: 'chicago-bears', name: 'Bears', abbr: 'CHI' },
  bulls: { slug: 'chicago-bulls', name: 'Bulls', abbr: 'CHI' },
  cubs: { slug: 'chicago-cubs', name: 'Cubs', abbr: 'CHC' },
  whitesox: { slug: 'chicago-white-sox', name: 'White Sox', abbr: 'CWS' },
  blackhawks: { slug: 'chicago-blackhawks', name: 'Blackhawks', abbr: 'CHI' },
}

interface LiveGameData {
  game_id: string
  sport: 'nfl' | 'nba' | 'nhl' | 'mlb'
  status: string
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
  chicago_team: string
  is_chicago_home: boolean
}

interface LiveGamesResponse {
  games: LiveGameData[]
  count: number
  cache_age_seconds: number
  is_stale: boolean
}

interface LiveGamesTopBarProps {
  /** Filter to only show games for a specific team */
  teamFilter?: string
  /** Whether this is on the homepage (show all Chicago teams) */
  isHomepage?: boolean
}

export default function LiveGamesTopBar({ teamFilter, isHomepage = false }: LiveGamesTopBarProps) {
  const pathname = usePathname()
  const [liveGames, setLiveGames] = useState<LiveGameData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detect which team page we're on if not specified
  const detectedTeam = teamFilter || (
    pathname?.includes('bears') ? 'bears' :
    pathname?.includes('bulls') ? 'bulls' :
    pathname?.includes('cubs') ? 'cubs' :
    pathname?.includes('white-sox') || pathname?.includes('whitesox') ? 'whitesox' :
    pathname?.includes('blackhawks') || pathname?.includes('hawk') ? 'blackhawks' :
    null
  )

  // Fetch live games from /api/live-games
  const fetchLiveGames = useCallback(async () => {
    try {
      const url = detectedTeam && !isHomepage
        ? `/api/live-games?team=${detectedTeam}`
        : '/api/live-games'

      const res = await fetch(url, { cache: 'no-store' })

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }

      const data: LiveGamesResponse = await res.json()

      // Filter to only in-progress games
      const inProgress = data.games.filter(g => g.status === 'in_progress')
      setLiveGames(inProgress)
      setError(null)
    } catch (err) {
      console.error('[LiveGamesTopBar] Error fetching live games:', err)
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setIsLoading(false)
    }
  }, [detectedTeam, isHomepage])

  // Set up polling
  useEffect(() => {
    fetchLiveGames()

    const interval = setInterval(fetchLiveGames, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [fetchLiveGames])

  // Don't render anything if no live games
  if (isLoading || liveGames.length === 0) {
    return null
  }

  // Get the period/status display text
  const getStatusText = (game: LiveGameData): string => {
    if (game.period_label && game.clock) {
      return `${game.period_label} ${game.clock}`
    }
    if (game.period_label) {
      return game.period_label
    }
    return 'LIVE'
  }

  // Get score display
  const getScoreDisplay = (game: LiveGameData): { chicagoScore: number; opponentScore: number; chicagoAbbr: string; opponentAbbr: string } => {
    if (game.is_chicago_home) {
      return {
        chicagoScore: game.home_score,
        opponentScore: game.away_score,
        chicagoAbbr: game.home_team_abbr,
        opponentAbbr: game.away_team_abbr,
      }
    } else {
      return {
        chicagoScore: game.away_score,
        opponentScore: game.home_score,
        chicagoAbbr: game.away_team_abbr,
        opponentAbbr: game.home_team_abbr,
      }
    }
  }

  // Get the Chicago team's logo
  const getChicagoLogo = (game: LiveGameData): string => {
    return game.is_chicago_home ? game.home_logo_url : game.away_logo_url
  }

  // Get the opponent's logo
  const getOpponentLogo = (game: LiveGameData): string => {
    return game.is_chicago_home ? game.away_logo_url : game.home_logo_url
  }

  // Build the live game page URL
  const getLivePageUrl = (game: LiveGameData): string => {
    return `/live/${game.sport}/${game.game_id}`
  }

  return (
    <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 border-b border-red-700">
      <div className="max-w-[1200px] mx-auto">
        {/* Scrollable container for multiple games */}
        <div className="flex items-center overflow-x-auto hide-scrollbar">
          {liveGames.map((game) => {
            const score = getScoreDisplay(game)
            const teamConfig = TEAM_CONFIG[game.chicago_team]

            return (
              <Link
                key={game.game_id}
                href={getLivePageUrl(game)}
                className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 hover:bg-white/10 transition-colors min-w-fit border-r border-red-700/50 last:border-r-0"
              >
                {/* Live Badge */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-red-300">
                    LIVE
                  </span>
                </div>

                {/* Team Logos */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Chicago Logo (larger) */}
                  <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                    <Image
                      src={getChicagoLogo(game)}
                      alt={teamConfig?.name || 'Chicago'}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  {/* Opponent Logo (smaller) */}
                  <div className="relative w-4 h-4 sm:w-5 sm:h-5 opacity-80">
                    <Image
                      src={getOpponentLogo(game)}
                      alt="Opponent"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="flex items-center gap-1 text-white font-bold text-sm sm:text-base flex-shrink-0">
                  <span className={score.chicagoScore > score.opponentScore ? 'text-green-400' : ''}>
                    {score.chicagoAbbr} {score.chicagoScore}
                  </span>
                  <span className="text-white/50">–</span>
                  <span className={score.opponentScore > score.chicagoScore ? 'text-red-300' : ''}>
                    {score.opponentScore} {score.opponentAbbr}
                  </span>
                </div>

                {/* Period/Clock */}
                <div className="text-white/60 text-xs sm:text-sm flex-shrink-0">
                  {getStatusText(game)}
                </div>

                {/* Arrow indicator */}
                <svg className="w-3 h-3 text-white/40 flex-shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
