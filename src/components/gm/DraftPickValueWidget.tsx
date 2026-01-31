'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface DraftPickValue {
  pickNumber: number
  round: number
  year: number
  jimmyJohnson: number
  richHill: number
  fitzgeraldSpielberger: number
  harvard: number
  gmSynthesized: number
  positionAdjusted?: number | null
  teamAdjusted?: number | null
  expectedSurplusValue?: number
  hitRate?: number
}

interface DraftPickValueWidgetProps {
  picks: DraftPickValue[]
  side: 'sent' | 'received'
  teamColor: string
}

export function DraftPickValueWidget({ picks, side, teamColor }: DraftPickValueWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!picks || picks.length === 0) return null

  const totalGmValue = picks.reduce((sum, p) => sum + (p.gmSynthesized || 0), 0)

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>📊</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Draft Pick Value Analysis ({side === 'sent' ? 'Sending' : 'Receiving'})
        </h4>
      </div>

      {picks.map((pick, idx) => (
        <div key={idx} style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          marginBottom: idx < picks.length - 1 ? 10 : 0,
        }}>
          <div style={{
            fontWeight: 700,
            fontSize: 14,
            color: teamColor,
            marginBottom: 10,
          }}>
            {pick.year} Round {pick.round} Pick {pick.pickNumber ? `(#${pick.pickNumber})` : ''}
          </div>

          {/* Value Systems Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 6,
            marginBottom: 12,
          }}>
            <ValueRow
              label="Jimmy Johnson"
              value={pick.jimmyJohnson}
              tooltip="Classic 1991 NFL draft chart - still widely used"
              isDark={isDark}
            />
            <ValueRow
              label="Rich Hill"
              value={pick.richHill}
              tooltip="Modern 2011 chart based on actual trade data"
              isDark={isDark}
            />
            <ValueRow
              label="Fitzgerald-Spielberger"
              value={pick.fitzgeraldSpielberger}
              tooltip="Data-driven surplus value model"
              isDark={isDark}
            />
            <ValueRow
              label="Harvard/Massey-Thaler"
              value={pick.harvard}
              tooltip="Academic model based on player performance"
              isDark={isDark}
            />
          </div>

          {/* GM Synthesized - Highlighted */}
          <div style={{
            padding: 10,
            borderRadius: 8,
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            border: `2px solid ${isDark ? '#3b82f6' : '#60a5fa'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: isDark ? '#93c5fd' : '#1d4ed8',
            }}>
              GM SYNTHESIZED VALUE
            </span>
            <span style={{
              fontSize: 18,
              fontWeight: 800,
              color: isDark ? '#60a5fa' : '#2563eb',
            }}>
              {pick.gmSynthesized?.toLocaleString() || '—'} pts
            </span>
          </div>

          {/* Additional Info */}
          {(pick.expectedSurplusValue || pick.hitRate) && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 10,
              fontSize: 11,
              color: isDark ? '#94a3b8' : '#64748b',
            }}>
              {pick.expectedSurplusValue && (
                <span>Expected Surplus: ${(pick.expectedSurplusValue / 1_000_000).toFixed(0)}M over 4 years</span>
              )}
              {pick.hitRate && (
                <span>Hit Rate: {(pick.hitRate * 100).toFixed(0)}%</span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Total Value */}
      {picks.length > 1 && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            color: isDark ? '#f1f5f9' : '#1e293b',
          }}>
            TOTAL DRAFT CAPITAL
          </span>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            color: teamColor,
          }}>
            {totalGmValue.toLocaleString()} pts
          </span>
        </div>
      )}
    </div>
  )
}

function ValueRow({
  label,
  value,
  tooltip,
  isDark,
}: {
  label: string
  value: number
  tooltip: string
  isDark: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 4,
        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      }}
      title={tooltip}
    >
      <span style={{
        fontSize: 11,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 12,
        fontWeight: 600,
        color: isDark ? '#e2e8f0' : '#334155',
      }}>
        {value?.toLocaleString() || '—'} pts
      </span>
    </div>
  )
}
