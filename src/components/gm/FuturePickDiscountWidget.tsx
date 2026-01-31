'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface FuturePickValue {
  pickNumber?: number
  round: number
  year: number
  yearsInFuture: number
  currentYearValue: number
  discountRate: number
  discountedValue: number
  equivalentCurrentPick?: string
}

interface FuturePickDiscountWidgetProps {
  picks: FuturePickValue[]
  teamColor: string
}

const DISCOUNT_EXPLANATIONS = [
  'Time value - immediate help more valuable',
  'Uncertainty - pick position unknown',
  'Coaching changes - new regime may not value',
]

export function FuturePickDiscountWidget({ picks, teamColor }: FuturePickDiscountWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // Only show for picks that are actually in the future
  const futurePicks = picks.filter(p => p.yearsInFuture > 0)
  if (futurePicks.length === 0) return null

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
        <span style={{ fontSize: 18 }}>⏳</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Future Pick Discount
        </h4>
      </div>

      {futurePicks.map((pick, idx) => {
        const discountPercent = Math.round((1 - pick.discountRate) * 100)
        const valueDropped = pick.currentYearValue - pick.discountedValue

        return (
          <div key={idx} style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: isDark ? '#0f172a' : '#ffffff',
            border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
            marginBottom: idx < futurePicks.length - 1 ? 10 : 0,
          }}>
            {/* Pick Info */}
            <div style={{
              fontWeight: 700,
              fontSize: 14,
              color: teamColor,
              marginBottom: 10,
            }}>
              {pick.year} Round {pick.round} Pick ({pick.yearsInFuture} Year{pick.yearsInFuture !== 1 ? 's' : ''} Away)
            </div>

            {/* Value Calculation */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginBottom: 12,
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
              }}>
                <span style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                  If traded today:
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e2e8f0' : '#334155' }}>
                  {pick.currentYearValue.toLocaleString()} pts
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '6px 10px',
                borderRadius: 4,
                backgroundColor: isDark ? '#7f1d1d20' : '#fef2f2',
              }}>
                <span style={{ fontSize: 12, color: isDark ? '#fca5a5' : '#dc2626' }}>
                  Future discount:
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#ef4444' }}>
                  -{discountPercent}%
                </span>
              </div>

              {/* Divider */}
              <div style={{
                borderTop: `1px dashed ${isDark ? '#334155' : '#cbd5e1'}`,
                margin: '4px 0',
              }} />

              {/* Discounted Value */}
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
                  fontSize: 12,
                  fontWeight: 700,
                  color: isDark ? '#93c5fd' : '#1d4ed8',
                }}>
                  Discounted value:
                </span>
                <span style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: isDark ? '#60a5fa' : '#2563eb',
                }}>
                  {pick.discountedValue.toLocaleString()} pts
                </span>
              </div>
            </div>

            {/* Equivalent Pick */}
            {pick.equivalentCurrentPick && (
              <div style={{
                padding: 10,
                borderRadius: 6,
                backgroundColor: isDark ? '#14532d20' : '#dcfce720',
                border: `1px solid ${isDark ? '#166534' : '#86efac'}`,
                marginBottom: 12,
              }}>
                <div style={{
                  fontSize: 12,
                  color: isDark ? '#86efac' : '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span>≈</span>
                  <span>Equivalent to: <strong>{pick.equivalentCurrentPick}</strong></span>
                </div>
              </div>
            )}

            {/* Warning/Explanation */}
            <div style={{
              padding: 10,
              borderRadius: 6,
              backgroundColor: isDark ? '#78350f20' : '#fef3c7',
              border: `1px solid ${isDark ? '#92400e' : '#fbbf24'}`,
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 600,
                color: isDark ? '#fcd34d' : '#92400e',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span>⚠️</span>
                Future picks discounted due to:
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: 20,
                fontSize: 11,
                color: isDark ? '#fde68a' : '#78350f',
                lineHeight: 1.6,
              }}>
                {DISCOUNT_EXPLANATIONS.map((exp, i) => (
                  <li key={i}>{exp}</li>
                ))}
              </ul>
            </div>
          </div>
        )
      })}

      {/* Discount Rate Reference */}
      <div style={{
        marginTop: 12,
        padding: 10,
        borderRadius: 6,
        backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
        fontSize: 10,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Discount Rate Reference:</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <span>Current: 0%</span>
          <span>1 Year: 15%</span>
          <span>2 Years: 28%</span>
          <span>3+ Years: 40%</span>
        </div>
      </div>
    </div>
  )
}
