'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2'
import { motion, useInView } from 'framer-motion'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Title,
  Tooltip,
  Legend
)

// Team color schemes
const teamColors: Record<string, string[]> = {
  bears: ['#0B162A', '#C83803', '#FFB612', '#1E3A5F'],
  bulls: ['#CE1141', '#000000', '#FFFFFF', '#8B0000'],
  cubs: ['#0E3386', '#CC3433', '#FFFFFF', '#1E5FA0'],
  whitesox: ['#27251F', '#C4CED4', '#FFFFFF', '#4A4A4A'],
  blackhawks: ['#CF0A2C', '#000000', '#FFD100', '#8B0000'],
  default: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#10B981'],
}

interface ChartData {
  label: string
  value: number
}

interface ChartConfig {
  type: string
  title: string
  size?: string
  colors?: {
    scheme: string
    team?: string
    custom?: string[]
  }
  data: ChartData[]
}

interface ChartEmbedProps {
  id?: string
  config?: ChartConfig
  className?: string
}

export default function ChartEmbed({ id, config: propConfig, className = '' }: ChartEmbedProps) {
  const [config, setConfig] = useState<ChartConfig | null>(propConfig || null)
  const [loading, setLoading] = useState(!propConfig && !!id)
  const [error, setError] = useState<string | null>(null)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  // Fetch chart data if ID provided
  useEffect(() => {
    if (id && !propConfig) {
      fetchChart()
    }
  }, [id, propConfig])

  // Trigger animation when in view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
    }
  }, [isInView, hasAnimated])

  async function fetchChart() {
    try {
      setLoading(true)
      const res = await fetch(`/api/charts/${id}`)
      if (!res.ok) throw new Error('Chart not found')
      const data = await res.json()
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
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error || !config) {
    return (
      <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-8 ${className}`}>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          <svg className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm">{error || 'Chart not available'}</p>
        </div>
      </div>
    )
  }

  // Get colors based on configuration
  const colors = config.colors?.scheme === 'team' && config.colors?.team
    ? teamColors[config.colors.team] || teamColors.default
    : config.colors?.custom || teamColors.default

  // Prepare chart data
  const chartData = {
    labels: config.data.map(d => d.label),
    datasets: [{
      label: config.title,
      data: config.data.map(d => d.value),
      backgroundColor: colors.map(c => `${c}CC`), // Add transparency
      borderColor: colors,
      borderWidth: 2,
      fill: config.type === 'area',
      tension: 0.4,
    }],
  }

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: hasAnimated ? 1000 : 0,
    },
    plugins: {
      legend: {
        display: config.type !== 'bar' && config.type !== 'line' && config.type !== 'area',
        position: 'bottom' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
          padding: 20,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: config.type === 'bar' || config.type === 'line' || config.type === 'area' ? {
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
      y: {
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
      },
    } : undefined,
  }

  // Determine chart size class
  const sizeClasses = {
    small: 'h-48',
    medium: 'h-64',
    large: 'h-80',
    full: 'h-96',
  }
  const heightClass = sizeClasses[config.size as keyof typeof sizeClasses] || sizeClasses.medium

  // Render appropriate chart type
  const renderChart = () => {
    switch (config.type) {
      case 'bar':
        return <Bar data={chartData} options={options} />
      case 'line':
      case 'area':
        return <Line data={chartData} options={options} />
      case 'pie':
        return <Pie data={chartData} options={options} />
      case 'donut':
        return <Doughnut data={chartData} options={options} />
      case 'radar':
        return <Radar data={chartData} options={options} />
      case 'polar':
        return <PolarArea data={chartData} options={options} />
      default:
        return <Bar data={chartData} options={options} />
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1f] p-6 hover:shadow-lg transition-shadow ${className}`}
    >
      {/* Chart Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {config.title}
      </h3>

      {/* Chart Container */}
      <div className={heightClass}>
        {renderChart()}
      </div>

      {/* Chart Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Data visualized by Sports Mockery
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-purple-500">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          Interactive Chart
        </span>
      </div>
    </motion.div>
  )
}
