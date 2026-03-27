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
    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm mb-2">
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Win Probability</span>
          <div className="flex items-center gap-4">
            <span className="font-medium" style={{ color: '#FAFAFB' }}>
              {game.away_team.abbr}: {game.odds.win_probability_away != null ? `${(game.odds.win_probability_away * 100).toFixed(0)}%` : '-'}
            </span>
            <span className="font-medium" style={{ color: '#FAFAFB' }}>
              {game.home_team.abbr}: {game.odds.win_probability_home != null ? `${(game.odds.win_probability_home * 100).toFixed(0)}%` : '-'}
            </span>
          </div>
        </div>
        <div className="flex h-3 rounded overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
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
