'use client'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export type TrendDirection = 'hot' | 'rising' | 'stable' | 'declining' | 'cold'

interface PlayerTrendBadgeProps {
  trend?: TrendDirection | null
  performanceVsProjection?: number | null // -100 to +100
  marketSentiment?: 'buy' | 'hold' | 'sell' | null
  compact?: boolean
}

const TREND_CONFIG: Record<TrendDirection, { emoji: string; label: string; color: string; bgColor: string }> = {
  hot: { emoji: '🔥', label: 'Hot', color: '#ef4444', bgColor: '#ef444420' },
  rising: { emoji: '📈', label: 'Rising', color: '#22c55e', bgColor: '#22c55e20' },
  stable: { emoji: '➡️', label: 'Stable', color: '#6b7280', bgColor: '#6b728020' },
  declining: { emoji: '📉', label: 'Declining', color: '#eab308', bgColor: '#eab30820' },
  cold: { emoji: '❄️', label: 'Cold', color: '#3b82f6', bgColor: '#3b82f620' },
}

export function PlayerTrendBadge({ trend, performanceVsProjection, marketSentiment, compact = false }: PlayerTrendBadgeProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!trend) return null

  const config = TREND_CONFIG[trend]

  if (compact) {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title={`${config.label}${performanceVsProjection ? ` (${performanceVsProjection > 0 ? '+' : ''}${performanceVsProjection}% vs projection)` : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          fontSize: '12px',
          borderRadius: '50%',
          backgroundColor: config.bgColor,
        }}
      >
        {config.emoji}
      </motion.span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 6,
        backgroundColor: config.bgColor,
        fontSize: '10px',
        fontWeight: 600,
      }}
    >
      <span style={{ fontSize: '12px' }}>{config.emoji}</span>
      <span style={{ color: config.color }}>{config.label}</span>
      {performanceVsProjection !== null && performanceVsProjection !== undefined && (
        <span style={{
          color: performanceVsProjection > 0 ? '#22c55e' : performanceVsProjection < 0 ? '#ef4444' : '#6b7280',
          fontSize: '9px',
        }}>
          {performanceVsProjection > 0 ? '+' : ''}{performanceVsProjection}%
        </span>
      )}
      {marketSentiment && (
        <span style={{
          padding: '1px 4px',
          borderRadius: 4,
          fontSize: '8px',
          fontWeight: 700,
          textTransform: 'uppercase',
          backgroundColor: isDark ? '#1f293780' : '#f3f4f680',
          color: marketSentiment === 'buy' ? '#22c55e' : marketSentiment === 'sell' ? '#ef4444' : '#6b7280',
        }}>
          {marketSentiment}
        </span>
      )}
    </motion.div>
  )
}

export function getTrendFromStats(stats: Record<string, any>, sport: string): TrendDirection | null {
  // Calculate trend based on recent performance
  // This is a simplified heuristic - Data Lab will provide actual trend data
  if (!stats || !stats.games) return null

  // For now, return null as Data Lab will provide the actual trend
  // This function can be used as a fallback calculation
  return null
}
