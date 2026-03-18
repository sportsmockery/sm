'use client'

import { useState } from 'react'
import type { Trends, TrendItem, StreakItem, InjuryItem, VolatilityItem } from './types'

interface Props { trends: Trends }

type TrendTab = 'risers' | 'fallers' | 'streaks' | 'injuries' | 'volatility'

function ChangeIndicator({ value, pct }: { value: number; pct: number }) {
  const isPositive = value > 0
  const color = isPositive ? '#00D4FF' : '#BC0000'
  return (
    <span className="text-[10px] font-bold tabular-nums" style={{ color }}>
      {isPositive ? '+' : ''}{value} ({isPositive ? '+' : ''}{pct.toFixed(1)}%)
    </span>
  )
}

function InjuryStatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    out: { bg: 'rgba(188,0,0,0.12)', text: '#BC0000' },
    doubtful: { bg: 'rgba(188,0,0,0.08)', text: '#BC0000' },
    questionable: { bg: 'rgba(214,176,94,0.12)', text: '#D6B05E' },
    'day-to-day': { bg: 'rgba(0,212,255,0.08)', text: '#00D4FF' },
  }
  const c = colors[status] || colors.questionable
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  )
}

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
    <div
      className="rounded-2xl border overflow-hidden backdrop-blur-xl"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}
    >
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'rgba(232,234,237,0.3)' }}>
          Movement & Signals
        </span>
      </div>

      <div className="flex border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3.5 py-2.5 text-[10px] font-bold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5"
            style={{
              color: activeTab === tab.key ? '#00D4FF' : 'rgba(232,234,237,0.3)',
              borderBottom: activeTab === tab.key ? '2px solid #00D4FF' : '2px solid transparent',
              backgroundColor: activeTab === tab.key ? 'rgba(0,212,255,0.04)' : 'transparent',
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="text-[9px] px-1 rounded" style={{
                backgroundColor: activeTab === tab.key ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.key ? '#00D4FF' : 'rgba(232,234,237,0.2)',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-[320px] overflow-y-auto">
        {activeTab === 'risers' && trends.risers.map((item: TrendItem, i: number) => (
          <div key={i} className="py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#E8EAED' }}>{item.team_name} &middot; {item.metric_label}</span>
              <ChangeIndicator value={item.change_value} pct={item.change_pct} />
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(232,234,237,0.45)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'fallers' && trends.fallers.map((item: TrendItem, i: number) => (
          <div key={i} className="py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#E8EAED' }}>{item.team_name} &middot; {item.metric_label}</span>
              <ChangeIndicator value={item.change_value} pct={item.change_pct} />
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(232,234,237,0.45)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'streaks' && trends.streaks.map((item: StreakItem, i: number) => (
          <div key={i} className="py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#E8EAED' }}>{item.team_name}</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{
                backgroundColor: item.streak_type === 'W' ? 'rgba(0,212,255,0.12)' : 'rgba(188,0,0,0.12)',
                color: item.streak_type === 'W' ? '#00D4FF' : '#BC0000',
              }}>{item.streak_type}{item.streak_value}</span>
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(232,234,237,0.45)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'injuries' && trends.injuries.map((item: InjuryItem, i: number) => (
          <div key={i} className="py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium" style={{ color: '#E8EAED' }}>{item.player}</span>
                <span className="text-[10px]" style={{ color: 'rgba(232,234,237,0.25)' }}>{item.team_name}</span>
              </div>
              <InjuryStatusBadge status={item.status} />
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(232,234,237,0.45)' }}>{item.summary}</p>
          </div>
        ))}
        {activeTab === 'volatility' && trends.volatility.map((item: VolatilityItem, i: number) => (
          <div key={i} className="py-2.5 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium" style={{ color: '#E8EAED' }}>{item.team_name} &middot; {item.metric_label}</span>
              <span className="text-[10px] font-bold tabular-nums" style={{ color: '#D6B05E' }}>{item.volatility_score}</span>
            </div>
            <p className="text-[11px]" style={{ color: 'rgba(232,234,237,0.45)' }}>{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
