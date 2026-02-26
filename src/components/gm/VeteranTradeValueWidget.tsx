'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface VeteranTradeValue {
  playerName: string
  position: string
  age: number
  performanceLevel: 'elite' | 'pro_bowl' | 'good' | 'average' | 'below_avg'
  contractYearsRemaining: number
  capHit: number

  // Calculated values
  baseValue: number
  ageMultiplier: number
  ageAdjustedValue: number
  contractMultiplier: number
  contractAdjustedValue: number
  capMultiplier?: number
  positionMultiplier?: number
  positionAdjustedValue: number
  finalValue: number
  draftPickEquivalent: string
  draftPickRange?: { low: number; high: number }
}

interface VeteranTradeValueWidgetProps {
  veteran: VeteranTradeValue
  teamColor: string
}

const PERFORMANCE_LABELS: Record<string, { label: string; color: string }> = {
  elite: { label: 'ELITE (Top 5)', color: '#22c55e' },
  pro_bowl: { label: 'PRO BOWL (Top 10-15)', color: '#3b82f6' },
  good: { label: 'GOOD (Top 20-25)', color: '#8b5cf6' },
  average: { label: 'AVERAGE (Top 30-40)', color: '#f59e0b' },
  below_avg: { label: 'BELOW AVERAGE', color: '#ef4444' },
}

export function VeteranTradeValueWidget({ veteran, teamColor }: VeteranTradeValueWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!veteran) return null

  const performanceInfo = PERFORMANCE_LABELS[veteran.performanceLevel] || PERFORMANCE_LABELS.average

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>🏈</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Veteran Trade Value Breakdown
        </h4>
      </div>

      {/* Player Info */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        marginBottom: 12,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          color: teamColor,
          marginBottom: 4,
        }}>
          {veteran.playerName} ({veteran.position}, Age {veteran.age})
        </div>
        <div style={{
          display: 'flex',
          gap: 16,
          fontSize: 12,
          color: isDark ? '#94a3b8' : '#64748b',
        }}>
          <span>
            Performance: <span style={{ color: performanceInfo.color, fontWeight: 600 }}>{performanceInfo.label}</span>
          </span>
          <span>
            Contract: {veteran.contractYearsRemaining} year{veteran.contractYearsRemaining !== 1 ? 's' : ''} remaining
          </span>
          {veteran.capHit > 0 && (
            <span>Cap Hit: ${(veteran.capHit / 1_000_000).toFixed(1)}M</span>
          )}
        </div>
      </div>

      {/* Calculation Breakdown */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: isDark ? '#94a3b8' : '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 10,
        }}>
          Value Calculation
        </div>

        {/* Step-by-step breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <CalculationRow
            label={`Base Value (${performanceInfo.label.split(' ')[0]} tier)`}
            value={`${veteran.baseValue.toLocaleString()} pts`}
            isDark={isDark}
          />

          <CalculationRow
            label={`× Age Multiplier (${veteran.age})`}
            value={`× ${veteran.ageMultiplier?.toFixed(2) || '1.00'}`}
            isDark={isDark}
            isMultiplier
          />

          <CalculationRow
            label="= Age Adjusted"
            value={`${veteran.ageAdjustedValue?.toLocaleString() || veteran.baseValue.toLocaleString()} pts`}
            isDark={isDark}
            isResult
          />

          <CalculationRow
            label={`× Contract (${veteran.contractYearsRemaining}yr ${veteran.contractYearsRemaining === 1 ? 'rental' : ''})`}
            value={`× ${veteran.contractMultiplier?.toFixed(2) || '1.00'}`}
            isDark={isDark}
            isMultiplier
          />

          <CalculationRow
            label="= Contract Adjusted"
            value={`${veteran.contractAdjustedValue?.toLocaleString() || '—'} pts`}
            isDark={isDark}
            isResult
          />

          {veteran.capMultiplier && veteran.capMultiplier !== 1 && (
            <CalculationRow
              label={`× Cap Discount ($${(veteran.capHit / 1_000_000).toFixed(0)}M)`}
              value={`× ${veteran.capMultiplier.toFixed(2)}`}
              isDark={isDark}
              isMultiplier
            />
          )}

          {veteran.positionMultiplier && veteran.positionMultiplier !== 1 && (
            <CalculationRow
              label={`× Position (${veteran.position})`}
              value={`× ${veteran.positionMultiplier.toFixed(2)}`}
              isDark={isDark}
              isMultiplier
            />
          )}

          {/* Divider */}
          <div style={{
            borderTop: `2px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
            margin: '4px 0',
          }} />

          {/* Final Value */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            borderRadius: 8,
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            border: `2px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
          }}>
            <span style={{
              fontSize: 13,
              fontWeight: 800,
              color: isDark ? '#93c5fd' : '#1d4ed8',
            }}>
              FINAL VALUE
            </span>
            <span style={{
              fontSize: 20,
              fontWeight: 800,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              {veteran.finalValue?.toLocaleString() || '—'} pts
            </span>
          </div>
        </div>
      </div>

      {/* Draft Pick Equivalent */}
      <div style={{
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#14532d20' : '#dcfce720',
        border: `1px solid ${isDark ? '#166534' : '#86efac'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 600,
          color: isDark ? '#86efac' : '#166534',
        }}>
          Draft Pick Equivalent
        </span>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 14,
            fontWeight: 700,
            color: isDark ? '#4ade80' : '#15803d',
          }}>
            {veteran.draftPickEquivalent || '—'}
          </div>
          {veteran.draftPickRange && (
            <div style={{
              fontSize: 11,
              color: isDark ? '#86efac' : '#166534',
            }}>
              Pick Range: #{veteran.draftPickRange.low} - #{veteran.draftPickRange.high}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CalculationRow({
  label,
  value,
  isDark,
  isMultiplier = false,
  isResult = false,
}: {
  label: string
  value: string
  isDark: boolean
  isMultiplier?: boolean
  isResult?: boolean
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 10px',
      borderRadius: 4,
      backgroundColor: isResult
        ? (isDark ? '#1e293b' : '#f1f5f9')
        : 'transparent',
    }}>
      <span style={{
        fontSize: 12,
        color: isMultiplier
          ? (isDark ? '#f59e0b' : '#d97706')
          : isResult
            ? (isDark ? '#e2e8f0' : '#334155')
            : (isDark ? '#94a3b8' : '#64748b'),
        fontWeight: isResult ? 600 : 400,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: isMultiplier ? 600 : 700,
        color: isMultiplier
          ? (isDark ? '#fbbf24' : '#b45309')
          : (isDark ? '#e2e8f0' : '#334155'),
        fontFamily: "'Space Grotesk', sans-serif",
      }}>
        {value}
      </span>
    </div>
  )
}
