'use client'

import { useState } from 'react'
import type { Team, TrendDirection, IntelligenceTier } from './types'

interface Props {
  team: Team
  onClose: () => void
}

type Tab = 'overview' | 'performance' | 'health' | 'players' | 'intelligence'

function TrendArrow({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.3)'
  const symbol = direction === 'up' ? '\u25b2' : direction === 'down' ? '\u25bc' : '\u25b6'
  return <span style={{ color, fontSize: 10 }}>{symbol}</span>
}

function MetricBar({ label, value, max = 100, color }: { label: string; value: number; max?: number; color?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  const barColor = color || (value >= 60 ? '#00D4FF' : value >= 40 ? '#D6B05E' : '#BC0000')
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{label}</span>
        <span className="text-xs font-medium tabular-nums" style={{ color: barColor }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}

function TierLabel({ tier }: { tier: IntelligenceTier }) {
  const map: Record<IntelligenceTier, { label: string; color: string; bg: string }> = {
    green: { label: 'Healthy', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
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

export default function TeamWorkspace({ team, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'performance', label: 'Performance' },
    { key: 'health', label: 'Health' },
    { key: 'players', label: 'Players' },
    { key: 'intelligence', label: 'Intel' },
  ]

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
          <div
            className="w-4 h-4 rounded-sm"
            style={{ backgroundColor: team.color_primary }}
          />
          <div>
            <span className="text-sm font-bold" style={{ color: '#0B0F14' }}>
              {team.team_name}
            </span>
            <span className="text-xs ml-2" style={{ color: 'rgba(11,15,20,0.4)' }}>
              {team.sport} &middot; {team.season}
            </span>
          </div>
          <TierLabel tier={team.intelligence.intelligence_tier} />
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          style={{ color: 'rgba(11,15,20,0.4)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-0 border-b overflow-x-auto"
        style={{ borderColor: 'rgba(11,15,20,0.08)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              color: activeTab === tab.key ? '#00D4FF' : 'rgba(11,15,20,0.4)',
              borderBottom: activeTab === tab.key ? '2px solid #00D4FF' : '2px solid transparent',
              backgroundColor: activeTab === tab.key ? 'rgba(0,212,255,0.04)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Insight */}
            <div>
              <h3 className="text-sm font-bold mb-1" style={{ color: '#0B0F14' }}>
                {team.insight.headline}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(11,15,20,0.6)' }}>
                {team.insight.summary}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Record</span>
                <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>{team.record.record_display}</span>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Streak</span>
                <span className="text-lg font-bold" style={{
                  color: team.recent.streak.type === 'W' ? '#00D4FF' : '#BC0000'
                }}>
                  {team.recent.streak.display}
                </span>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Last 10</span>
                <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>{team.recent.last_10}</span>
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Remaining</span>
                <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>{team.record.games_remaining}</span>
              </div>
            </div>

            {/* Next Game */}
            {team.status.next_game ? (
              <div
                className="rounded-lg p-3 border"
                style={{ backgroundColor: 'rgba(11,15,20,0.02)', borderColor: 'rgba(11,15,20,0.06)' }}
              >
                <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'rgba(11,15,20,0.35)' }}>
                  Next Game
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: '#0B0F14' }}>
                    {team.status.next_game.home ? 'vs' : '@'} {team.status.next_game.opponent}
                  </span>
                  <div className="text-right">
                    <span className="text-xs block" style={{ color: '#00D4FF' }}>
                      {team.status.next_game.datetime_display}
                    </span>
                    <span className="text-xs" style={{ color: 'rgba(11,15,20,0.35)' }}>
                      {team.status.next_game.venue} &middot; {team.status.next_game.importance_label}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="rounded-lg p-3 border"
                style={{ backgroundColor: 'rgba(11,15,20,0.02)', borderColor: 'rgba(11,15,20,0.06)' }}
              >
                <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'rgba(11,15,20,0.35)' }}>
                  Next Game
                </span>
                <span className="text-sm" style={{ color: 'rgba(11,15,20,0.4)' }}>No games scheduled</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            {/* Offense */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(11,15,20,0.5)' }}>
                  Offense
                </span>
                <TrendArrow direction={team.performance.offense.trend} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                  <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Rating</span>
                  <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>
                    {team.performance.offense.rating_display}
                  </span>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                  <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Rank</span>
                  <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>
                    {team.performance.offense.rank_display}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs" style={{ color: 'rgba(11,15,20,0.4)' }}>
                  {team.units.offense.label}: {team.units.offense.key_contributors.join(', ')}
                </span>
              </div>
            </div>

            {/* Defense */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(11,15,20,0.5)' }}>
                  Defense
                </span>
                <TrendArrow direction={team.performance.defense.trend} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                  <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Rating</span>
                  <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>
                    {team.performance.defense.rating_display}
                  </span>
                </div>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(11,15,20,0.03)' }}>
                  <span className="text-xs block" style={{ color: 'rgba(11,15,20,0.4)' }}>Rank</span>
                  <span className="text-lg font-bold" style={{ color: '#0B0F14' }}>
                    {team.performance.defense.rank_display}
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-xs" style={{ color: 'rgba(11,15,20,0.4)' }}>
                  {team.units.defense.label}: {team.units.defense.key_contributors.join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium" style={{ color: '#0B0F14' }}>
                {team.health.availability_label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: team.health.availability_tier === 'healthy' ? 'rgba(34,197,94,0.1)' :
                    team.health.availability_tier === 'caution' ? 'rgba(214,176,94,0.1)' : 'rgba(188,0,0,0.1)',
                  color: team.health.availability_tier === 'healthy' ? '#22c55e' :
                    team.health.availability_tier === 'caution' ? '#D6B05E' : '#BC0000',
                }}
              >
                {team.health.availability_tier}
              </span>
            </div>

            <MetricBar label="Availability Score" value={team.intelligence.availability_score} />

            {team.health.key_players_out.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: '#BC0000' }}>
                  Out
                </span>
                {team.health.key_players_out.map((p) => (
                  <span key={p} className="text-sm block" style={{ color: '#0B0F14' }}>{p}</span>
                ))}
              </div>
            )}

            {team.health.key_players_questionable.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-1.5" style={{ color: '#D6B05E' }}>
                  Questionable
                </span>
                {team.health.key_players_questionable.map((p) => (
                  <span key={p} className="text-sm block" style={{ color: '#0B0F14' }}>{p}</span>
                ))}
              </div>
            )}

            {team.health.injuries_total === 0 && (
              <span className="text-sm" style={{ color: 'rgba(11,15,20,0.5)' }}>
                No injuries reported
              </span>
            )}
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-4">
            {team.leaders.top_performers.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: '#00D4FF' }}>
                  Top Performers
                </span>
                {team.leaders.top_performers.map((p) => (
                  <div
                    key={p.player_id}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: 'rgba(11,15,20,0.06)' }}
                  >
                    <div>
                      <span className="text-sm font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'rgba(11,15,20,0.4)' }}>{p.position}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#00D4FF' }}>{p.stat_line}</span>
                      <TrendArrow direction={p.trend} />
                      <span className="text-xs tabular-nums w-6 text-right" style={{ color: 'rgba(11,15,20,0.5)' }}>
                        {p.performance_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {team.leaders.struggling_players.length > 0 && (
              <div>
                <span className="text-xs uppercase tracking-wider block mb-2" style={{ color: '#BC0000' }}>
                  Struggling
                </span>
                {team.leaders.struggling_players.map((p) => (
                  <div
                    key={p.player_id}
                    className="flex items-center justify-between py-2 border-b"
                    style={{ borderColor: 'rgba(11,15,20,0.06)' }}
                  >
                    <div>
                      <span className="text-sm font-medium" style={{ color: '#0B0F14' }}>{p.name}</span>
                      <span className="text-xs ml-2" style={{ color: 'rgba(11,15,20,0.4)' }}>{p.position}</span>
                      {p.note && (
                        <span className="text-xs block" style={{ color: '#D6B05E' }}>{p.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'rgba(11,15,20,0.5)' }}>{p.stat_line}</span>
                      <TrendArrow direction={p.trend} />
                      <span className="text-xs tabular-nums w-6 text-right" style={{ color: 'rgba(11,15,20,0.5)' }}>
                        {p.performance_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'intelligence' && (
          <div className="space-y-3">
            <MetricBar label="Momentum" value={team.intelligence.momentum_score} />
            <MetricBar label="Pressure Index" value={team.intelligence.pressure_index} />
            <MetricBar label="Collapse Risk" value={team.intelligence.collapse_risk} />
            <MetricBar label="Availability" value={team.intelligence.availability_score} />
            <MetricBar label="Consistency" value={team.intelligence.consistency_score} />
          </div>
        )}
      </div>
    </div>
  )
}
