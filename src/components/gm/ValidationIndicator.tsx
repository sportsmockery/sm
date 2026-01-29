'use client'
import { motion, AnimatePresence } from 'framer-motion'
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

  if (validation.status === 'idle') return null

  const statusConfig = {
    validating: { color: '#6b7280', emoji: '...', label: 'Validating', bg: '#6b728020' },
    valid: { color: '#22c55e', emoji: '', label: 'Ready to grade', bg: '#22c55e15' },
    warning: { color: '#eab308', emoji: '', label: `${validation.issues.length} warning${validation.issues.length !== 1 ? 's' : ''}`, bg: '#eab30815' },
    invalid: { color: '#ef4444', emoji: '', label: `${validation.issues.filter(i => i.severity === 'error').length} issue${validation.issues.filter(i => i.severity === 'error').length !== 1 ? 's' : ''}`, bg: '#ef444415' },
    idle: { color: '#6b7280', emoji: '', label: '', bg: 'transparent' },
  }

  const config = statusConfig[validation.status]

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
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
        <span style={{ fontSize: '14px' }}>{config.emoji}</span>
        {validation.status === 'validating' ? (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            Checking...
          </motion.span>
        ) : (
          <span>{config.label}</span>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
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
        <span style={{ fontSize: '18px' }}>{config.emoji}</span>
        {validation.status === 'validating' ? (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            style={{ fontSize: '14px', fontWeight: 600, color: config.color }}
          >
            Validating trade...
          </motion.span>
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 600, color: config.color }}>
            {validation.status === 'valid' && 'Trade looks good!'}
            {validation.status === 'warning' && `${validation.issues.length} potential issue${validation.issues.length !== 1 ? 's' : ''}`}
            {validation.status === 'invalid' && 'Trade cannot proceed'}
          </span>
        )}
      </div>

      {/* Issues list */}
      <AnimatePresence>
        {validation.issues.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {validation.issues.map((issue, i) => (
                <motion.div
                  key={`${issue.code}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    fontSize: '12px',
                    color: issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#eab308' : subText,
                  }}
                >
                  <span style={{ flexShrink: 0 }}>
                    {issue.severity === 'error' ? '' : issue.severity === 'warning' ? '' : ''}
                  </span>
                  <span>
                    {issue.player_name && <strong>{issue.player_name}: </strong>}
                    {issue.message}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
