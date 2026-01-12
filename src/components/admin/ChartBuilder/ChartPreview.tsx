'use client'

import { useMemo } from 'react'
import { ChartConfig } from './ChartBuilderModal'
import { teamColors } from './ChartColorPicker'
import BarChart from './charts/BarChart'
import LineChart from './charts/LineChart'
import PieChart from './charts/PieChart'
import PlayerComparison from './charts/PlayerComparison'
import TeamStats from './charts/TeamStats'

interface ChartPreviewProps {
  config: ChartConfig
}

export default function ChartPreview({ config }: ChartPreviewProps) {
  const { type, title, data, colors, size } = config

  const chartColors = useMemo(() => {
    if (colors.scheme === 'team' && colors.team) {
      const team = teamColors[colors.team]
      return {
        primary: team.primary,
        secondary: team.secondary,
        gradient: [team.primary, team.secondary],
      }
    }
    const customColor = colors.customColors?.[0] || '#FF0000'
    return {
      primary: customColor,
      secondary: customColor,
      gradient: [customColor, customColor],
    }
  }, [colors])

  const sizeClasses = {
    small: 'max-w-xs',
    medium: 'max-w-md',
    large: 'max-w-lg',
    full: 'w-full',
  }

  const hasValidData = data.length >= 2 && data.some((d) => d.label && d.value)

  if (!hasValidData) {
    return (
      <div className={`${sizeClasses[size]} mx-auto`}>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <svg className="w-12 h-12 text-zinc-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-zinc-500">Enter data to see preview</p>
            <p className="text-xs text-zinc-600 mt-1">Add at least 2 data points with labels</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto`}>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl">
        {/* Chart Title */}
        {title && (
          <h3 className="text-lg font-bold text-white mb-4 font-heading">
            {title}
          </h3>
        )}

        {/* Chart Content */}
        <div className="min-h-[200px]">
          {type === 'bar' && (
            <BarChart
              data={data}
              colors={chartColors}
              animate={false}
            />
          )}
          {type === 'line' && (
            <LineChart
              data={data}
              colors={chartColors}
              animate={false}
            />
          )}
          {type === 'pie' && (
            <PieChart
              data={data}
              colors={chartColors}
              animate={false}
            />
          )}
          {type === 'player-comparison' && (
            <PlayerComparison
              data={data}
              colors={chartColors}
              animate={false}
            />
          )}
          {type === 'team-stats' && (
            <TeamStats
              data={data}
              colors={chartColors}
              animate={false}
            />
          )}
        </div>

        {/* Chart Footer */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <span>Source: SportsMockery Data Lab</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: chartColors.primary }} />
            {colors.scheme === 'team' && colors.team
              ? teamColors[colors.team].name
              : 'Custom'}
          </span>
        </div>
      </div>
    </div>
  )
}
