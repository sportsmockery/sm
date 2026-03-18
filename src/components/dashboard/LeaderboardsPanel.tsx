'use client'

import { useState } from 'react'
import type { Leaders, TrendDirection } from './types'

interface Props {
  leaders: Leaders
}

type LeaderTab = 'top' | 'struggling' | 'best_units' | 'worst_units'

function TrendArrow({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(250,250,251,0.3)'
  const symbol = direction === 'up' ? '\u25b2' : direction === 'down' ? '\u25bc' : '\u25b6'
  return <span style={{ color, fontSize: 9 }}>{symbol}</span>
}

function PerformanceScore({ score }: { score: number }) {
  const color = score >= 70 ? '#00D4FF' : score >= 45 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-1">
      <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

export default function LeaderboardsPanel({ leaders }: Props) {
  const [activeTab, setActiveTab] = useState<LeaderTab>('top')

  const tabs: { key: LeaderTab; label: string }[] = [
    { key: 'top', label: 'Top Players' },
    { key: 'struggling', label: 'Struggling' },
    { key: 'best_units', label: 'Best Units' },
    { key: 'worst_units', label: 'Worst Units' },
  ]

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <div className="px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(250,250,251,0.5)' }}>
          Leaderboards
        </span>
      </div>

      <div className="flex border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
            style={{
              color: activeTab === tab.key ? '#00D4FF' : 'rgba(250,250,251,0.4)',
              borderBottom: activeTab === tab.key ? '2px solid #00D4FF' : '2px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-3 max-h-[350px] overflow-y-auto">
        {activeTab === 'top' && leaders.players.top.map((player) => (
          <div
            key={player.player_id}
            className="flex items-center justify-between py-2.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#FAFAFB' }}>{player.name}</span>
                <TrendArrow direction={player.trend} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>
                  {player.team_name} &middot; {player.position}
                </span>
              </div>
              <span className="text-xs" style={{ color: 'rgba(250,250,251,0.5)' }}>{player.headline}</span>
            </div>
            <div className="flex flex-col items-end gap-1 ml-3">
              <span className="text-sm font-bold" style={{ color: '#00D4FF' }}>{player.primary_stat}</span>
              <div className="flex gap-2">
                {player.secondary_stats.map((s, i) => (
                  <span key={i} className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>{s}</span>
                ))}
              </div>
              <PerformanceScore score={player.performance_score} />
            </div>
          </div>
        ))}

        {activeTab === 'struggling' && leaders.players.struggling.map((player) => (
          <div
            key={player.player_id}
            className="flex items-center justify-between py-2.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#FAFAFB' }}>{player.name}</span>
                <TrendArrow direction={player.trend} />
              </div>
              <span className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>
                {player.team_name} &middot; {player.position}
              </span>
              <span className="text-xs block" style={{ color: 'rgba(250,250,251,0.5)' }}>{player.headline}</span>
            </div>
            <div className="flex flex-col items-end gap-1 ml-3">
              <span className="text-sm font-bold" style={{ color: '#BC0000' }}>{player.primary_stat}</span>
              <div className="flex gap-2">
                {player.secondary_stats.map((s, i) => (
                  <span key={i} className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>{s}</span>
                ))}
              </div>
              <PerformanceScore score={player.performance_score} />
            </div>
          </div>
        ))}

        {activeTab === 'best_units' && leaders.units.best.map((unit, i) => (
          <div
            key={i}
            className="py-2.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#FAFAFB' }}>{unit.unit_label}</span>
                <TrendArrow direction={unit.trend} />
              </div>
              <span className="text-xs font-bold" style={{ color: '#00D4FF' }}>{unit.rank_display}</span>
            </div>
            <span className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>
              {unit.team_name} &middot; {unit.sport}
            </span>
            <p className="text-xs mt-1" style={{ color: 'rgba(250,250,251,0.5)' }}>{unit.summary}</p>
          </div>
        ))}

        {activeTab === 'worst_units' && leaders.units.worst.map((unit, i) => (
          <div
            key={i}
            className="py-2.5 border-b last:border-0"
            style={{ borderColor: 'rgba(255,255,255,0.04)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#FAFAFB' }}>{unit.unit_label}</span>
                <TrendArrow direction={unit.trend} />
              </div>
              <span className="text-xs font-bold" style={{ color: '#BC0000' }}>{unit.rank_display}</span>
            </div>
            <span className="text-xs" style={{ color: 'rgba(250,250,251,0.4)' }}>
              {unit.team_name} &middot; {unit.sport}
            </span>
            <p className="text-xs mt-1" style={{ color: 'rgba(250,250,251,0.5)' }}>{unit.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
