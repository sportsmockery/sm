'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface SimulationTriggerProps {
  tradeCount: number
  sport: string
  onSimulate: () => Promise<void>
  isSimulating: boolean
  teamColor: string
}

export function SimulationTrigger({
  tradeCount,
  sport,
  onSimulate,
  isSimulating,
  teamColor,
}: SimulationTriggerProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Only show if user has made at least 1 trade
  if (tradeCount === 0) return null

  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'
  const cardBg = 'var(--sm-card)'

  // Game counts by sport
  const gameCount = sport === 'nfl' ? '17' : sport === 'mlb' ? '162' : sport === 'nba' ? '82' : sport === 'nhl' ? '82' : '82'

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        backgroundColor: cardBg,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>🎮</span>
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--sm-text)' }}>
          Simulate Season
        </span>
        <span
          style={{
            background: teamColor,
            color: '#fff',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {tradeCount} trade{tradeCount > 1 ? 's' : ''} made
        </span>
      </div>

      <p
        style={{
          fontSize: 14,
          color: subText,
          lineHeight: 1.6,
          margin: 0,
          marginBottom: 16,
        }}
      >
        See how your trades impact the season. We&apos;ll simulate all {gameCount} games
        and show your improved record and GM Score.
      </p>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onSimulate}
        disabled={isSimulating}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 10,
          border: 'none',
          backgroundColor: isSimulating ? (isDark ? '#374151' : '#d1d5db') : teamColor,
          color: isSimulating ? subText : '#fff',
          fontWeight: 700,
          fontSize: 15,
          cursor: isSimulating ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {isSimulating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{
                width: 18,
                height: 18,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
              }}
            />
            Simulating Season...
          </>
        ) : (
          <>
            <span>🏆</span>
            Simulate 2026 Season
          </>
        )}
      </motion.button>
    </div>
  )
}
