'use client'

import { useState } from 'react'
import type { Trends, TrendItem, StreakItem, InjuryItem, VolatilityItem } from './types'

interface Props { trends: Trends }
type TrendTab = 'injuries' | 'volatility' | 'risers' | 'fallers' | 'streaks'

export default function TrendsPanel({ trends }: Props) {
  const tabs: { key: TrendTab; label: string; count: number }[] = [
    { key: 'injuries', label: 'Injuries', count: trends.injuries.length },
    { key: 'volatility', label: 'Volatility', count: trends.volatility.length },
    { key: 'risers', label: 'Risers', count: trends.risers.length },
    { key: 'fallers', label: 'Fallers', count: trends.fallers.length },
    { key: 'streaks', label: 'Streaks', count: trends.streaks.length },
  ]
  const firstWithData = tabs.find(t => t.count > 0)?.key || 'injuries'
  const [activeTab, setActiveTab] = useState<TrendTab>(firstWithData)

  return (
    <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(11,15,20,0.04), 0 8px 32px rgba(11,15,20,0.04)' }}>
      <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(11,15,20,0.05)' }}>
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: '#D6B05E' }} />
        <h2 className="text-[13px] font-bold tracking-[0.04em]" style={{ color: '#0B0F14' }}>Signals & Movement</h2>
      </div>

      {/* Segmented control */}
      <div className="px-6 py-3 flex gap-1" style={{ borderBottom: '1px solid rgba(11,15,20,0.04)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-1.5 text-[10px] font-bold tracking-wide rounded-lg transition-all flex items-center gap-1"
            style={{
              backgroundColor: activeTab === tab.key ? '#0B0F14' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(11,15,20,0.35)',
            }}
          >
            {tab.label}
            {tab.count > 0 && <span className="text-[9px] tabular-nums" style={{ opacity: 0.6 }}>{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="px-6 py-4 max-h-[340px] overflow-y-auto">
        {activeTab === 'injuries' && trends.injuries.map((item: InjuryItem, i: number) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{item.player}</span>
                <span className="text-[10px]" style={{ color: 'rgba(11,15,20,0.3)' }}>{item.team_name}</span>
              </div>
              <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-md uppercase" style={{
                backgroundColor: item.status === 'out' ? 'rgba(188,0,0,0.06)' : item.status === 'questionable' ? 'rgba(214,176,94,0.08)' : 'rgba(0,212,255,0.06)',
                color: item.status === 'out' ? '#BC0000' : item.status === 'questionable' ? '#D6B05E' : '#00D4FF',
              }}>{item.status}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'volatility' && trends.volatility.map((item: VolatilityItem, i: number) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{item.team_name}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#D6B05E' }}>{item.volatility_score}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'risers' && trends.risers.map((item: TrendItem, i: number) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{item.team_name} &middot; {item.metric_label}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#00D4FF' }}>+{item.change_value} ({item.change_pct.toFixed(1)}%)</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'fallers' && trends.fallers.map((item: TrendItem, i: number) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{item.team_name} &middot; {item.metric_label}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#BC0000' }}>{item.change_value} ({item.change_pct.toFixed(1)}%)</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'streaks' && trends.streaks.map((item: StreakItem, i: number) => (
          <div key={i} className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(11,15,20,0.04)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[12px] font-bold" style={{ color: '#0B0F14' }}>{item.team_name}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{
                backgroundColor: item.streak_type === 'W' ? 'rgba(0,212,255,0.08)' : 'rgba(188,0,0,0.06)',
                color: item.streak_type === 'W' ? '#00D4FF' : '#BC0000',
              }}>{item.streak_type}{item.streak_value}</span>
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(11,15,20,0.5)' }}>{item.summary}</p>
          </div>
        ))}
        {tabs.every(t => t.count === 0) && (
          <p className="text-[11px] py-4 text-center" style={{ color: 'rgba(11,15,20,0.25)' }}>No significant movement detected</p>
        )}
      </div>
    </section>
  )
}
