'use client'

import { useMemo } from 'react'

interface MiniChartProps {
  /** Array of numeric values to plot */
  data: number[]
  /** Chart width in px */
  width?: number
  /** Chart height in px */
  height?: number
  /** Line/fill color */
  color?: string
  /** Show filled area under the line */
  filled?: boolean
  /** Show interactive hover dots */
  interactive?: boolean
  /** Labels for each data point (shown on hover) */
  labels?: string[]
}

export default function MiniChart({
  data,
  width = 120,
  height = 36,
  color = '#00D4FF',
  filled = true,
  interactive = false,
  labels,
}: MiniChartProps) {
  const path = useMemo(() => {
    if (data.length < 2) return ''
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padY = 3
    const plotH = height - padY * 2

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + plotH - ((v - min) / range) * plotH,
    }))

    // Smooth curve through points
    let d = `M${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
    }
    return d
  }, [data, width, height])

  const areaPath = useMemo(() => {
    if (!filled || !path) return ''
    return `${path} L${width},${height} L0,${height} Z`
  }, [filled, path, width, height])

  if (data.length < 2) return null

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      {filled && areaPath && (
        <path
          d={areaPath}
          fill={`${color}15`}
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (() => {
        const min = Math.min(...data)
        const max = Math.max(...data)
        const range = max - min || 1
        const padY = 3
        const plotH = height - padY * 2
        const lastVal = data[data.length - 1]
        const cx = width
        const cy = padY + plotH - ((lastVal - min) / range) * plotH
        return <circle cx={cx} cy={cy} r="2.5" fill={color} />
      })()}
    </svg>
  )
}

/** Horizontal bar chart for comparing values */
export function BarChart({
  items,
  maxValue,
  color = '#00D4FF',
}: {
  items: { label: string; value: number; sublabel?: string }[]
  maxValue?: number
  color?: string
}) {
  const max = maxValue || Math.max(...items.map(i => i.value), 1)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[11px] font-medium" style={{ color: '#0B0F14' }}>{item.label}</span>
            <span className="text-[11px] font-medium tabular-nums" style={{ color }}>
              {item.sublabel || item.value}
            </span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(11,15,20,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Donut / ring gauge for single 0-100 metrics */
export function RingGauge({
  value,
  label,
  size = 56,
  color,
}: {
  value: number
  label?: string
  size?: number
  color?: string
}) {
  const strokeW = 4
  const r = (size - strokeW) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const gaugeColor = color || (value >= 60 ? '#00D4FF' : value >= 40 ? '#D6B05E' : '#BC0000')

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(11,15,20,0.06)" strokeWidth={strokeW}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={gaugeColor} strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
        <text
          x={size / 2} y={size / 2}
          textAnchor="middle" dominantBaseline="central"
          fill="#0B0F14" fontSize="13" fontWeight="700" fontFamily="inherit"
        >
          {value}
        </text>
      </svg>
      {label && (
        <span className="text-[10px] font-medium" style={{ color: 'rgba(11,15,20,0.45)' }}>{label}</span>
      )}
    </div>
  )
}
