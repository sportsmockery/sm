'use client'
import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData } from './PlayerCard'

interface StatComparisonProps {
  playersSent: PlayerData[]
  playersReceived: { name: string; position: string }[]
  sport: string
}

export function StatComparison({ playersSent, playersReceived, sport }: StatComparisonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  const sentStats = useMemo(() => {
    if (playersSent.length === 0) return null
    const avgAge = playersSent.reduce((s, p) => s + (p.age || 0), 0) / playersSent.length
    return {
      count: playersSent.length,
      avgAge: +avgAge.toFixed(1),
      positions: playersSent.map(p => p.position).join(', '),
    }
  }, [playersSent])

  if (!sentStats || playersReceived.length === 0) return null

  return (
    <div style={{
      padding: 12, borderRadius: 10,
      backgroundColor: isDark ? '#1f293750' : '#f3f4f680',
      border: `1px solid ${isDark ? '#37415150' : '#e5e7eb50'}`,
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Trade Overview
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#ef4444' }}>{sentStats.count}</div>
          <div style={{ fontSize: '10px', color: subText }}>Sending</div>
        </div>
        <div style={{ fontSize: '16px', color: subText }}>&#x2194;</div>
        <div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>{playersReceived.length}</div>
          <div style={{ fontSize: '10px', color: subText }}>Receiving</div>
        </div>
      </div>
      {sentStats.avgAge > 0 && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '11px', color: subText }}>
          Avg age sending: {sentStats.avgAge}
        </div>
      )}
    </div>
  )
}
