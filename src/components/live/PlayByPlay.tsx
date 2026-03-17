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

  // Group by period for separators — show header for each period change
  let lastPeriod: number | null = null

  return (
    <div className="space-y-2">
      {sorted.map((play, idx) => {
        const isNewPeriod = play.period !== lastPeriod
        lastPeriod = play.period

        return (
          <div key={play.play_id}>
            {isNewPeriod && (
              <div className="flex items-center justify-between py-3 px-2 mt-2 rounded-lg" style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--sm-text)' }}>{play.period_label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>{play.score_away} - {play.score_home}</span>
              </div>
            )}
            <PlayByPlayItem play={play} />
          </div>
        )
      })}
    </div>
  )
}
