'use client'

import { useState } from 'react'
import type { Leaders, TrendDirection } from './types'

interface Props { leaders: Leaders }
type Tab = 'top' | 'struggling' | 'best_units' | 'worst_units'

function TrendDot({ direction }: { direction: TrendDirection }) {
  const color = direction === 'up' ? '#00D4FF' : direction === 'down' ? '#BC0000' : 'rgba(11,15,20,0.15)'
  return <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#00D4FF' : score >= 45 ? '#D6B05E' : '#BC0000'
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-[4px] rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-bold tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

export default function LeaderboardsPanel({ leaders }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('top')
  const tabs: { key: Tab; label: string }[] = [
    { key: 'top', label: 'Top Players' },
    { key: 'struggling', label: 'Struggling' },
    { key: 'best_units', label: 'Best Units' },
    { key: 'worst_units', label: 'Worst Units' },
  ]

  return (
    <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(11,15,20,0.04), 0 8px 32px rgba(11,15,20,0.04)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(11,15,20,0.05)' }}>
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#00D4FF' }} />
        <h2 className="text-[13px] font-bold tracking-[0.04em]" style={{ color: '#0B0F14' }}>Player Intelligence</h2>
      </div>

      <div className="px-6 py-3 flex gap-1" style={{ borderBottom: '1px solid rgba(11,15,20,0.04)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 text-[10px] font-bold tracking-wide rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === tab.key ? '#0B0F14' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(11,15,20,0.35)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-6 py-4 max-h-[360px] overflow-y-auto">
        {activeTab === 'top' && leaders.players.top.map((p) => (
          <div key={p.player_id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TrendDot direction={p.trend} />
                <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{p.name}</span>
                <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{p.team_name} &middot; {p.position}</span>
              </div>
              <p className="text-[11px] mt-0.5 ml-3.5" style={{ color: 'rgba(11,15,20,0.45)' }}>{p.headline}</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4">
              <span className="text-[13px] font-bold tabular-nums" style={{ color: '#00D4FF' }}>{p.primary_stat}</span>
              <ScoreBar score={p.performance_score} />
            </div>
          </div>
        ))}
        {activeTab === 'struggling' && leaders.players.struggling.map((p) => (
          <div key={p.player_id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TrendDot direction={p.trend} />
                <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{p.name}</span>
                <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{p.team_name} &middot; {p.position}</span>
              </div>
              <p className="text-[11px] mt-0.5 ml-3.5" style={{ color: 'rgba(11,15,20,0.45)' }}>{p.headline}</p>
            </div>
            <div className="flex flex-col items-end gap-1 ml-4">
              <span className="text-[13px] font-bold tabular-nums" style={{ color: '#BC0000' }}>{p.primary_stat}</span>
              <ScoreBar score={p.performance_score} />
            </div>
          </div>
        ))}
        {activeTab === 'best_units' && leaders.units.best.map((u, i) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{u.unit_label}</span>
              <span className="text-[10px] font-bold" style={{ color: '#00D4FF' }}>{u.rank_display}</span>
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{u.team_name} &middot; {u.sport}</span>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(11,15,20,0.45)' }}>{u.summary}</p>
          </div>
        ))}
        {activeTab === 'worst_units' && leaders.units.worst.map((u, i) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{u.unit_label}</span>
              <span className="text-[10px] font-bold" style={{ color: '#BC0000' }}>{u.rank_display}</span>
            </div>
            <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{u.team_name} &middot; {u.sport}</span>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'rgba(11,15,20,0.45)' }}>{u.summary}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
