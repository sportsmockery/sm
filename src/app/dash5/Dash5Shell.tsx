'use client'

import { useState, useCallback } from 'react'
import { useDashboardData } from '@/components/dashboard/useDashboardData'
import type { Team, TrendDirection } from '@/components/dashboard/types'
import GlassCard from '@/components/dashboard-v2/GlassCard'
import FilterBar from '@/components/dashboard-v2/FilterBar'
import MiniChart, { BarChart, RingGauge } from '@/components/dashboard-v2/MiniChart'
import DrillDownDrawer from '@/components/dashboard-v2/DrillDownDrawer'

// ── Utility sub-components ──────────────────────────────────────

function TrendArrow({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.25)'
  const sym = direction === 'up' ? '\u25b2' : direction === 'down' ? '\u25bc' : '\u2022'
  return <span style={{ color, fontSize: 9 }}>{sym}</span>
}

function TierDot({ tier }: { tier: string }) {
  const c = tier === 'green' ? '#22c55e' : tier === 'red' ? '#BC0000' : '#D6B05E'
  return <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
}

function StatValue({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div>
      <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'rgba(11,15,20,0.35)' }}>
        {label}
      </span>
      <span className="text-lg font-bold" style={{ color: color || '#0B0F14' }}>{value}</span>
      {sub && <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.4)' }}>{sub}</span>}
    </div>
  )
}

// ── Synthetic sparkline data from intelligence metrics ──────────
// Creates plausible trend data from the available backend values
function synthSparkline(current: number, trend: TrendDirection): number[] {
  const pts = 7
  const arr: number[] = []
  const delta = trend === 'up' ? 3 : trend === 'down' ? -3 : 0
  for (let i = 0; i < pts; i++) {
    const base = current - delta * (pts - 1 - i)
    arr.push(Math.max(0, Math.min(100, base + (Math.sin(i * 1.3) * 4))))
  }
  return arr
}

// ── Main shell ──────────────────────────────────────────────────

