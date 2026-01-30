'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const [isExpanded, setIsExpanded] = useState(false)

  // Only show if user has made at least 1 trade
  if (tradeCount === 0) return null

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const surfaceBg = isDark ? '#111827' : '#f9fafb'

  // Game counts by sport
  const gameCount = sport === 'nfl' ? '17' : sport === 'mlb' ? '162' : sport === 'nba' ? '82' : sport === 'nhl' ? '82' : '82'

  return (
    <div
      style={{
        marginTop: 24,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        backgroundColor: cardBg,
        overflow: 'hidden',
      }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          border: 'none',
          backgroundColor: 'transparent',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🎮</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: textColor }}>
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
        <motion.svg
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={subText}
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: 20,
                borderTop: `1px solid ${borderColor}`,
                backgroundColor: surfaceBg,
              }}
            >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
