'use client'

import { useEffect, useState } from 'react'
import BarChart from '../admin/ChartBuilder/charts/BarChart'
import LineChart from '../admin/ChartBuilder/charts/LineChart'
import PieChart from '../admin/ChartBuilder/charts/PieChart'
import PlayerComparison from '../admin/ChartBuilder/charts/PlayerComparison'
import TeamStats from '../admin/ChartBuilder/charts/TeamStats'
import { teamColors } from '../admin/ChartBuilder/ChartColorPicker'
import { ChartConfig } from '../admin/ChartBuilder/ChartBuilderModal'

interface ArticleChartProps {
  chartId?: string
  config?: ChartConfig
  className?: string
}

// Size dimensions mapping
const sizeMap = {
  small: { width: 300, height: 200 },
  medium: { width: 450, height: 280 },
  large: { width: 600, height: 350 },
  full: { width: 800, height: 400 },
}

export default function ArticleChart({ chartId, config: propConfig, className = '' }: ArticleChartProps) {
  const [config, setConfig] = useState<ChartConfig | null>(propConfig || null)
  const [loading, setLoading] = useState(!propConfig && !!chartId)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // Fetch chart config if chartId provided
  useEffect(() => {
    if (chartId && !propConfig) {
      fetchChartConfig(chartId)
    }
  }, [chartId, propConfig])

  // Intersection observer for animate on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    const element = document.getElementById(`chart-${chartId || 'inline'}`)
    if (element) {
      observer.observe(element)
    }

    return () => observer.disconnect()
  }, [chartId])

  const fetchChartConfig = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/charts/${id}`)
      if (!response.ok) throw new Error('Failed to fetch chart')
      const data = await response.json()
      setConfig(data)
    } catch (err) {
      setError('Failed to load chart')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="rounded-xl bg-[var(--sm-surface)] p-6">
          <div className="h-6 w-48 bg-[var(--sm-surface)] rounded mb-4" />
          <div className="h-64 bg-[var(--sm-surface)] rounded" />
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 p-6 ${className}`}>
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error || 'Chart not found'}</span>
        </div>
      </div>
    )
  }

  const { type, title, data, colors, size } = config
  const dimensions = sizeMap[size]

  // Get chart colors
  const chartColors = colors.scheme === 'team' && colors.team
    ? {
        primary: teamColors[colors.team].primary,
        secondary: teamColors[colors.team].secondary,
        gradient: [teamColors[colors.team].primary, teamColors[colors.team].secondary],
      }
    : {
        primary: colors.customColors?.[0] || '#FF0000',
        secondary: colors.customColors?.[0] || '#FF0000',
        gradient: [colors.customColors?.[0] || '#FF0000', colors.customColors?.[0] || '#FF0000'],
      }

  const renderChart = () => {
    const commonProps = {
      data,
      colors: chartColors,
      animate: isVisible,
      width: dimensions.width,
      height: dimensions.height,
    }

    switch (type) {
      case 'bar':
        return <BarChart {...commonProps} />
      case 'line':
        return <LineChart {...commonProps} />
      case 'pie':
        return <PieChart {...commonProps} />
      case 'player-comparison':
        return <PlayerComparison {...commonProps} />
      case 'team-stats':
        return <TeamStats {...commonProps} />
      default:
        return <BarChart {...commonProps} />
    }
  }

  return (
    <figure
      id={`chart-${chartId || 'inline'}`}
      className={`my-8 ${size === 'full' ? 'w-full' : 'mx-auto'} ${className}`}
      style={{ maxWidth: size === 'full' ? '100%' : dimensions.width }}
    >
      <div className="rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
        {/* Chart Header */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-heading" style={{ color: 'var(--sm-text)' }}>
              {title}
            </h3>
            <div className="flex items-center gap-2">
              {colors.scheme === 'team' && colors.team && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: chartColors.primary }}
                  />
                  {teamColors[colors.team].name}
                </span>
              )}
              <button
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--sm-text-dim)' }}
                title="Share chart"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Content */}
        <div className="p-6 flex justify-center">
          {renderChart()}
        </div>

        {/* Chart Footer */}
        <div className="px-6 py-3" style={{ borderTop: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              SportsMockery Data Lab
            </span>
            <span>Interactive chart</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      {config.dataLabQuery && (
        <figcaption className="mt-2 text-center text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          Data: {config.dataLabQuery.statCategory} • {config.dataLabQuery.season} Season
        </figcaption>
      )}
    </figure>
  )
}
