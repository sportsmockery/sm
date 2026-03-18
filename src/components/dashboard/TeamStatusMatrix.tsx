'use client'

import type { Team, TrendDirection, IntelligenceTier, AvailabilityTier } from './types'

interface Props {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamKey: string) => void
}

function TrendArrow({ direction, size = 12 }: { direction: TrendDirection; size?: number }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.3)'
  if (direction === 'flat') {
    return <span style={{ color, fontSize: size }}>&#8594;</span>
  }
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      {direction === 'up' ? (
        <path d="M6 2L10 7H2L6 2Z" fill={color} />
      ) : (
        <path d="M6 10L2 5H10L6 10Z" fill={color} />
      )}
    </svg>
  )
}

function TierDot({ tier }: { tier: IntelligenceTier }) {
  const colors: Record<IntelligenceTier, string> = {
    green: '#22c55e',
    yellow: '#D6B05E',
    red: '#BC0000',
  }
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: colors[tier] }}
      title={tier}
    />
  )
}

function HealthBadge({ tier }: { tier: AvailabilityTier }) {
  const map: Record<AvailabilityTier, { icon: string; color: string }> = {
    healthy: { icon: '\u2705', color: '#22c55e' },
    caution: { icon: '\u26a0\ufe0f', color: '#D6B05E' },
    depleted: { icon: '\ud83d\udea8', color: '#BC0000' },
    crisis: { icon: '\ud83d\udd34', color: '#BC0000' },
  }
  const { icon } = map[tier]
  return <span className="text-xs" title={tier}>{icon}</span>
}

function MomentumBar({ score }: { score: number }) {
  const color = score >= 60 ? '#00D4FF' : score >= 40 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

function PhaseLabel({ phase, isLive }: { phase: string; isLive: boolean }) {
  if (isLive) {
    return (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(188,0,0,0.2)', color: '#BC0000' }}>
        LIVE
      </span>
    )
  }
  const labels: Record<string, { text: string; color: string }> = {
    regular_season: { text: 'REG', color: 'rgba(11,15,20,0.5)' },
    preseason: { text: 'PRE', color: 'rgba(214,176,94,0.7)' },
    playoffs: { text: 'POST', color: '#00D4FF' },
    offseason: { text: 'OFF', color: 'rgba(11,15,20,0.25)' },
  }
  const l = labels[phase] || labels.offseason
  return <span className="text-xs" style={{ color: l.color }}>{l.text}</span>
}

function StreakBadge({ display, type }: { display: string; type: string }) {
  const color = type === 'W' ? '#00D4FF' : '#BC0000'
  return (
    <span
      className="text-xs font-medium px-1.5 py-0.5 rounded"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {display}
    </span>
  )
}

export default function TeamStatusMatrix({ teams, selectedTeam, onSelectTeam }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth: 900 }}>
        <thead>
          <tr
            className="text-xs uppercase tracking-wider border-b"
            style={{ color: 'rgba(11,15,20,0.35)', borderColor: 'rgba(11,15,20,0.08)' }}
          >
            <th className="py-2 px-3 font-medium">Team</th>
            <th className="py-2 px-3 font-medium">Record</th>
            <th className="py-2 px-3 font-medium">L10</th>
            <th className="py-2 px-3 font-medium">Streak</th>
            <th className="py-2 px-3 font-medium">Phase</th>
            <th className="py-2 px-3 font-medium">Next Game</th>
            <th className="py-2 px-3 font-medium">Offense</th>
            <th className="py-2 px-3 font-medium">Defense</th>
            <th className="py-2 px-3 font-medium">Health</th>
            <th className="py-2 px-3 font-medium">Momentum</th>
            <th className="py-2 px-3 font-medium">Pressure</th>
            <th className="py-2 px-3 font-medium">Tier</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const isSelected = selectedTeam === team.team_key
            return (
              <tr
                key={team.team_key}
                onClick={() => onSelectTeam(team.team_key)}
                className="cursor-pointer transition-colors border-b"
                style={{
                  borderColor: 'rgba(11,15,20,0.06)',
                  backgroundColor: isSelected ? 'rgba(0,212,255,0.06)' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${team.color_primary}` : '3px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(11,15,20,0.03)'
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                {/* Team */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: team.color_primary }}
                    />
                    <div>
                      <span className="text-sm font-medium block" style={{ color: '#0B0F14' }}>
                        {team.team_name.replace('Chicago ', '')}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(11,15,20,0.35)' }}>
                        {team.sport}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Record */}
                <td className="py-2.5 px-3">
                  <span className="text-sm font-medium tabular-nums" style={{ color: '#0B0F14' }}>
                    {team.record.record_display}
                  </span>
                  <span className="text-xs block tabular-nums" style={{ color: 'rgba(11,15,20,0.4)' }}>
                    {(team.record.win_pct * 100).toFixed(1)}%
                  </span>
                </td>

                {/* Last 10 */}
                <td className="py-2.5 px-3">
                  <span className="text-sm tabular-nums" style={{ color: 'rgba(11,15,20,0.7)' }}>
                    {team.recent.last_10}
                  </span>
                </td>

                {/* Streak */}
                <td className="py-2.5 px-3">
                  <StreakBadge display={team.recent.streak.display} type={team.recent.streak.type} />
                </td>

                {/* Phase */}
                <td className="py-2.5 px-3">
                  <PhaseLabel phase={team.status.phase} isLive={team.status.is_live} />
                </td>

                {/* Next Game */}
                <td className="py-2.5 px-3">
                  {team.status.next_game ? (
                    <div className="max-w-[140px]">
                      <span className="text-xs block truncate" style={{ color: 'rgba(11,15,20,0.7)' }}>
                        {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                      </span>
                      <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.35)' }}>
                        {team.status.next_game.datetime_display}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'rgba(11,15,20,0.25)' }}>—</span>
                  )}
                </td>

                {/* Offense */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm tabular-nums" style={{ color: 'rgba(11,15,20,0.7)' }}>
                      {team.performance.offense.rank_display}
                    </span>
                    <TrendArrow direction={team.performance.offense.trend} />
                  </div>
                </td>

                {/* Defense */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-sm tabular-nums" style={{ color: 'rgba(11,15,20,0.7)' }}>
                      {team.performance.defense.rank_display}
                    </span>
                    <TrendArrow direction={team.performance.defense.trend} />
                  </div>
                </td>

                {/* Health */}
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-1.5">
                    <HealthBadge tier={team.health.availability_tier} />
                    <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>
                      {team.health.availability_label}
                    </span>
                  </div>
                </td>

                {/* Momentum */}
                <td className="py-2.5 px-3">
                  <MomentumBar score={team.intelligence.momentum_score} />
                </td>

                {/* Pressure */}
                <td className="py-2.5 px-3">
                  <MomentumBar score={team.intelligence.pressure_index} />
                </td>

                {/* Tier */}
                <td className="py-2.5 px-3">
                  <TierDot tier={team.intelligence.intelligence_tier} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
