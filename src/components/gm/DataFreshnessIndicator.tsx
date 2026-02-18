'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { DataFreshness } from '@/types/gm'

interface DataFreshnessIndicatorProps {
  freshness: DataFreshness
  isDark?: boolean
  compact?: boolean
}

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

export function DataFreshnessIndicator({
  freshness,
  isDark = false,
  compact = false,
}: DataFreshnessIndicatorProps) {
  const [expanded, setExpanded] = useState(false)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const borderColor = 'var(--sm-border)'

  // Determine status color
  const getStatusColor = () => {
    if (freshness.is_stale) return '#ef4444' // Red for stale
    if (freshness.age_hours > 12) return '#eab308' // Yellow for aging
    return '#22c55e' // Green for fresh
  }

  const statusColor = getStatusColor()
  const statusLabel = freshness.is_stale ? 'Stale' : freshness.age_hours > 12 ? 'Aging' : 'Fresh'

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 8px',
          borderRadius: 6,
          backgroundColor: `${statusColor}15`,
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
        title={`Data updated ${formatTimeAgo(freshness.roster_updated_at)}`}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: statusColor,
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 500, color: statusColor }}>
          {statusLabel}
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${freshness.is_stale ? '#ef444430' : borderColor}`,
        backgroundColor: isDark ? '#1f2937' : '#fff',
        overflow: 'hidden',
      }}
    >
      {/* Header - clickable to expand */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          cursor: 'pointer',
          backgroundColor: freshness.is_stale
            ? isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)'
            : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: statusColor,
            }}
          />
          <span style={{ fontSize: 12, fontWeight: 600, color: textColor }}>
            Data Status: {statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: subText }}>
            {freshness.age_hours < 1 ? 'Updated just now' : `${Math.round(freshness.age_hours)}h old`}
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={subText}
            strokeWidth="2"
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Warning banner if stale */}
      {freshness.is_stale && freshness.warning && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
            borderTop: `1px solid ${isDark ? '#ef444430' : '#fecaca'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontSize: 14 }}>⚠️</span>
          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>
            {freshness.warning}
          </span>
        </div>
      )}

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div
              style={{
                padding: 12,
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <DataRow
                label="Roster Data"
                timestamp={freshness.roster_updated_at}
                isDark={isDark}
              />
              <DataRow
                label="Player Stats"
                timestamp={freshness.stats_updated_at}
                isDark={isDark}
              />
              <DataRow
                label="Contract Info"
                timestamp={freshness.contracts_updated_at}
                isDark={isDark}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DataRow({
  label,
  timestamp,
  isDark,
}: {
  label: string
  timestamp: string
  isDark: boolean
}) {
  const subText = 'var(--sm-text-muted)'
  const textColor = 'var(--sm-text)'
  const timeAgo = formatTimeAgo(timestamp)

  // Determine color based on age
  const date = new Date(timestamp)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  const ageColor =
    diffHours > 24 ? '#ef4444' : diffHours > 12 ? '#eab308' : '#22c55e'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderRadius: 6,
        backgroundColor: isDark ? '#111827' : '#f9fafb',
      }}
    >
      <span style={{ fontSize: 11, color: subText }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, color: ageColor }}>
        {timeAgo}
      </span>
    </div>
  )
}

export default DataFreshnessIndicator
