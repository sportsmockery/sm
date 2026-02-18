'use client'
import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface TeamFitRadarProps {
  breakdown: {
    positional_need: number
    age_fit: number
    cap_fit: number
    scheme_fit: number
  }
  teamColor?: string
  size?: number
}

const LABELS = [
  { key: 'positional_need', label: 'Position Need', angle: -90 },
  { key: 'age_fit', label: 'Age Fit', angle: 0 },
  { key: 'cap_fit', label: 'Cap Fit', angle: 90 },
  { key: 'scheme_fit', label: 'Scheme Fit', angle: 180 },
] as const

export function TeamFitRadar({ breakdown, teamColor = '#bc0000', size = 200 }: TeamFitRadarProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const center = size / 2
  const radius = (size / 2) - 40

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up for retina displays
    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, size, size)

    // Colors
    const gridColor = 'var(--sm-border)'
    const textColor = 'var(--sm-text-muted)'

    // Draw concentric circles (grid)
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath()
      ctx.arc(center, center, (radius * i) / 4, 0, Math.PI * 2)
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Draw axis lines
    LABELS.forEach(({ angle }) => {
      const radian = (angle * Math.PI) / 180
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.lineTo(
        center + Math.cos(radian) * radius,
        center + Math.sin(radian) * radius
      )
      ctx.strokeStyle = gridColor
      ctx.lineWidth = 1
      ctx.stroke()
    })

    // Draw data polygon
    ctx.beginPath()
    LABELS.forEach(({ key, angle }, i) => {
      const value = breakdown[key] / 100
      const radian = (angle * Math.PI) / 180
      const x = center + Math.cos(radian) * radius * value
      const y = center + Math.sin(radian) * radius * value

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.closePath()
    ctx.fillStyle = `${teamColor}40`
    ctx.fill()
    ctx.strokeStyle = teamColor
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw data points
    LABELS.forEach(({ key, angle }) => {
      const value = breakdown[key] / 100
      const radian = (angle * Math.PI) / 180
      const x = center + Math.cos(radian) * radius * value
      const y = center + Math.sin(radian) * radius * value

      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fillStyle = teamColor
      ctx.fill()
      ctx.strokeStyle = isDark ? '#1f2937' : '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw labels
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillStyle = textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    LABELS.forEach(({ key, label, angle }) => {
      const radian = (angle * Math.PI) / 180
      const labelRadius = radius + 25
      const x = center + Math.cos(radian) * labelRadius
      const y = center + Math.sin(radian) * labelRadius

      ctx.fillText(label, x, y)

      // Value below label
      ctx.font = 'bold 12px system-ui, sans-serif'
      ctx.fillStyle = teamColor
      ctx.fillText(`${breakdown[key]}`, x, y + 14)
      ctx.font = '11px system-ui, sans-serif'
      ctx.fillStyle = textColor
    })
  }, [breakdown, teamColor, isDark, size, center, radius])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
      />
    </motion.div>
  )
}

// Simple bar chart alternative for mobile/accessibility
export function TeamFitBars({ breakdown, teamColor = '#bc0000' }: Omit<TeamFitRadarProps, 'size'>) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = 'var(--sm-text-muted)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {LABELS.map(({ key, label }) => {
        const value = breakdown[key]
        const barColor = value >= 70 ? '#22c55e' : value >= 50 ? '#eab308' : '#ef4444'

        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sm-text)' }}>
                {label}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: teamColor }}>
                {value}
              </span>
            </div>
            <div style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'var(--sm-border)',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  height: '100%',
                  borderRadius: 4,
                  backgroundColor: barColor,
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