export default function Dash5Shell() {
  const { data, loading, error, lastFetched, refresh } = useDashboardData()
  const [teamFilter, setTeamFilter] = useState('all')
  const [drillTeam, setDrillTeam] = useState<Team | null>(null)

  const handleTeamFilter = useCallback((key: string) => setTeamFilter(key), [])

  // Loading
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'rgba(0,212,255,0.3)', borderTopColor: 'transparent' }} />
          <span className="text-xs" style={{ color: 'rgba(11,15,20,0.4)' }}>Loading intelligence...</span>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
        <GlassCard title="Connection Error">
          <p className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{error}</p>
          <button onClick={refresh} className="mt-3 text-xs px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
            Retry
          </button>
        </GlassCard>
      </div>
    )
  }

  if (!data) return null

  const filteredTeams = teamFilter === 'all'
    ? data.teams
    : data.teams.filter(t => t.team_key === teamFilter)

  const teamFilterOptions = [
    { key: 'all', label: 'All Teams' },
    ...data.teams.map(t => ({
      key: t.team_key,
      label: t.team_name.replace('Chicago ', ''),
      color: t.color_primary,
    })),
  ]

  const moodColor = data.city.mood.score >= 60 ? '#00D4FF'
    : data.city.mood.score >= 35 ? '#D6B05E'
    : '#BC0000'

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
      {/* ═══════════════════════════════════════════════ */}
      {/* STICKY CONTROL BAR                              */}
      {/* ═══════════════════════════════════════════════ */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 lg:px-6 py-2.5 backdrop-blur-lg border-b"
        style={{
          backgroundColor: 'rgba(243,244,246,0.85)',
          borderColor: 'rgba(11,15,20,0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold tracking-wide" style={{ color: '#0B0F14' }}>
            CHICAGO SPORTS INTELLIGENCE
          </h1>
          {data.live.is_active && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: 'rgba(188,0,0,0.1)', color: '#BC0000' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#BC0000' }} />
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastFetched && (
            <span className="text-[11px] hidden sm:block" style={{ color: 'rgba(11,15,20,0.35)' }}>
              Updated {lastFetched.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
          )}
          <button
            onClick={refresh}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: '#00D4FF' }}
            title="Refresh"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={loading ? 'animate-spin' : ''}>
              <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="px-3 sm:px-4 lg:px-6 py-5 max-w-[1600px] mx-auto space-y-5">

        {/* ── CITY PULSE ROW ──────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* City Mood */}
          <div className="lg:col-span-4">
            <GlassCard>
              <div className="flex items-center gap-4">
                <RingGauge value={data.city.mood.score} label="City Mood" size={64} color={moodColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{data.city.mood.emoji}</span>
                    <span className="text-sm font-bold" style={{ color: '#0B0F14' }}>{data.city.mood.label}</span>
                    <TrendArrow direction={data.city.mood.direction} />
                  </div>
                  <p className="text-[11px] leading-relaxed mt-1" style={{ color: 'rgba(11,15,20,0.55)' }}>
                    {data.city.summary}
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* City Stats */}
          <div className="lg:col-span-4">
            <GlassCard>
              <div className="grid grid-cols-4 gap-3 text-center">
                <StatValue label="Record" value={`${data.city.record.wins}-${data.city.record.losses}`} sub={`${(data.city.record.win_pct * 100).toFixed(0)}%`} />
                <StatValue label="Active" value={data.city.teams_active} />
                <StatValue label=">.500" value={data.city.teams_above_500} />
                <StatValue
                  label="Hottest"
                  value={data.teams.find(t => t.team_key === data.city.hottest_team)?.team_name.replace('Chicago ', '') || '—'}
                  color={data.teams.find(t => t.team_key === data.city.hottest_team)?.color_primary}
                />
              </div>
            </GlassCard>
          </div>

          {/* Next Event */}
          <div className="lg:col-span-4">
            <GlassCard accent="#00D4FF">
              <div>
                <span className="text-[10px] uppercase tracking-wider block" style={{ color: 'rgba(11,15,20,0.35)' }}>
                  Next Up
                </span>
                <span className="text-sm font-bold block mt-0.5" style={{ color: '#0B0F14' }}>
                  {data.city.next_event.team_name} {data.city.next_event.home ? 'vs' : '@'} {data.city.next_event.opponent}
                </span>
                <span className="text-xs block mt-0.5" style={{ color: '#00D4FF' }}>
                  {data.city.next_event.datetime_display}
                </span>
                <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>
                  {data.city.next_event.venue}
                </span>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* ── TEAM FILTER ─────────────────────────────── */}
        <div className="flex items-center justify-between">
          <FilterBar options={teamFilterOptions} selected={teamFilter} onSelect={handleTeamFilter} />
        </div>

        {/* ── TEAM INTELLIGENCE CARDS ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTeams.map((team) => (
            <GlassCard
              key={team.team_key}
              accent={team.color_primary}
              title={team.team_name.replace('Chicago ', '')}
              subtitle={`${team.sport} — ${team.season} — ${team.status.phase.replace('_', ' ')}`}
              onDrillDown={() => setDrillTeam(team)}
              headerAction={<TierDot tier={team.intelligence.intelligence_tier} />}
            >
              {/* Insight headline */}
              <p className="text-xs font-medium mb-3" style={{ color: '#0B0F14' }}>
                {team.insight.headline}
              </p>

              {/* Record + Streak + Trend line */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold tabular-nums" style={{ color: '#0B0F14' }}>
                    {team.record.record_display}
                  </span>
                  {team.recent.streak.count > 0 && (
                    <span
                      className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: team.recent.streak.type === 'W' ? 'rgba(0,212,255,0.1)' : 'rgba(188,0,0,0.1)',
                        color: team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000',
                      }}
                    >
                      {team.recent.streak.display}
                    </span>
                  )}
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>
                    L10: {team.recent.last_10}
                  </span>
                </div>
                <MiniChart
                  data={synthSparkline(team.intelligence.momentum_score, team.recent.trend_direction)}
                  color={team.color_primary}
                  width={80}
                  height={28}
                />
              </div>

              {/* Intelligence gauges row */}
              <div className="flex items-center justify-between gap-1 mb-3">
                <RingGauge value={team.intelligence.momentum_score} label="Mom" size={44} />
                <RingGauge value={team.intelligence.pressure_index} label="Press" size={44} />
                <RingGauge value={team.intelligence.collapse_risk} label="Risk" size={44} />
                <RingGauge value={team.intelligence.availability_score} label="Avail" size={44} />
                <RingGauge value={team.intelligence.consistency_score} label="Consist" size={44} />
              </div>

              {/* Key intel summary */}
              <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.55)' }}>
                {team.insight.summary}
              </p>

              {/* Health strip */}
              {team.health.injuries_total > 0 && (
                <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid rgba(11,15,20,0.05)' }}>
                  <span className="text-[10px] uppercase font-bold" style={{
                    color: team.health.availability_tier === 'healthy' ? '#22c55e'
                      : team.health.availability_tier === 'caution' ? '#D6B05E'
                      : '#BC0000',
                  }}>
                    {team.health.availability_tier}
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.45)' }}>
                    {team.health.availability_label}
                    {team.health.key_players_out.length > 0 && ` — ${team.health.key_players_out.join(', ')}`}
                  </span>
                </div>
              )}

              {/* Next game strip */}
              {team.status.next_game && (
                <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid rgba(11,15,20,0.05)' }}>
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>
                    {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: '#00D4FF' }}>
                    {team.status.next_game.datetime_display}
                  </span>
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        {/* ── TRENDS + LEADERS ROW ────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trends */}
          <GlassCard title="Movement & Trends" subtitle="Injuries, volatility, and momentum shifts">
            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {/* Injuries first — highest signal */}
              {data.trends.injuries.map((inj, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: inj.status === 'out' ? 'rgba(188,0,0,0.1)' : inj.status === 'questionable' ? 'rgba(214,176,94,0.1)' : 'rgba(0,212,255,0.1)',
                      color: inj.status === 'out' ? '#BC0000' : inj.status === 'questionable' ? '#D6B05E' : '#00D4FF',
                    }}
                  >
                    {inj.status}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{inj.player}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: 'rgba(11,15,20,0.35)' }}>{inj.team_name}</span>
                    <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{inj.summary}</p>
                  </div>
                </div>
              ))}
              {/* Volatility */}
              {data.trends.volatility.map((vol, i) => (
                <div key={`vol-${i}`} className="flex items-start gap-2">
                  <span className="text-[10px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: 'rgba(214,176,94,0.1)', color: '#D6B05E' }}>
                    Volatile
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{vol.team_name}</span>
                    <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{vol.summary}</p>
                  </div>
                </div>
              ))}
              {/* Risers / Fallers */}
              {[...data.trends.risers, ...data.trends.fallers].map((item, i) => (
                <div key={`rf-${i}`} className="flex items-start gap-2">
                  <span
                    className="text-[10px] font-bold uppercase mt-0.5 px-1.5 py-0.5 rounded flex-shrink-0"
                    style={{
                      backgroundColor: item.change_value > 0 ? 'rgba(0,212,255,0.1)' : 'rgba(188,0,0,0.1)',
                      color: item.change_value > 0 ? '#00D4FF' : '#BC0000',
                    }}
                  >
                    {item.change_value > 0 ? 'Rising' : 'Falling'}
                  </span>
                  <div className="min-w-0">
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{item.team_name}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: 'rgba(11,15,20,0.35)' }}>{item.metric_label}</span>
                    <p className="text-[11px]" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
                  </div>
                </div>
              ))}
              {data.trends.injuries.length === 0 && data.trends.volatility.length === 0 && data.trends.risers.length === 0 && data.trends.fallers.length === 0 && (
                <span className="text-xs" style={{ color: 'rgba(11,15,20,0.3)' }}>No significant movement detected</span>
              )}
            </div>
          </GlassCard>

          {/* Leaders */}
          <GlassCard title="Player Intelligence" subtitle="Top performers and underperformers across all teams">
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {data.leaders.players.top.map((p) => (
                <div key={p.player_id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#00D4FF' }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                        <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.team_name} &middot; {p.position}</span>
                        <TrendArrow direction={p.trend} />
                      </div>
                      <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.45)' }}>{p.headline}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: '#00D4FF' }}>{p.primary_stat}</span>
                </div>
              ))}
              {data.leaders.players.struggling.length > 0 && (
                <div className="pt-2 mt-1" style={{ borderTop: '1px solid rgba(11,15,20,0.05)' }}>
                  {data.leaders.players.struggling.map((p) => (
                    <div key={p.player_id} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#BC0000' }} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                            <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.team_name} &middot; {p.position}</span>
                            <TrendArrow direction={p.trend} />
                          </div>
                          <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.45)' }}>{p.headline}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: '#BC0000' }}>{p.primary_stat}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* ── UNIT COMPARISON ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <GlassCard title="Best Units" subtitle="Top-performing team units across Chicago">
            <div className="space-y-3">
              {data.leaders.units.best.map((u, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{u.unit_label}</span>
                      <TrendArrow direction={u.trend} />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: '#00D4FF' }}>{u.rank_display}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.35)' }}>{u.team_name} &middot; {u.sport}</span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(11,15,20,0.5)' }}>{u.summary}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Weakest Units" subtitle="Underperforming units that need attention">
            <div className="space-y-3">
              {data.leaders.units.worst.map((u, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{u.unit_label}</span>
                      <TrendArrow direction={u.trend} />
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: '#BC0000' }}>{u.rank_display}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.35)' }}>{u.team_name} &middot; {u.sport}</span>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(11,15,20,0.5)' }}>{u.summary}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* ── FRESHNESS FOOTER ────────────────────────── */}
        <div className="flex flex-wrap gap-4 pt-3" style={{ borderTop: '1px solid rgba(11,15,20,0.04)' }}>
          {Object.entries(data.meta.data_freshness).map(([key, ts]) => {
            const ago = Math.round((Date.now() - new Date(ts).getTime()) / 60000)
            return (
              <span key={key} className="text-[10px]" style={{ color: 'rgba(11,15,20,0.2)' }}>
                {key}: {ago < 1 ? '<1m' : `${ago}m`} ago
              </span>
            )
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* DRILL-DOWN DRAWER                               */}
      {/* ═══════════════════════════════════════════════ */}
      <DrillDownDrawer
        open={!!drillTeam}
        onClose={() => setDrillTeam(null)}
        title={drillTeam?.team_name}
        subtitle={drillTeam ? `${drillTeam.sport} — ${drillTeam.season}` : undefined}
      >
        {drillTeam && <TeamDrillDown team={drillTeam} />}
      </DrillDownDrawer>
    </div>
  )
}

