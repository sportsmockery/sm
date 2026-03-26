'use client'

import type { Play } from './hooks/useLiveGameData'
import { classifyPlay, getPlayBorderColor } from '@/lib/live-games-utils'

interface PlayByPlayItemProps {
  play: Play
  dark?: boolean
}

export default function PlayByPlayItem({ play, dark }: PlayByPlayItemProps) {
  const playType = classifyPlay(play.play_type, play.description)
  const borderColor = getPlayBorderColor(playType)
  const isScoring = playType === 'scoring'

  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{
        border: dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--sm-border)',
        backgroundColor: isScoring
          ? (dark ? 'rgba(188, 0, 0, 0.15)' : 'rgba(188, 0, 0, 0.05)')
          : (dark ? 'rgba(255,255,255,0.03)' : 'var(--sm-card)'),
      }}
    >
      <div style={{ width: 4, flexShrink: 0, background: borderColor }} />
      <div className="flex-1 p-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm mb-1" style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--sm-text-muted)' }}>
              {play.period_label} {play.game_clock}
            </div>
            <div className={isScoring ? 'font-semibold' : ''} style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>
              {play.description}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className={`font-bold ${isScoring ? 'text-lg' : ''}`} style={{ color: dark ? '#FAFAFB' : 'var(--sm-text)' }}>
              {play.score_away} - {play.score_home}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
