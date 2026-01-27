'use client'

import type { GameData } from './hooks/useLiveGameData'

interface WinProbabilityBarProps {
  game: GameData
}

export default function WinProbabilityBar({ game }: WinProbabilityBarProps) {
  if (game.odds.win_probability_home == null && game.odds.win_probability_away == null) {
    return null
  }

  return (
    <div className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
      <div className="max-w-[1200px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-[var(--text-muted)]">Win Probability</span>
          <div className="flex items-center gap-4">
            <span className="font-medium text-[var(--text-primary)]">
              {game.away_team.abbr}: {game.odds.win_probability_away != null ? `${(game.odds.win_probability_away * 100).toFixed(0)}%` : '-'}
            </span>
            <span className="font-medium text-[var(--text-primary)]">
              {game.home_team.abbr}: {game.odds.win_probability_home != null ? `${(game.odds.win_probability_home * 100).toFixed(0)}%` : '-'}
            </span>
          </div>
        </div>
        <div className="flex h-3 rounded overflow-hidden bg-[var(--bg-secondary)]">
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${(game.odds.win_probability_away || 0) * 100}%` }}
          />
          <div
            className="bg-[#bc0000] transition-all duration-500"
            style={{ width: `${(game.odds.win_probability_home || 0) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
