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
    <div style={{ backgroundColor: 'var(--sm-card)', borderBottom: '1px solid var(--sm-border)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span style={{ color: 'var(--sm-text-muted)' }}>Win Probability</span>
          <div className="flex items-center gap-4">
            <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
              {game.away_team.abbr}: {game.odds.win_probability_away != null ? `${(game.odds.win_probability_away * 100).toFixed(0)}%` : '-'}
            </span>
            <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
              {game.home_team.abbr}: {game.odds.win_probability_home != null ? `${(game.odds.win_probability_home * 100).toFixed(0)}%` : '-'}
            </span>
          </div>
        </div>
        <div className="flex h-3 rounded overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${(game.odds.win_probability_away || 0) * 100}%` }}
          />
          <div
            className="transition-all duration-500"
            style={{ width: `${(game.odds.win_probability_home || 0) * 100}%`, backgroundColor: '#bc0000' }}
          />
        </div>
      </div>
    </div>
  )
}
