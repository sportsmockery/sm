'use client'

import { useLiveGameForTeam } from './hooks/useLiveGameForTeam'
import LiveGamePage from './LiveGamePage'
import LastGameBoxScore from './LastGameBoxScore'
import type { TeamInfo } from '@/components/team/TeamHubLayout'
import type { LastGameWithId } from '@/lib/team-config'

interface TeamLivePageProps {
  team: TeamInfo
  teamKey: string
  lastGame: LastGameWithId | null
}

/**
 * Shared client component for team live pages
 *
 * - If a live game is detected, shows the LiveGamePage with real-time updates
 * - If no live game, shows the last completed game's box score as fallback
 */
export default function TeamLivePage({ team, teamKey, lastGame }: TeamLivePageProps) {
  const { liveGameId, liveGame, isLoading, error } = useLiveGameForTeam(teamKey)

  // Map league to sport for LiveGamePage
  const sportMap: Record<string, string> = {
    NFL: 'nfl',
    NBA: 'nba',
    NHL: 'nhl',
    MLB: 'mlb',
  }
  const sport = sportMap[team.league] || 'nfl'

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${team.primaryColor}20` }}
          >
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: team.secondaryColor, borderTopColor: 'transparent' }}
            />
          </div>
          <div className="text-[var(--text-muted)]">Checking for live game...</div>
        </div>
      </div>
    )
  }

  // Live game found - show live game page
  if (liveGameId && liveGame) {
    return (
      <div>
        {/* Live indicator badge */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-medium text-red-500 uppercase tracking-wide">
              Live Now
            </span>
          </div>
        </div>
        <LiveGamePage sport={sport} gameId={liveGameId} />
      </div>
    )
  }

  // No live game - show last completed game
  if (lastGame) {
    return <LastGameBoxScore team={team} lastGame={lastGame} />
  }

  // No live game and no last game data
  return (
    <div className="text-center py-16">
      <div
        className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: `${team.primaryColor}10` }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: team.primaryColor }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">No Game Available</h2>
      <p className="text-[var(--text-muted)]">
        {error
          ? 'Unable to check for live games right now'
          : `Check back when the ${team.shortName} are playing`}
      </p>
    </div>
  )
}
