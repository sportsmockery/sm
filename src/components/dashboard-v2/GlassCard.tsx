'use client'

import { useState, type ReactNode } from 'react'

interface GlassCardProps {
  children: ReactNode
  className?: string
  /** Optional accent color for left border highlight */
  accent?: string
  /** Card title shown in header */
  title?: string
  /** Optional subtitle / metadata */
  subtitle?: string
  /** If true, card is collapsible with toggle */
  collapsible?: boolean
  /** Default collapsed state */
  defaultCollapsed?: boolean
  /** Optional action element in header (filter, button, etc.) */
  headerAction?: ReactNode
  /** If provided, shows a drill-down arrow that calls this */
  onDrillDown?: () => void
  /** Padding override */
  noPadding?: boolean
}

export default function GlassCard({
  children,
  className = '',
  accent,
  title,
  subtitle,
  collapsible = false,
  defaultCollapsed = false,
  headerAction,
  onDrillDown,
  noPadding = false,
}: GlassCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)

  return (
    <div
      className={`rounded-2xl border backdrop-blur-sm transition-all duration-200 ${className}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.55)',
        borderColor: 'rgba(255,255,255,0.7)',
        boxShadow: '0 2px 16px rgba(11,15,20,0.04), 0 0 0 1px rgba(255,255,255,0.6) inset',
        borderLeft: accent ? `3px solid ${accent}` : undefined,
      }}
    >
      {/* Header — only if title is provided */}
      {title && (
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: collapsed ? 'none' : '1px solid rgba(11,15,20,0.05)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {collapsible && (
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-0.5 rounded transition-transform"
                style={{
                  color: 'rgba(11,15,20,0.35)',
                  transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold tracking-wide" style={{ color: '#0B0F14' }}>
                {title}
              </h3>
              {subtitle && (
                <span className="text-[11px]" style={{ color: 'rgba(11,15,20,0.4)' }}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerAction}
            {onDrillDown && (
              <button
                onClick={onDrillDown}
                className="p-1 rounded-lg transition-colors"
                style={{ color: 'rgba(11,15,20,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#00D4FF' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(11,15,20,0.3)' }}
                title="Drill down"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      {!collapsed && (
        <div className={noPadding ? '' : 'px-5 py-4'}>
          {children}
        </div>
      )}
    </div>
  )
}
