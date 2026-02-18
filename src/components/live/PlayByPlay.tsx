'use client'

import type { Play } from './hooks/useLiveGameData'
import PlayByPlayItem from './PlayByPlayItem'

interface PlayByPlayProps {
  plays: Play[]
}

export default function PlayByPlay({ plays }: PlayByPlayProps) {
  if (plays.length === 0) {
    return <div className="text-center py-8" style={{ color: 'var(--sm-text-muted)' }}>No plays available yet</div>
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
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--sm-border)' }} />
                <span className="text-xs font-bold uppercase" style={{ color: 'var(--sm-text-muted)' }}>{play.period_label}</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--sm-border)' }} />
              </div>
            )}
            <PlayByPlayItem play={play} />
          </div>
        )
      })}
    </div>
  )
}
