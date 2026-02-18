'use client'

import { useState } from 'react'
import { ChartConfig } from '../admin/ChartBuilder/ChartBuilderModal'
import { teamColors } from '../admin/ChartBuilder/ChartColorPicker'

interface ChartPlaceholderProps {
  config: ChartConfig
  onEdit?: () => void
  onRemove?: () => void
  isEditable?: boolean
}

const chartTypeIcons: Record<string, React.ReactNode> = {
  bar: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="9" width="4" height="12" rx="1" />
    </svg>
  ),
  line: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3,17 8,11 13,14 21,6" />
    </svg>
  ),
  pie: (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8v8l6.93 4.01C17.21 17.91 14.76 20 12 20z" />
    </svg>
  ),
  'player-comparison': (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="7" cy="7" r="4" />
      <circle cx="17" cy="7" r="4" />
      <path d="M3 21v-2a4 4 0 014-4h2M15 15h2a4 4 0 014 4v2" />
    </svg>
  ),
  'team-stats': (
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
    </svg>
  ),
}

const chartTypeLabels: Record<string, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  'player-comparison': 'Player Comparison',
  'team-stats': 'Team Stats',
}

export default function ChartPlaceholder({
  config,
  onEdit,
  onRemove,
  isEditable = true,
}: ChartPlaceholderProps) {
  const [isHovered, setIsHovered] = useState(false)

  const primaryColor = config.colors.scheme === 'team' && config.colors.team
    ? teamColors[config.colors.team].primary
    : config.colors.customColors?.[0] || '#8B0000'

  const dataPointCount = config.data.filter(d => d.label && d.value).length

  return (
    <div
      className="relative my-6 rounded-xl border-2 border-dashed overflow-hidden transition-all duration-200"
      style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Chart Icon */}
          <div
            className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <div style={{ color: primaryColor }}>
              {chartTypeIcons[config.type] || chartTypeIcons.bar}
            </div>
          </div>

          {/* Chart Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--sm-surface)] text-[var(--sm-text)]">
                {chartTypeLabels[config.type]}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium rounded-full text-[var(--sm-text-muted)] bg-[var(--sm-surface)]">
                {config.size}
              </span>
            </div>

            <h4 className="text-lg font-bold text-[var(--sm-text)] truncate">
              {config.title || 'Untitled Chart'}
            </h4>

            <div className="mt-2 flex items-center gap-4 text-sm text-[var(--sm-text-muted)]">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                {dataPointCount} data points
              </span>

              {config.colors.scheme === 'team' && config.colors.team && (
                <span className="flex items-center gap-1">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: primaryColor }}
                  />
                  {teamColors[config.colors.team].name}
                </span>
              )}

              {config.dataSource === 'datalab' && (
                <span className="flex items-center gap-1 text-blue-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Data Lab
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mini Preview */}
        <div className="mt-4 h-20 rounded-lg flex items-end justify-center gap-1 p-2 overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
          {config.type === 'bar' && config.data.slice(0, 6).map((d, i) => (
            <div
              key={i}
              className="flex-1 max-w-8 rounded-t transition-all"
              style={{
                height: `${Math.max(10, (d.value / Math.max(...config.data.map(x => x.value))) * 100)}%`,
                backgroundColor: primaryColor,
                opacity: 0.6 + (i * 0.1),
              }}
            />
          ))}
          {config.type === 'line' && (
            <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke={primaryColor}
                strokeWidth="2"
                points={config.data.map((d, i) => {
                  const x = (i / (config.data.length - 1)) * 100
                  const y = 50 - (d.value / Math.max(...config.data.map(x => x.value))) * 45
                  return `${x},${y}`
                }).join(' ')}
              />
            </svg>
          )}
          {config.type === 'pie' && (
            <div className="w-16 h-16 rounded-full overflow-hidden relative" style={{ background: `conic-gradient(${config.data.map((d, i) => {
              const total = config.data.reduce((sum, x) => sum + x.value, 0)
              const percent = (d.value / total) * 100
              const color = i === 0 ? primaryColor : `${primaryColor}${Math.max(20, 80 - i * 20).toString(16)}`
              return `${color} 0`
            }).join(', ')})` }} />
          )}
          {(config.type === 'player-comparison' || config.type === 'team-stats') && (
            <div className="text-4xl" style={{ color: 'var(--sm-text-dim)' }}>📊</div>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      {isEditable && isHovered && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center gap-3 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium text-sm hover:bg-zinc-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Chart
            </button>
          )}
          {onRemove && (
            <button
              onClick={onRemove}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          )}
        </div>
      )}

      {/* Editor Badge */}
      <div className="absolute top-3 right-3">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
          Chart Block
        </span>
      </div>
    </div>
  )
}
