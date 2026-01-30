'use client'
import { AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  code: string
  message: string
  player_name?: string
}

export interface ValidationState {
  status: 'idle' | 'validating' | 'valid' | 'warning' | 'invalid'
  issues: ValidationIssue[]
}

interface ValidationIndicatorProps {
  validation: ValidationState
  compact?: boolean
}

export function ValidationIndicator({ validation, compact = false }: ValidationIndicatorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  // Don't show anything while idle or validating (prevents blinking)
  if (validation.status === 'idle' || validation.status === 'validating') return null

  const statusConfig = {
    valid: { color: '#22c55e', label: 'Ready to grade', bg: '#22c55e15' },
    warning: { color: '#eab308', label: `${validation.issues.length} warning${validation.issues.length !== 1 ? 's' : ''}`, bg: '#eab30815' },
    invalid: { color: '#ef4444', label: `${validation.issues.filter(i => i.severity === 'error').length} issue${validation.issues.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}`, bg: '#ef444415' },
  }

  const config = statusConfig[validation.status as keyof typeof statusConfig]
  if (!config) return null

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 20,
          backgroundColor: config.bg,
          fontSize: '12px',
          fontWeight: 600,
          color: config.color,
        }}
      >
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: 10,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}30`,
        marginBottom: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: validation.issues.length > 0 ? 10 : 0 }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: config.color }}>
          {validation.status === 'valid' && 'Trade looks good!'}
          {validation.status === 'warning' && `${validation.issues.length} potential issue${validation.issues.length !== 1 ? 's' : ''}`}
          {validation.status === 'invalid' && 'Trade cannot proceed'}
        </span>
      </div>

      {/* Issues list */}
      <AnimatePresence>
        {validation.issues.length > 0 && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {validation.issues.map((issue, i) => (
                <div
                  key={`${issue.code}-${i}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '12px',
                    color: issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#eab308' : subText,
                  }}
                >
                  <span>
                    {issue.player_name && <strong>{issue.player_name}: </strong>}
                    {issue.message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