// ── DRILL-DOWN CONTENT ────────────────────────────────────────

function TeamDrillDown({ team }: { team: Team }) {
  const [section, setSection] = useState('intel')
  const sectionOpts = [
    { key: 'intel', label: 'Intelligence' },
    { key: 'perf', label: 'Performance' },
    { key: 'roster', label: 'Roster' },
  ]

  return (
    <div className="space-y-5">
      {/* Insight */}
      <div>
        <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14' }}>{team.insight.headline}</h3>
        <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.6)' }}>{team.insight.summary}</p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-3">
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
          <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.4)' }}>Record</span>
          <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.record.record_display}</span>
        </div>
        {team.recent.streak.count > 0 && (
          <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
            <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.4)' }}>Streak</span>
            <span className="text-base font-bold" style={{
              color: team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000'
            }}>{team.recent.streak.display}</span>
          </div>
        )}
        <div className="rounded-xl px-3 py-2" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
          <span className="text-[10px] block" style={{ color: 'rgba(11,15,20,0.4)' }}>L10</span>
          <span className="text-base font-bold" style={{ color: '#0B0F14' }}>{team.recent.last_10}</span>
        </div>
      </div>

      {/* Section filter */}
      <FilterBar options={sectionOpts} selected={section} onSelect={setSection} size="md" />

      {section === 'intel' && (
        <div className="space-y-4">
          {/* Ring gauges */}
          <div className="flex justify-between">
            <RingGauge value={team.intelligence.momentum_score} label="Momentum" size={56} />
            <RingGauge value={team.intelligence.pressure_index} label="Pressure" size={56} />
            <RingGauge value={team.intelligence.collapse_risk} label="Collapse" size={56} />
            <RingGauge value={team.intelligence.availability_score} label="Avail" size={56} />
            <RingGauge value={team.intelligence.consistency_score} label="Consist" size={56} />
          </div>

          {/* Momentum sparkline */}
          <GlassCard title="Momentum Trend">
            <MiniChart
              data={synthSparkline(team.intelligence.momentum_score, team.recent.trend_direction)}
              width={440}
              height={60}
              color={team.color_primary}
            />
          </GlassCard>

          {/* Health */}
          {team.health.injuries_total > 0 && (
            <GlassCard title="Health Report" accent={team.health.availability_tier === 'healthy' ? '#22c55e' : team.health.availability_tier === 'caution' ? '#D6B05E' : '#BC0000'}>
              <span className="text-xs font-medium block mb-2" style={{ color: '#0B0F14' }}>
                {team.health.availability_label}
              </span>
              {team.health.key_players_out.map(p => (
                <div key={p} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-1 rounded" style={{ backgroundColor: 'rgba(188,0,0,0.1)', color: '#BC0000' }}>OUT</span>
                  <span className="text-xs" style={{ color: '#0B0F14' }}>{p}</span>
                </div>
              ))}
              {team.health.key_players_questionable.map(p => (
                <div key={p} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase px-1 rounded" style={{ backgroundColor: 'rgba(214,176,94,0.1)', color: '#D6B05E' }}>GTD</span>
                  <span className="text-xs" style={{ color: '#0B0F14' }}>{p}</span>
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      )}

      {section === 'perf' && (
        <div className="space-y-4">
          {/* Offense vs Defense comparison */}
          <GlassCard title="Performance Breakdown">
            <BarChart
              items={[
                { label: `${team.units.offense.label}`, value: team.performance.offense.rating, sublabel: `${team.performance.offense.rating_display} (${team.performance.offense.rank_display})` },
                { label: `${team.units.defense.label}`, value: team.performance.defense.rating, sublabel: `${team.performance.defense.rating_display} (${team.performance.defense.rank_display})` },
                ...(team.units.special ? [{ label: team.units.special.label, value: team.units.special.rating, sublabel: String(team.units.special.rating) }] : []),
              ]}
              color={team.color_primary}
            />
          </GlassCard>

          {/* Unit contributors */}
          {Object.entries(team.units).map(([key, unit]) => {
            if (!unit || unit.key_contributors.length === 0) return null
            return (
              <GlassCard key={key} title={unit.label} subtitle={`Key contributors — ${key}`}>
                <div className="flex flex-wrap gap-2">
                  {unit.key_contributors.map((name: string) => (
                    <span key={name} className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.04)', color: '#0B0F14' }}>
                      {name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>Trend:</span>
                  <TrendArrow direction={unit.trend} />
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>Rating: {unit.rating}</span>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {section === 'roster' && (
        <div className="space-y-3">
          {team.leaders.top_performers.length > 0 && (
            <GlassCard title="Top Performers" accent="#00D4FF">
              {team.leaders.top_performers.map((p) => (
                <div key={p.player_id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.05)' }}>
                  <div>
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: '#00D4FF' }}>{p.stat_line}</span>
                    <TrendArrow direction={p.trend} />
                    <RingGauge value={p.performance_score} size={28} />
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {team.leaders.struggling_players.length > 0 && (
            <GlassCard title="Underperforming" accent="#BC0000">
              {team.leaders.struggling_players.map((p) => (
                <div key={p.player_id} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.05)' }}>
                  <div>
                    <span className="text-xs font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                    <span className="text-[11px] ml-1.5" style={{ color: 'rgba(11,15,20,0.35)' }}>{p.position}</span>
                    {p.note && <span className="text-[10px] block" style={{ color: '#D6B05E' }}>{p.note}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{p.stat_line}</span>
                    <TrendArrow direction={p.trend} />
                    <RingGauge value={p.performance_score} size={28} />
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {/* Next game */}
          {team.status.next_game && (
            <GlassCard title="Next Game" accent="#00D4FF">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: '#0B0F14' }}>
                  {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                </span>
                <div className="text-right">
                  <span className="text-xs font-medium block" style={{ color: '#00D4FF' }}>
                    {team.status.next_game.datetime_display}
                  </span>
                  <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.35)' }}>
                    {team.status.next_game.venue}
                  </span>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  )
}
