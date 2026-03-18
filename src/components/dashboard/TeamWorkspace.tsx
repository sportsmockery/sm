'use client'

import type { Team, TrendDirection, IntelligenceTier, IntelligenceDriver } from './types'

interface Props {
  team: Team
  onClose: () => void
}

// ── Utility components ───────────────────────────────────────

function TrendArrow({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.2)'
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

function ConfidenceBar({ value }: { value?: number }) {
  if (value == null) return null
  const pct = Math.min(Math.max(value, 0), 100)
  const opacity = 0.4 + (pct / 100) * 0.6  // 40%–100% opacity based on confidence
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-wider" style={{ color: 'rgba(11,15,20,0.2)' }}>Confidence</span>
      <div className="w-16 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: `rgba(0,212,255,${opacity})` }} />
      </div>
      <span className="text-[10px] tabular-nums" style={{ color: `rgba(0,212,255,${opacity})` }}>{pct}%</span>
    </div>
  )
}

function ImpactDot({ impact }: { impact: string }) {
  const color = impact === 'positive' ? '#00D4FF' : impact === 'negative' ? '#BC0000' : '#D6B05E'
  return <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: color }} />
}

function MetricGauge({ label, value }: { label: string; value: number }) {
  const color = value >= 60 ? '#00D4FF' : value >= 40 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs w-20 flex-shrink-0" style={{ color: 'rgba(11,15,20,0.35)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-medium tabular-nums w-6 text-right" style={{ color }}>{value}</span>
    </div>
  )
}

function SectionLabel({ label, color }: { label: string; color?: string }) {
  return (
    <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: color || 'rgba(11,15,20,0.25)' }}>
      {label}
    </span>
  )
}

// ── Main component ───────────────────────────────────────────

