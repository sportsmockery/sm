'use client'

import type { GameData, Play } from './hooks/useLiveGameData'

interface SituationIndicatorProps {
  game: GameData
}

export default function SituationIndicator({ game }: SituationIndicatorProps) {
  const latestPlay = game.play_by_play.length > 0
    ? [...game.play_by_play].sort((a, b) => b.sequence - a.sequence)[0]
    : null

  if (!latestPlay || game.status !== 'in_progress') return null

  if (game.sport === 'nfl') {
    return <NFLSituation play={latestPlay} game={game} />
  }
  if (game.sport === 'mlb') {
    return <MLBSituation play={latestPlay} />
  }

  // NBA/NHL: minimal situation display
  return null
}

function NFLSituation({ play, game }: { play: Play & { down?: number; distance?: number; yard_line?: number; possession?: string }; game: GameData }) {
  if (!play.down) return null

  return (
    <div style={{ backgroundColor: 'var(--sm-card)', borderBottom: '1px solid var(--sm-border)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-center gap-4 text-sm">
        <span className="font-bold" style={{ color: 'var(--sm-text)' }}>
          {play.down && `${play.down}${['st', 'nd', 'rd', 'th'][Math.min(play.down - 1, 3)]} & ${play.distance || '?'}`}
        </span>
        {play.yard_line != null && (
          <span style={{ color: 'var(--sm-text-muted)' }}>at {play.yard_line} yd line</span>
        )}
        {play.possession && (
          <span style={{ color: 'var(--sm-text-muted)' }}>
            Poss: {play.possession === game.home_team.team_id ? game.home_team.abbr : game.away_team.abbr}
          </span>
        )}
        {game.home_team.timeouts != null && (
          <span style={{ color: 'var(--sm-text-muted)' }}>
            TO: {game.away_team.abbr} {game.away_team.timeouts} | {game.home_team.abbr} {game.home_team.timeouts}
          </span>
        )}
      </div>
    </div>
  )
}

function MLBSituation({ play }: { play: Play }) {
  // MLB situation from play context - diamond graphic
  return (
    <div style={{ backgroundColor: 'var(--sm-card)', borderBottom: '1px solid var(--sm-border)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-2 flex items-center justify-center gap-4 text-sm">
        <span style={{ color: 'var(--sm-text-muted)' }}>{play.period_label} {play.game_clock}</span>
      </div>
    </div>
  )
}
