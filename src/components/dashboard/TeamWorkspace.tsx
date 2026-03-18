'use client'

import type { Team, TrendDirection, IntelligenceTier } from './types'

interface Props {
  team: Team
  onClose: () => void
}

function TrendArrow({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.3)'
  const symbol = direction === 'up' ? '\u25b2' : direction === 'down' ? '\u25bc' : '\u25b6'
  return <span style={{ color, fontSize: 10 }}>{symbol}</span>
}

function TierBadge({ tier }: { tier: IntelligenceTier }) {
  const map: Record<IntelligenceTier, { label: string; color: string; bg: string }> = {
    green: { label: 'Stable', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    yellow: { label: 'Watch', color: '#D6B05E', bg: 'rgba(214,176,94,0.1)' },
    red: { label: 'Alert', color: '#BC0000', bg: 'rgba(188,0,0,0.1)' },
  }
  const t = map[tier]
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: t.bg, color: t.color }}>
      {t.label}
    </span>
  )
}

function MetricPill({ label, value, color }: { label: string; value: number; color?: string }) {
  const pillColor = color || (value >= 60 ? '#00D4FF' : value >= 40 ? '#D6B05E' : '#BC0000')
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{label}</span>
      <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.06)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: pillColor }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-6 text-right" style={{ color: pillColor }}>{value}</span>
    </div>
  )
}

// Build intelligence drivers from backend data — no client-side derivation of metrics,
// just structuring the existing backend fields into narrative bullet points
function buildDrivers(team: Team): string[] {
  const drivers: string[] = []

  // Performance drivers
  const offTrend = team.performance.offense.trend
  const defTrend = team.performance.defense.trend
  if (offTrend !== 'flat' || defTrend !== 'flat') {
    const offLabel = offTrend === 'up' ? 'improving' : offTrend === 'down' ? 'declining' : 'steady'
    const defLabel = defTrend === 'up' ? 'improving' : defTrend === 'down' ? 'declining' : 'steady'
    drivers.push(`Offense ${offLabel} (${team.performance.offense.rating_display}, ${team.performance.offense.rank_display}), defense ${defLabel} (${team.performance.defense.rating_display}, ${team.performance.defense.rank_display})`)
  } else {
    drivers.push(`Offense rated ${team.performance.offense.rating_display} (${team.performance.offense.rank_display}), defense at ${team.performance.defense.rating_display} (${team.performance.defense.rank_display})`)
  }

  // Health driver
  if (team.health.injuries_total > 0) {
    const parts: string[] = []
    if (team.health.key_players_out.length > 0) {
      parts.push(`${team.health.key_players_out.join(', ')} out`)
    }
    if (team.health.key_players_questionable.length > 0) {
      parts.push(`${team.health.key_players_questionable.join(', ')} questionable`)
    }
    const detail = parts.length > 0 ? ` — ${parts.join('; ')}` : ''
    drivers.push(`${team.health.injuries_total} total injuries (${team.health.availability_tier})${detail}`)
  } else {
    drivers.push('Full roster health — no significant injuries')
  }

  // Key contributors
  if (team.units.offense.key_contributors.length > 0) {
    drivers.push(`${team.units.offense.label} driven by ${team.units.offense.key_contributors.join(' and ')}`)
  }
  if (team.units.defense.key_contributors.length > 0) {
    drivers.push(`${team.units.defense.label} anchored by ${team.units.defense.key_contributors.join(' and ')}`)
  }

  // Streak context
  if (team.recent.streak.count > 0) {
    const streakWord = team.recent.streak.type === 'W' ? 'win' : 'loss'
    drivers.push(`On a ${team.recent.streak.count}-game ${streakWord} streak (last 10: ${team.recent.last_10})`)
  }

  // Consistency signal
  if (team.intelligence.consistency_score < 40) {
    drivers.push(`Low consistency (${team.intelligence.consistency_score}/100) — results are volatile and hard to predict`)
  }

  return drivers
}

// Build "what it means" outlook from backend intelligence fields
function buildOutlook(team: Team): string {
  const { momentum_score, pressure_index, collapse_risk, intelligence_tier } = team.intelligence
  const parts: string[] = []

  if (intelligence_tier === 'red') {
    parts.push('This team is in an elevated risk state.')
  } else if (intelligence_tier === 'green') {
    parts.push('This team is operating within stable parameters.')
  } else {
    parts.push('This team shows mixed signals and warrants monitoring.')
  }

  if (momentum_score >= 60) {
    parts.push(`Momentum is strong (${momentum_score}/100), suggesting positive trajectory.`)
  } else if (momentum_score <= 35) {
    parts.push(`Momentum is low (${momentum_score}/100), indicating a stalled or declining trajectory.`)
  }

  if (pressure_index >= 60) {
    parts.push(`High external pressure (${pressure_index}/100) from standings position and expectations.`)
  }

  if (collapse_risk >= 60) {
    parts.push(`Elevated collapse risk (${collapse_risk}/100) — health, schedule, or regression factors could trigger a slide.`)
  } else if (collapse_risk <= 25) {
    parts.push(`Low collapse risk (${collapse_risk}/100) — the team is structurally stable.`)
  }

  return parts.join(' ')
}

