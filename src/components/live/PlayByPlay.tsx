'use client'

import type { Play } from './hooks/useLiveGameData'
import PlayByPlayItem from './PlayByPlayItem'

interface PlayByPlayProps {
  plays: Play[]
}

export default function PlayByPlay({ plays }: PlayByPlayProps) {
  if (plays.length === 0) {
    return <div className="text-center text-[var(--text-muted)] py-8">No plays available yet</div>
  }

  const sorted = [...plays].sort((a, b) => b.sequence - a.sequence)

  // Group by period for separators
  let lastPeriod: number | null = null

  return (
    <div className="space-y-2">
      {sorted.map(play => {
        const showSeparator = lastPeriod !== null && play.period !== lastPeriod
        lastPeriod = play.period

        return (
          <div key={play.play_id}>
            {showSeparator && (
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-[var(--border-color)]" />
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">{play.period_label}</span>
                <div className="flex-1 h-px bg-[var(--border-color)]" />
              </div>
            )}
            <PlayByPlayItem play={play} />
          </div>
        )
      })}
    </div>
  )
}
