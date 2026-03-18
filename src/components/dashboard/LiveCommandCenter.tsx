'use client'

import type { Live } from './types'

interface Props {
  live: Live
}

function EventImpactDot({ impact }: { impact: string }) {
  const colors: Record<string, string> = {
    high: '#BC0000',
    medium: '#D6B05E',
    low: 'rgba(250,250,251,0.3)',
  }
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
      style={{ backgroundColor: colors[impact] || colors.low }}
    />
  )
}

export default function LiveCommandCenter({ live }: Props) {
  if (!live.is_active || live.games.length === 0) return null

  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: 'rgba(188,0,0,0.04)',
        borderColor: 'rgba(188,0,0,0.15)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ backgroundColor: '#BC0000' }}
        />
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#BC0000' }}>
          Live ({live.game_count} {live.game_count === 1 ? 'Game' : 'Games'})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {live.games.map((game) => (
          <div
            key={game.game_id}
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'rgba(255,255,255,0.02)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {/* Scoreboard */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <span className="text-sm font-medium" style={{ color: '#FAFAFB' }}>
                  {game.team_name}
                </span>
                <span className="text-2xl font-bold ml-3 tabular-nums" style={{ color: '#FAFAFB' }}>
                  {game.score.team}
                </span>
              </div>
              <div className="flex flex-col items-center px-3">
                <span className="text-xs font-medium" style={{ color: '#BC0000' }}>
                  {game.state.segment_label}
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: '#FAFAFB' }}>
                  {game.state.time_remaining}
                </span>
              </div>
              <div className="flex-1 text-right">
                <span className="text-2xl font-bold mr-3 tabular-nums" style={{ color: 'rgba(250,250,251,0.6)' }}>
                  {game.score.opponent}
                </span>
                <span className="text-sm font-medium" style={{ color: 'rgba(250,250,251,0.6)' }}>
                  {game.opponent}
                </span>
              </div>
            </div>

            {/* Momentum */}
            <div
              className="rounded-lg px-3 py-2 mb-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'rgba(250,250,251,0.5)' }}>Momentum</span>
                <span className="text-xs font-medium" style={{ color: '#00D4FF' }}>
                  {game.momentum.swing_event}
                </span>
              </div>
              <div className="h-1 rounded-full mt-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${game.momentum.score}%`,
                    backgroundColor: game.momentum.direction === 'team' ? '#00D4FF'
                      : game.momentum.direction === 'opponent' ? '#BC0000'
                      : '#D6B05E',
                  }}
                />
              </div>
            </div>

            {/* Top Performers + Events */}
            <div className="grid grid-cols-2 gap-3">
              {/* Performers */}
              <div>
                <span className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(250,250,251,0.35)' }}>
                  Top Performers
                </span>
                {game.top_performers.map((p) => (
                  <div key={p.player_id} className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium" style={{ color: '#FAFAFB' }}>{p.name}</span>
                    <span className="text-xs" style={{ color: '#00D4FF' }}>{p.stat_line}</span>
                  </div>
                ))}
              </div>

              {/* Key Events */}
              <div>
                <span className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(250,250,251,0.35)' }}>
                  Key Events
                </span>
                {game.key_events.slice(0, 4).map((evt) => (
                  <div key={evt.event_id} className="flex items-start gap-1.5 mb-1">
                    <EventImpactDot impact={evt.impact} />
                    <span className="text-xs leading-tight" style={{ color: 'rgba(250,250,251,0.6)' }}>
                      <span style={{ color: 'rgba(250,250,251,0.35)' }}>{evt.time}</span>{' '}
                      {evt.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