export default function TeamWorkspace({ team, onClose }: Props) {
  const drivers = buildDrivers(team)
  const outlook = buildOutlook(team)

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'rgba(11,15,20,0.02)',
        borderColor: 'rgba(11,15,20,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'rgba(11,15,20,0.08)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: team.color_primary }} />
          <div>
            <span className="text-sm font-bold" style={{ color: '#0B0F14' }}>{team.team_name}</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(11,15,20,0.4)' }}>
              {team.sport} &middot; {team.season}
            </span>
          </div>
          <TierBadge tier={team.intelligence.intelligence_tier} />
        </div>
        <button onClick={onClose} className="p-1 rounded" style={{ color: 'rgba(11,15,20,0.4)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* ============================================ */}
        {/* SECTION 1: Intelligence Headline + Snapshot  */}
        {/* ============================================ */}
        <div>
          <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14' }}>
            {team.insight.headline}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.6)' }}>
            {team.insight.summary}
          </p>
        </div>

        {/* Compact snapshot row */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
            <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Record</span>
            <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.record.record_display}</span>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
            <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Streak</span>
            <span className="text-base font-bold" style={{
              color: team.recent.streak.type === 'W' ? '#00D4FF' : team.recent.streak.count === 0 ? 'rgba(11,15,20,0.4)' : '#BC0000'
            }}>
              {team.recent.streak.display}
            </span>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
            <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>L10</span>
            <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.recent.last_10}</span>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
            <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Phase</span>
            <span className="text-base font-medium" style={{ color: 'rgba(11,15,20,0.7)' }}>
              {team.status.phase.replace('_', ' ')}
            </span>
          </div>
          {team.status.next_game && (
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
              <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Next</span>
              <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>
                {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
              </span>
              <span className="text-xs block" style={{ color: '#00D4FF' }}>
                {team.status.next_game.datetime_display}
              </span>
            </div>
          )}
        </div>

        {/* ============================================ */}
        {/* SECTION 2: WHY — Intelligence Drivers        */}
        {/* ============================================ */}
        <div
          className="rounded-lg p-3 border-l-2"
          style={{ backgroundColor: 'rgba(0,212,255,0.03)', borderLeftColor: '#00D4FF' }}
        >
          <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: '#00D4FF' }}>
            Why — Key Drivers
          </span>
          <ul className="space-y-1.5">
            {drivers.map((d, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-xs mt-0.5" style={{ color: '#00D4FF' }}>&bull;</span>
                <span className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.65)' }}>{d}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ============================================ */}
        {/* SECTION 3: WHAT IT MEANS — Outlook           */}
        {/* ============================================ */}
        <div
          className="rounded-lg p-3 border-l-2"
          style={{
            backgroundColor: team.intelligence.intelligence_tier === 'red' ? 'rgba(188,0,0,0.03)'
              : team.intelligence.intelligence_tier === 'green' ? 'rgba(34,197,94,0.03)'
              : 'rgba(214,176,94,0.03)',
            borderLeftColor: team.intelligence.intelligence_tier === 'red' ? '#BC0000'
              : team.intelligence.intelligence_tier === 'green' ? '#22c55e'
              : '#D6B05E',
          }}
        >
          <span
            className="text-xs font-bold uppercase tracking-wider block mb-2"
            style={{
              color: team.intelligence.intelligence_tier === 'red' ? '#BC0000'
                : team.intelligence.intelligence_tier === 'green' ? '#22c55e'
                : '#D6B05E',
            }}
          >
            What It Means — Outlook
          </span>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.65)' }}>
            {outlook}
          </p>
        </div>

        {/* ============================================ */}
        {/* SECTION 4: Intelligence Gauges               */}
        {/* ============================================ */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider block" style={{ color: 'rgba(11,15,20,0.35)' }}>
            Intelligence Metrics
          </span>
          <MetricPill label="Momentum" value={team.intelligence.momentum_score} />
          <MetricPill label="Pressure" value={team.intelligence.pressure_index} />
          <MetricPill label="Collapse Risk" value={team.intelligence.collapse_risk} />
          <MetricPill label="Availability" value={team.intelligence.availability_score} />
          <MetricPill label="Consistency" value={team.intelligence.consistency_score} />
        </div>

        {/* ============================================ */}
        {/* SECTION 5: Key Personnel                     */}
        {/* ============================================ */}
        {(team.leaders.top_performers.length > 0 || team.leaders.struggling_players.length > 0) && (
          <div>
            <span className="text-xs font-bold uppercase tracking-wider block mb-2" style={{ color: 'rgba(11,15,20,0.35)' }}>
              Key Personnel
            </span>
            {team.leaders.top_performers.map((p) => (
              <div
                key={p.player_id}
                className="flex items-center justify-between py-1.5 border-b"
                style={{ borderColor: 'rgba(11,15,20,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
                  <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                  <span className="text-xs" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#00D4FF' }}>{p.stat_line}</span>
                  <TrendArrow direction={p.trend} />
                </div>
              </div>
            ))}
            {team.leaders.struggling_players.map((p) => (
              <div
                key={p.player_id}
                className="flex items-center justify-between py-1.5 border-b"
                style={{ borderColor: 'rgba(11,15,20,0.05)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#BC0000' }} />
                  <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                  <span className="text-xs" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.position}</span>
                  {p.note && <span className="text-xs" style={{ color: '#D6B05E' }}>({p.note})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{p.stat_line}</span>
                  <TrendArrow direction={p.trend} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
