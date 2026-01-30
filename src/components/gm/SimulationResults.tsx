'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import type { SimulationResult } from '@/types/gm'

interface SimulationResultsProps {
  result: SimulationResult
  tradeCount: number
  teamName: string
  teamColor: string
  onSimulateAgain: () => void
  onClose: () => void
}

export function SimulationResults({
  result,
  tradeCount,
  teamName,
  teamColor,
  onSimulateAgain,
  onClose,
}: SimulationResultsProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const surfaceBg = isDark ? '#111827' : '#f9fafb'

  const { baseline, modified, gmScore, scoreBreakdown } = result
  const winImprovement = modified.wins - baseline.wins
  const isImprovement = winImprovement > 0

  // Grade letter based on score
  const getGradeLetter = (score: number): string => {
    if (score >= 90) return 'A+'
    if (score >= 85) return 'A'
    if (score >= 80) return 'A-'
    if (score >= 75) return 'B+'
    if (score >= 70) return 'B'
    if (score >= 65) return 'B-'
    if (score >= 60) return 'C+'
    if (score >= 55) return 'C'
    if (score >= 50) return 'C-'
    if (score >= 45) return 'D+'
    if (score >= 40) return 'D'
    return 'F'
  }

  const gradeColor = gmScore >= 75 ? '#22c55e' : gmScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          zIndex: 999,
        }}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 700,
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 16,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 1000,
          padding: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: textColor }}>
              Season Simulation Results
            </h2>
            <p style={{ margin: 0, marginTop: 4, fontSize: 13, color: subText }}>
              {teamName} • 2026 Season
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 28,
              cursor: 'pointer',
              color: subText,
              padding: 0,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Before/After Comparison */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: 16,
              padding: 20,
              background: surfaceBg,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            {/* Before */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: subText,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Before Trades
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: textColor,
                  lineHeight: 1,
                }}
              >
                {baseline.wins}-{baseline.losses}
              </div>
              <div style={{ fontSize: 13, color: subText, marginTop: 8 }}>
                {baseline.madePlayoffs ? '✅ Playoffs' : '❌ Missed Playoffs'}
              </div>
            </div>

            {/* Arrow */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                color: isImprovement ? '#22c55e' : winImprovement < 0 ? '#ef4444' : subText,
              }}
            >
              →
            </div>

            {/* After */}
            <div
              style={{
                textAlign: 'center',
                background: `${teamColor}15`,
                padding: 16,
                borderRadius: 10,
                marginTop: -16,
                marginBottom: -16,
                marginRight: -4,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: teamColor,
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                After Trades
              </div>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: textColor,
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {modified.wins}-{modified.losses}
                {winImprovement !== 0 && (
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      padding: '4px 8px',
                      borderRadius: 6,
                      backgroundColor: isImprovement ? '#22c55e' : '#ef4444',
                      color: '#fff',
                    }}
                  >
                    {winImprovement > 0 ? '+' : ''}
                    {winImprovement}W
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: subText, marginTop: 8 }}>
                {modified.madePlayoffs ? '✅ Playoffs' : '❌ Missed Playoffs'}
              </div>
            </div>
          </div>

          {/* GM Score */}
          <div
            style={{
              background: `linear-gradient(135deg, ${teamColor}, ${teamColor}dd)`,
              color: '#fff',
              padding: 24,
              borderRadius: 12,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                opacity: 0.9,
                marginBottom: 4,
              }}
            >
              Your GM Score
            </div>
            <div
              style={{
                fontSize: 48,
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              {gmScore.toFixed(1)}
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                }}
              >
                {getGradeLetter(gmScore)}
              </span>
            </div>

            {/* Score breakdown */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 8,
                padding: 16,
                marginTop: 16,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>Trade quality ({tradeCount} trade{tradeCount > 1 ? 's' : ''})</span>
                <span style={{ fontWeight: 600 }}>
                  {scoreBreakdown.tradeQualityScore.toFixed(1)} / 60 pts
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span>
                  Win improvement ({winImprovement > 0 ? '+' : ''}
                  {scoreBreakdown.winImprovement} wins)
                </span>
                <span style={{ fontWeight: 600 }}>
                  {scoreBreakdown.winImprovementScore.toFixed(1)} / 25 pts
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  fontSize: 13,
                }}
              >
                <span>Playoff achievement</span>
                <span style={{ fontWeight: 600 }}>
                  {scoreBreakdown.playoffBonusScore} / 15 pts
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onSimulateAgain}
              style={{
                flex: 1,
                padding: '14px 24px',
                borderRadius: 10,
                border: `2px solid ${borderColor}`,
                backgroundColor: 'transparent',
                color: textColor,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              🎲 Simulate Again
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px 24px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: teamColor,
                color: '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Continue Trading
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
