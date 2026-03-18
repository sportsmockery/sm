'use client'

import type { Team, TrendDirection, IntelligenceTier, AvailabilityTier } from './types'

interface Props {
  teams: Team[]
  selectedTeam: string | null
  onSelectTeam: (teamKey: string) => void
}

function TrendArrow({ direction, size = 10 }: { direction: TrendDirection; size?: number }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.2)'
  if (direction === 'flat') return <span style={{ color, fontSize: size }}>&middot;</span>
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      {direction === 'up' ? <path d="M5 1L9 6H1Z" fill={color} /> : <path d="M5 9L1 4H9Z" fill={color} />}
    </svg>
  )
}

function TierPill({ tier }: { tier: IntelligenceTier }) {
  const m: Record<IntelligenceTier, { label: string; color: string; bg: string }> = {
    green: { label: 'STABLE', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    yellow: { label: 'WATCH', color: '#D6B05E', bg: 'rgba(214,176,94,0.08)' },
    red: { label: 'ALERT', color: '#BC0000', bg: 'rgba(188,0,0,0.06)' },
  }
  const t = m[tier]
  return <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md" style={{ backgroundColor: t.bg, color: t.color }}>{t.label}</span>
}

function HealthBadge({ tier, label }: { tier: AvailabilityTier; label: string }) {
  const colors: Record<AvailabilityTier, string> = { healthy: '#22c55e', caution: '#D6B05E', depleted: '#BC0000', crisis: '#BC0000' }
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors[tier] }} />
      <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{label}</span>
    </div>
  )
}

function MetricBar({ value, width = 48 }: { value: number; width?: number }) {
  const color = value >= 60 ? '#00D4FF' : value >= 40 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-1.5">
      <div className="h-[5px] rounded-full" style={{ width, backgroundColor: 'rgba(11,15,20,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums w-5 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

export default function TeamStatusMatrix({ teams, selectedTeam, onSelectTeam }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left" style={{ minWidth: 960 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid rgba(11,15,20,0.06)' }}>
            {['Team', 'Record', 'L10', 'Streak', 'Phase', 'Next Game', 'Off', 'Def', 'Health', 'Momentum', 'Pressure', 'Status'].map(h => (
              <th key={h} className="py-3 px-4 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(11,15,20,0.3)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const sel = selectedTeam === team.team_key
            return (
              <tr
                key={team.team_key}
                onClick={() => onSelectTeam(team.team_key)}
                className="cursor-pointer transition-all duration-150"
                style={{
                  borderBottom: '1px solid rgba(11,15,20,0.04)',
                  backgroundColor: sel ? `${team.color_primary}06` : 'transparent',
                  borderLeft: sel ? `3px solid ${team.color_primary}` : '3px solid transparent',
                  boxShadow: sel ? `inset 4px 0 0 ${team.color_primary}` : 'none',
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.backgroundColor = 'rgba(11,15,20,0.015)' }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-[3px] flex-shrink-0" style={{ backgroundColor: team.color_primary }} />
                    <div>
                      <span className="text-[13px] font-bold block" style={{ color: '#0B0F14' }}>{team.team_name.replace('Chicago ', '')}</span>
                      <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{team.sport}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[14px] font-bold tabular-nums" style={{ color: '#0B0F14' }}>{team.record.record_display}</span>
                  <span className="text-[10px] block tabular-nums" style={{ color: 'rgba(11,15,20,0.3)' }}>{(team.record.win_pct * 100).toFixed(1)}%</span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="text-[13px] tabular-nums font-medium" style={{ color: 'rgba(11,15,20,0.65)' }}>{team.recent.last_10}</span>
                </td>
                <td className="py-3.5 px-4">
                  {team.recent.streak.count > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{
                      backgroundColor: team.recent.streak.type === 'W' ? 'rgba(0,212,255,0.08)' : 'rgba(188,0,0,0.06)',
                      color: team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000',
                    }}>{team.recent.streak.display}</span>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.2)' }}>&mdash;</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {team.status.is_live ? (
                    <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(188,0,0,0.08)', color: '#BC0000' }}>LIVE</span>
                  ) : (
                    <span className="text-[10px] font-medium" style={{
                      color: team.status.phase === 'regular_season' ? 'rgba(11,15,20,0.5)'
                        : team.status.phase === 'preseason' ? '#D6B05E'
                        : team.status.phase === 'playoffs' ? '#00D4FF'
                        : 'rgba(11,15,20,0.2)',
                    }}>{team.status.phase === 'regular_season' ? 'REG' : team.status.phase === 'preseason' ? 'PRE' : team.status.phase === 'playoffs' ? 'POST' : 'OFF'}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  {team.status.next_game ? (
                    <div className="max-w-[150px]">
                      <span className="text-[11px] font-medium block truncate" style={{ color: 'rgba(11,15,20,0.65)' }}>
                        {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                      </span>
                      <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>{team.status.next_game.datetime_display}</span>
                    </div>
                  ) : (
                    <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.15)' }}>&mdash;</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tabular-nums font-medium" style={{ color: 'rgba(11,15,20,0.65)' }}>{team.performance.offense.rank_display}</span>
                    <TrendArrow direction={team.performance.offense.trend} />
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] tabular-nums font-medium" style={{ color: 'rgba(11,15,20,0.65)' }}>{team.performance.defense.rank_display}</span>
                    <TrendArrow direction={team.performance.defense.trend} />
                  </div>
                </td>
                <td className="py-3.5 px-4"><HealthBadge tier={team.health.availability_tier} label={team.health.availability_label} /></td>
                <td className="py-3.5 px-4"><MetricBar value={team.intelligence.momentum_score} /></td>
                <td className="py-3.5 px-4"><MetricBar value={team.intelligence.pressure_index} /></td>
                <td className="py-3.5 px-4"><TierPill tier={team.intelligence.intelligence_tier} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
