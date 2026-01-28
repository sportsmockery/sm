'use client'
import { useMemo } from 'react'
import { useTheme } from '@/contexts/ThemeContext'
import { PlayerData } from './PlayerCard'

type ReceivedPlayer = PlayerData | { name: string; position: string }

function isPlayerData(p: ReceivedPlayer): p is PlayerData {
  return 'player_id' in p
}

interface StatComparisonProps {
  playersSent: PlayerData[]
  playersReceived: ReceivedPlayer[]
  sport: string
}

export function StatComparison({ playersSent, playersReceived, sport }: StatComparisonProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const textColor = isDark ? '#fff' : '#1a1a1a'

  const sentStats = useMemo(() => {
    if (playersSent.length === 0) return null
    const avgAge = playersSent.reduce((s, p) => s + (p.age || 0), 0) / playersSent.length
    const totalCap = playersSent.reduce((s, p) => s + (p.cap_hit || 0), 0)
    return {
      count: playersSent.length,
      avgAge: +avgAge.toFixed(1),
      positions: playersSent.map(p => p.position).join(', '),
      totalCap,
    }
  }, [playersSent])

  const recvStats = useMemo(() => {
    if (playersReceived.length === 0) return null
    const withData = playersReceived.filter(isPlayerData)
    const avgAge = withData.length > 0
      ? withData.reduce((s, p) => s + (p.age || 0), 0) / withData.length
      : 0
    const totalCap = withData.reduce((s, p) => s + (p.cap_hit || 0), 0)
    return {
      count: playersReceived.length,
      avgAge: +avgAge.toFixed(1),
      totalCap,
      hasData: withData.length > 0,
    }
  }, [playersReceived])

  if (!sentStats || !recvStats) return null

  function formatCap(v: number): string {
    if (v === 0) return '--'
    return `$${(v / 1_000_000).toFixed(1)}M`
  }

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
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#22c55e' }}>{recvStats.count}</div>
          <div style={{ fontSize: '10px', color: subText }}>Receiving</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, marginTop: 10, textAlign: 'center' }}>
        {sentStats.avgAge > 0 && (
          <>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              Avg {sentStats.avgAge}
            </div>
            <div style={{ fontSize: '10px', color: subText }}>Age</div>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {recvStats.hasData && recvStats.avgAge > 0 ? `Avg ${recvStats.avgAge}` : '--'}
            </div>
          </>
        )}
        {(sentStats.totalCap > 0 || recvStats.totalCap > 0) && (
          <>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {formatCap(sentStats.totalCap)}
            </div>
            <div style={{ fontSize: '10px', color: subText }}>Cap Hit</div>
            <div style={{ fontSize: '12px', color: textColor, fontWeight: 600 }}>
              {formatCap(recvStats.totalCap)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
