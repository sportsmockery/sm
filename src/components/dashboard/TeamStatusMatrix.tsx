'use client'

import type { Team, TrendDirection, IntelligenceTier, AvailabilityTier } from './types'

interface Props {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamKey: string) => void
}

function TrendArrow({ direction, size = 12 }: { direction: TrendDirection; size?: number }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(232,234,237,0.2)'
  if (direction === 'flat') return <span style={{ color, fontSize: size }}>&#8594;</span>
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      {direction === 'up' ? <path d="M6 2L10 7H2L6 2Z" fill={color} /> : <path d="M6 10L2 5H10L6 10Z" fill={color} />}
    </svg>
  )
}

function TierDot({ tier }: { tier: IntelligenceTier }) {
  const colors: Record<IntelligenceTier, string> = { green: '#22c55e', yellow: '#D6B05E', red: '#BC0000' }
  return (
    <span
      className="inline-block w-2 h-2 rounded-full"
      style={{ backgroundColor: colors[tier], boxShadow: `0 0 6px ${colors[tier]}40` }}
      title={tier}
    />
  )
}

function HealthBadge({ tier }: { tier: AvailabilityTier }) {
  const map: Record<AvailabilityTier, { icon: string }> = {
    healthy: { icon: '\u2705' }, caution: { icon: '\u26a0\ufe0f' }, depleted: { icon: '\ud83d\udea8' }, crisis: { icon: '\ud83d\udd34' },
  }
  return <span className="text-xs" title={tier}>{map[tier].icon}</span>
}

function MomentumBar({ score }: { score: number }) {
  const color = score >= 60 ? '#00D4FF' : score >= 40 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] tabular-nums font-medium" style={{ color }}>{score}</span>
    </div>
  )
}

function PhaseLabel({ phase, isLive }: { phase: string; isLive: boolean }) {
  if (isLive) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md tracking-wider" style={{ backgroundColor: 'rgba(188,0,0,0.15)', color: '#BC0000' }}>
        LIVE
      </span>
    )
  }
  const labels: Record<string, { text: string; color: string }> = {
    regular_season: { text: 'REG', color: 'rgba(232,234,237,0.45)' },
    preseason: { text: 'PRE', color: 'rgba(214,176,94,0.7)' },
    playoffs: { text: 'POST', color: '#00D4FF' },
    offseason: { text: 'OFF', color: 'rgba(232,234,237,0.2)' },
  }
  const l = labels[phase] || labels.offseason
  return <span className="text-[10px] font-medium tracking-wide" style={{ color: l.color }}>{l.text}</span>
}

function StreakBadge({ display, type }: { display: string; type: string }) {
  const color = type === 'W' ? '#00D4FF' : '#BC0000'
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: `${color}15`, color }}>
      {display}
    </span>
  )
}

export default function TeamStatusMatrix({ teams, selectedTeam, onSelectTeam }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth: 920 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {['Team', 'Record', 'L10', 'Streak', 'Phase', 'Next Game', 'Offense', 'Defense', 'Health', 'Momentum', 'Pressure', 'Tier'].map(h => (
              <th key={h} className="py-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(232,234,237,0.25)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const isSelected = selectedTeam === team.team_key
            return (
              <tr
                key={team.team_key}
                onClick={() => onSelectTeam(team.team_key)}
                className="cursor-pointer transition-all duration-200"
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderLeft: isSelected ? `3px solid ${team.color_primary}` : '3px solid transparent',
                  boxShadow: isSelected ? `inset 0 0 20px ${team.color_primary}08` : 'none',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.025)' }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: team.color_primary, boxShadow: `0 0 8px ${team.color_primary}30` }} />
                    <div>
                      <span className="text-sm font-medium block" style={{ color: '#E8EAED' }}>{team.team_name.replace('Chicago ', '')}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(232,234,237,0.3)' }}>{team.sport}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm font-bold tabular-nums" style={{ color: '#E8EAED' }}>{team.record.record_display}</span>
                  <span className="text-[10px] block tabular-nums" style={{ color: 'rgba(232,234,237,0.3)' }}>{(team.record.win_pct * 100).toFixed(1)}%</span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-sm tabular-nums" style={{ color: 'rgba(232,234,237,0.6)' }}>{team.recent.last_10}</span>
                </td>
                <td className="py-3 px-3"><StreakBadge display={team.recent.streak.display} type={team.recent.streak.type} /></td>
                <td className="py-3 px-3"><PhaseLabel phase={team.status.phase} isLive={team.status.is_live} /></td>
                <td className="py-3 px-3">
                  {team.status.next_game ? (
                    <div className="max-w-[140px]">
                      <span className="text-[11px] block truncate" style={{ color: 'rgba(232,234,237,0.6)' }}>
                        {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                      </span>
                      <span className="text-[10px] block" style={{ color: 'rgba(232,234,237,0.25)' }}>{team.status.next_game.datetime_display}</span>
                    </div>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'rgba(232,234,237,0.15)' }}>\u2014</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tabular-nums" style={{ color: 'rgba(232,234,237,0.6)' }}>{team.performance.offense.rank_display}</span>
                    <TrendArrow direction={team.performance.offense.trend} />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tabular-nums" style={{ color: 'rgba(232,234,237,0.6)' }}>{team.performance.defense.rank_display}</span>
                    <TrendArrow direction={team.performance.defense.trend} />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <HealthBadge tier={team.health.availability_tier} />
                    <span className="text-[10px]" style={{ color: 'rgba(232,234,237,0.4)' }}>{team.health.availability_label}</span>
                  </div>
                </td>
                <td className="py-3 px-3"><MomentumBar score={team.intelligence.momentum_score} /></td>
                <td className="py-3 px-3"><MomentumBar score={team.intelligence.pressure_index} /></td>
                <td className="py-3 px-3"><TierDot tier={team.intelligence.intelligence_tier} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
