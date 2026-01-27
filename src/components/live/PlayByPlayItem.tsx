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
      className={`rounded-lg p-3 border border-[var(--border-color)] ${isScoring ? 'bg-[#bc0000]/5' : 'bg-[var(--bg-surface)]'}`}
      style={{ borderLeftWidth: '4px', borderLeftColor: borderColor }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm text-[var(--text-muted)] mb-1">
            {play.period_label} {play.game_clock}
          </div>
          <div className={`text-[var(--text-primary)] ${isScoring ? 'font-semibold' : ''}`}>
            {play.description}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`font-bold text-[var(--text-primary)] ${isScoring ? 'text-lg' : ''}`}>
            {play.score_away} - {play.score_home}
          </div>
        </div>
      </div>
    </div>
  )
}
