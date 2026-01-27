'use client'

import type { GameData } from './hooks/useLiveGameData'
import Linescore from './Linescore'
import { getTopPerformers } from '@/lib/live-games-utils'

interface PostGameViewProps {
  game: GameData
}

export default function PostGameView({ game }: PostGameViewProps) {
  const topPerformers = getTopPerformers(game.players, game.sport, 3)

  return (
    <div>
      {/* FINAL badge */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
        <div className="max-w-[1200px] mx-auto px-4 py-2 text-center">
          <span className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wider"
            style={{ backgroundColor: '#bc0000', color: '#ffffff' }}>
            Final
          </span>
        </div>
      </div>

      {/* Linescore */}
      <Linescore game={game} />

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="bg-[var(--bg-surface)] rounded-lg p-4">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-3">Top Performers</h3>
            <div className="space-y-2">
              {topPerformers.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)] last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${p.isHome ? 'bg-[#bc0000]' : 'bg-blue-500'}`} />
                    <span className="font-medium text-[var(--text-primary)]">{p.name}</span>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{p.stat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
