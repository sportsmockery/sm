'use client'

import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'table'
  title?: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

interface DataVisualizationProps {
  chartData: ChartData
  bonusInsight?: string
}

// Color palette for charts (SM brand colors)
const CHART_COLORS = [
  'rgba(188, 0, 0, 0.8)',      // SM red
  'rgba(255, 68, 68, 0.8)',    // Light red
  'rgba(59, 130, 246, 0.8)',   // Blue
  'rgba(16, 185, 129, 0.8)',   // Green
  'rgba(245, 158, 11, 0.8)',   // Amber
  'rgba(139, 92, 246, 0.8)',   // Purple
  'rgba(236, 72, 153, 0.8)',   // Pink
  'rgba(20, 184, 166, 0.8)',   // Teal
]

const CHART_BORDERS = [
  'rgba(188, 0, 0, 1)',
  'rgba(255, 68, 68, 1)',
  'rgba(59, 130, 246, 1)',
  'rgba(16, 185, 129, 1)',
  'rgba(245, 158, 11, 1)',
  'rgba(139, 92, 246, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(20, 184, 166, 1)',
]

export default function DataVisualization({ chartData, bonusInsight }: DataVisualizationProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  // Apply default colors if not provided
  const enhancedData = {
    labels: chartData.labels,
    datasets: chartData.datasets.map((dataset, idx) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || (chartData.type === 'pie' || chartData.type === 'doughnut'
        ? CHART_COLORS
        : CHART_COLORS[idx % CHART_COLORS.length]),
      borderColor: dataset.borderColor || (chartData.type === 'pie' || chartData.type === 'doughnut'
        ? CHART_BORDERS
        : CHART_BORDERS[idx % CHART_BORDERS.length]),
      borderWidth: dataset.borderWidth ?? 1,
    })),
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'var(--sm-text)',
          font: { size: 11 },
          padding: 10,
        },
      },
      title: {
        display: !!chartData.title,
        text: chartData.title || '',
        color: 'var(--sm-text)',
        font: { size: 14, weight: 'bold' as const },
        padding: { bottom: 15 },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: chartData.type === 'bar' || chartData.type === 'line' ? {
      x: {
        ticks: { color: 'var(--sm-text-muted)', font: { size: 10 } },
        grid: { color: 'var(--border-color)', display: false },
      },
      y: {
        ticks: { color: 'var(--sm-text-muted)', font: { size: 10 } },
        grid: { color: 'var(--border-color)' },
        beginAtZero: true,
      },
    } : undefined,
  }

  // Render table for tabular data
  if (chartData.type === 'table') {
    return (
      <div className="my-4">
        {chartData.title && (
          <h4 className="font-semibold mb-3" style={{ color: 'var(--sm-text)' }}>
            {chartData.title}
          </h4>
        )}
        <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid var(--border-color)' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-surface)' }}>
                <th className="px-3 py-2 text-left font-semibold" style={{ color: 'var(--sm-text)', borderBottom: '1px solid var(--border-color)' }}>
                  {chartData.datasets.length > 0 ? '' : 'Item'}
                </th>
                {chartData.datasets.map((ds, idx) => (
                  <th
                    key={idx}
                    className="px-3 py-2 text-right font-semibold"
                    style={{ color: 'var(--sm-text)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {ds.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {chartData.labels.map((label, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="hover:bg-opacity-50"
                  style={{ backgroundColor: rowIdx % 2 === 0 ? 'transparent' : 'var(--bg-surface)' }}
                >
                  <td
                    className="px-3 py-2 font-medium"
                    style={{ color: 'var(--sm-text)', borderBottom: '1px solid var(--border-color)' }}
                  >
                    {label}
                  </td>
                  {chartData.datasets.map((ds, colIdx) => (
                    <td
                      key={colIdx}
                      className="px-3 py-2 text-right tabular-nums"
                      style={{ color: 'var(--sm-text)', borderBottom: '1px solid var(--border-color)' }}
                    >
                      {typeof ds.data[rowIdx] === 'number'
                        ? ds.data[rowIdx].toLocaleString()
                        : ds.data[rowIdx]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bonusInsight && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(188, 0, 0, 0.1)' }}>
            <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
              <span className="font-semibold" style={{ color: '#bc0000' }}>Insight:</span> {bonusInsight}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Render chart
  const ChartComponent = {
    bar: Bar,
    line: Line,
    pie: Pie,
    doughnut: Doughnut,
  }[chartData.type]

  if (!ChartComponent) {
    return null
  }

  return (
    <div className="my-4" ref={chartRef}>
      <div
        className="rounded-lg p-4"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
      >
        <div style={{ height: chartData.type === 'pie' || chartData.type === 'doughnut' ? '250px' : '200px' }}>
          <ChartComponent data={enhancedData} options={chartOptions} />
        </div>
      </div>
      {bonusInsight && (
        <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(188, 0, 0, 0.1)' }}>
          <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
            <span className="font-semibold" style={{ color: '#bc0000' }}>Insight:</span> {bonusInsight}
          </p>
        </div>
      )}
    </div>
  )
}
