'use client'

import type { Play } from './hooks/useLiveGameData'
import { classifyPlay, getPlayBorderColor } from '@/lib/live-games-utils'

interface PlayByPlayItemProps {
  play: Play
}

export default function PlayByPlayItem({ play }: PlayByPlayItemProps) {
  const playType = classifyPlay(play.play_type, play.description)
  const borderColor = getPlayBorderColor(playType)
  const isScoring = playType === 'scoring'

  return (
    <div
      className="rounded-lg p-3"
      style={{
        border: '1px solid var(--sm-border)',
        borderLeftWidth: '4px',
        borderLeftColor: borderColor,
        backgroundColor: isScoring ? 'rgba(188, 0, 0, 0.05)' : 'var(--sm-card)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm mb-1" style={{ color: 'var(--sm-text-muted)' }}>
            {play.period_label} {play.game_clock}
          </div>
          <div className={isScoring ? 'font-semibold' : ''} style={{ color: 'var(--sm-text)' }}>
            {play.description}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-bold ${isScoring ? 'text-lg' : ''}`} style={{ color: 'var(--sm-text)' }}>
            {play.score_away} - {play.score_home}
          </div>
        </div>
      </div>
    </div>
  )
}