export default function TeamWorkspace({ team, onClose }: Props) {
  const ext = team.intelligence_extended
  const confidence = team.confidence

  // Confidence affects text opacity: higher = bolder, lower = softer
  const confOpacity = confidence != null ? (0.5 + (confidence / 100) * 0.5) : 0.85

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: '#fff' }}
    >
      {/* ── Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(11,15,20,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: team.color_primary }} />
          <div>
            <span className="text-sm font-bold" style={{ color: '#0B0F14' }}>{team.team_name}</span>
            <span className="text-xs ml-2" style={{ color: 'rgba(11,15,20,0.3)' }}>
              {ext?.sport_context || `${team.sport} — ${team.season}`}
            </span>
          </div>
          <TierBadge tier={team.intelligence.intelligence_tier} />
        </div>
        <div className="flex items-center gap-3">
          <ConfidenceBar value={confidence} />
          <button onClick={onClose} className="p-1 rounded" style={{ color: 'rgba(11,15,20,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* ═══════════════════════════════════════════ */}
        {/* EXECUTIVE TAKE                              */}
        {/* ═══════════════════════════════════════════ */}
        {team.executive_take ? (
          <div
            className="rounded-lg p-3 border-l-2"
            style={{
              backgroundColor: 'rgba(214,176,94,0.04)',
              borderLeftColor: '#D6B05E',
            }}
          >
            <SectionLabel label="Executive Take" color="#D6B05E" />
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#0B0F14' }}>
              {team.executive_take}
            </p>
          </div>
        ) : (
          /* Fallback: use insight.headline + summary as the exec-level read */
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14', opacity: confOpacity }}>
              {team.insight.headline}
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)', opacity: confOpacity }}>
              {team.insight.summary}
            </p>
          </div>
        )}

        {/* Compact snapshot */}
        <div className="flex flex-wrap gap-3">
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.025)' }}>
            <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>Record</span>
            <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.record.record_display}</span>
          </div>
          {team.recent.streak.count > 0 && (
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.025)' }}>
              <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>Streak</span>
              <span className="text-base font-bold" style={{
                color: team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000'
              }}>{team.recent.streak.display}</span>
            </div>
          )}
          <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.025)' }}>
            <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>L10</span>
            <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.recent.last_10}</span>
          </div>
          {team.status.next_game && (
            <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.025)' }}>
              <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>Next</span>
              <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>
                {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
              </span>
              <span className="text-[10px] block" style={{ color: '#00D4FF' }}>
                {team.status.next_game.datetime_display}
              </span>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* TREND EXPLANATION                           */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.trend_explanation && (
          <div
            className="rounded-lg p-3 border-l-2"
            style={{ backgroundColor: 'rgba(0,212,255,0.03)', borderLeftColor: '#00D4FF' }}
          >
            <SectionLabel label="Trend Explanation" color="#00D4FF" />
            <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(11,15,20,0.55)', opacity: confOpacity }}>
              {ext.trend_explanation.summary}
            </p>
            {ext.trend_explanation.reasons.length > 0 && (
              <ul className="space-y-1">
                {ext.trend_explanation.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <TrendArrow direction={ext.trend_explanation.direction} />
                    <span className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.45)' }}>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* KEY DRIVERS                                 */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.drivers && ext.drivers.length > 0 && (
          <div>
            <SectionLabel label="Key Drivers" />
            <div className="space-y-2">
              {ext.drivers
                .sort((a: { weight: number }, b: { weight: number }) => b.weight - a.weight)
                .map((d: IntelligenceDriver, i: number) => (
                <div
                  key={i}
                  className="rounded-lg p-2.5"
                  style={{ backgroundColor: 'rgba(11,15,20,0.02)' }}
                >
                  <div className="flex items-start gap-2">
                    <ImpactDot impact={d.impact} />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium" style={{ color: '#0B0F14', opacity: confOpacity }}>
                        {d.label}
                      </span>
                      <p className="text-[11px] mt-0.5" style={{ color: 'rgba(11,15,20,0.35)' }}>
                        {d.evidence}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* WHAT IT MEANS                               */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.what_it_means && (
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
            <SectionLabel
              label="What It Means"
              color={team.intelligence.intelligence_tier === 'red' ? '#BC0000'
                : team.intelligence.intelligence_tier === 'green' ? '#22c55e'
                : '#D6B05E'}
            />
            <div className="space-y-2">
              <div>
                <span className="text-[10px] uppercase" style={{ color: 'rgba(11,15,20,0.2)' }}>Near-term</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.55)', opacity: confOpacity }}>
                  {ext.what_it_means.short_term}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase" style={{ color: 'rgba(11,15,20,0.2)' }}>Longer-term</span>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.55)', opacity: confOpacity }}>
                  {ext.what_it_means.medium_term}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* STRATEGY (phase-aware)                      */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.strategy && (
          <div>
            <SectionLabel label={ext.strategy.phase_focus} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Priorities */}
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(0,212,255,0.03)' }}>
                <span className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: '#00D4FF' }}>Priorities</span>
                {ext.strategy.priorities.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1">
                    <span className="text-[10px] mt-0.5" style={{ color: '#00D4FF' }}>{i + 1}.</span>
                    <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{p}</span>
                  </div>
                ))}
              </div>
              {/* Opportunities */}
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(34,197,94,0.03)' }}>
                <span className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: '#22c55e' }}>Opportunities</span>
                {ext.strategy.opportunities.map((o, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1">
                    <span className="text-[10px] mt-0.5" style={{ color: '#22c55e' }}>&bull;</span>
                    <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{o}</span>
                  </div>
                ))}
              </div>
              {/* Risks */}
              <div className="rounded-lg p-2.5" style={{ backgroundColor: 'rgba(188,0,0,0.03)' }}>
                <span className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: '#BC0000' }}>Risks</span>
                {ext.strategy.risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 mb-1">
                    <span className="text-[10px] mt-0.5" style={{ color: '#BC0000' }}>&bull;</span>
                    <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* EVENT ANALYSIS (when present)               */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.event_analysis && (
          <div
            className="rounded-lg p-3 border-l-2"
            style={{ backgroundColor: 'rgba(188,0,0,0.03)', borderLeftColor: '#BC0000' }}
          >
            <SectionLabel label="Event Analysis" color="#BC0000" />
            <span className="text-xs font-medium block mb-1" style={{ color: '#0B0F14' }}>
              {ext.event_analysis.event}
            </span>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-[10px] uppercase" style={{ color: 'rgba(11,15,20,0.2)' }}>Before</span>
                <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.45)' }}>{ext.event_analysis.before}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase" style={{ color: 'rgba(11,15,20,0.2)' }}>After</span>
                <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.45)' }}>{ext.event_analysis.after}</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{ext.event_analysis.impact}</p>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* WATCH ITEMS                                 */}
        {/* ═══════════════════════════════════════════ */}
        {ext?.watch_items && ext.watch_items.length > 0 && (
          <div>
            <SectionLabel label="Watch Items" />
            <div className="space-y-1.5">
              {ext.watch_items.map((w, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg p-2" style={{ backgroundColor: 'rgba(11,15,20,0.02)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D6B05E" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4l3 3" />
                  </svg>
                  <div>
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{w.label}</span>
                    <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.35)' }}>{w.context}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* METRIC REFS — Proof layer                   */}
        {/* ═══════════════════════════════════════════ */}
        {team.metric_refs && team.metric_refs.length > 0 && (
          <div>
            <SectionLabel label="Supporting Metrics" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {team.metric_refs.map((ref, i) => (
                <div key={i} className="rounded-lg p-2" style={{ backgroundColor: 'rgba(11,15,20,0.02)' }}>
                  <span className="text-[10px] uppercase block" style={{ color: 'rgba(11,15,20,0.2)' }}>{ref.metric}</span>
                  <span className="text-sm font-bold" style={{ color: '#0B0F14' }}>{ref.value}</span>
                  <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.3)' }}>{ref.context}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* INTELLIGENCE GAUGES                         */}
        {/* ═══════════════════════════════════════════ */}
        <div>
          <SectionLabel label="Intelligence Metrics" />
          <div className="space-y-1.5">
            <MetricGauge label="Momentum" value={team.intelligence.momentum_score} />
            <MetricGauge label="Pressure" value={team.intelligence.pressure_index} />
            <MetricGauge label="Collapse Risk" value={team.intelligence.collapse_risk} />
            <MetricGauge label="Availability" value={team.intelligence.availability_score} />
            <MetricGauge label="Consistency" value={team.intelligence.consistency_score} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════ */}
        {/* KEY PERSONNEL                               */}
        {/* ═══════════════════════════════════════════ */}
        {(team.leaders.top_performers.length > 0 || team.leaders.struggling_players.length > 0) && (
          <div>
            <SectionLabel label="Key Personnel" />
            {team.leaders.top_performers.map((p) => (
              <div key={p.player_id} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
                  <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.25)' }}>{p.position}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: '#00D4FF' }}>{p.stat_line}</span>
                  <TrendArrow direction={p.trend} />
                </div>
              </div>
            ))}
            {team.leaders.struggling_players.map((p) => (
              <div key={p.player_id} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#BC0000' }} />
                  <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                  <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.25)' }}>{p.position}</span>
                  {p.note && <span className="text-[10px]" style={{ color: '#D6B05E' }}>({p.note})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.stat_line}</span>
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
