'use client'

import { useTheme } from '@/contexts/ThemeContext'

export interface AgingCurveData {
  playerName: string
  position: string
  playerAge: number
  peakAgeStart: number
  peakAgeEnd: number
  declineStart: number
  cliffAge: number
  multiplier: number
  assessment: 'developing' | 'in_prime' | 'declining' | 'past_prime'
  primeYearsRemaining: number
}

interface AgingCurveWidgetProps {
  data: AgingCurveData
  teamColor: string
}

const ASSESSMENT_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  developing: { label: 'DEVELOPING', color: '#22c55e', bg: '#22c55e20' },
  in_prime: { label: 'IN PRIME', color: '#3b82f6', bg: '#3b82f620' },
  declining: { label: 'DECLINING', color: '#f59e0b', bg: '#f59e0b20' },
  past_prime: { label: 'PAST PRIME', color: '#ef4444', bg: '#ef444420' },
}

// Generate curve points for SVG path
function generateCurvePath(
  peakStart: number,
  peakEnd: number,
  declineStart: number,
  cliffAge: number,
  minAge: number = 22,
  maxAge: number = 38,
  width: number = 280,
  height: number = 100
): string {
  const ageRange = maxAge - minAge
  const xScale = (age: number) => ((age - minAge) / ageRange) * width
  const yScale = (pct: number) => height - (pct * height)

  // Build curve points
  const points: Array<{ x: number; y: number }> = []

  // Before peak (developing)
  for (let age = minAge; age < peakStart; age++) {
    const progress = (age - minAge) / (peakStart - minAge)
    const pct = 0.5 + (progress * 0.5) // 50% to 100%
    points.push({ x: xScale(age), y: yScale(pct) })
  }

  // Peak years (100%)
  for (let age = peakStart; age <= peakEnd; age++) {
    points.push({ x: xScale(age), y: yScale(1) })
  }

  // Decline phase
  for (let age = peakEnd + 1; age <= cliffAge; age++) {
    const progress = (age - peakEnd) / (cliffAge - peakEnd)
    const pct = 1 - (progress * 0.6) // 100% to 40%
    points.push({ x: xScale(age), y: yScale(pct) })
  }

  // After cliff (sharp drop)
  for (let age = cliffAge + 1; age <= maxAge; age++) {
    const progress = (age - cliffAge) / (maxAge - cliffAge)
    const pct = 0.4 - (progress * 0.25) // 40% to 15%
    points.push({ x: xScale(age), y: yScale(Math.max(0.1, pct)) })
  }

  // Create smooth curve path
  if (points.length < 2) return ''

  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    path += ` Q ${prev.x + 10} ${prev.y} ${cpx} ${(prev.y + curr.y) / 2}`
  }
  path += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`

  return path
}

export function AgingCurveWidget({ data, teamColor }: AgingCurveWidgetProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data) return null

  const assessmentStyle = ASSESSMENT_STYLES[data.assessment] || ASSESSMENT_STYLES.declining

  const minAge = 22
  const maxAge = 38
  const chartWidth = 280
  const chartHeight = 100

  const xScale = (age: number) => ((age - minAge) / (maxAge - minAge)) * chartWidth
  const yScale = (pct: number) => chartHeight - (pct * chartHeight)

  // Calculate player's current position on curve
  let playerPct = 1 // Default to peak
  if (data.playerAge < data.peakAgeStart) {
    const progress = (data.playerAge - minAge) / (data.peakAgeStart - minAge)
    playerPct = 0.5 + (progress * 0.5)
  } else if (data.playerAge > data.peakAgeEnd && data.playerAge <= data.cliffAge) {
    const progress = (data.playerAge - data.peakAgeEnd) / (data.cliffAge - data.peakAgeEnd)
    playerPct = 1 - (progress * 0.6)
  } else if (data.playerAge > data.cliffAge) {
    const progress = Math.min(1, (data.playerAge - data.cliffAge) / (maxAge - data.cliffAge))
    playerPct = 0.4 - (progress * 0.25)
  }

  const playerX = xScale(data.playerAge)
  const playerY = yScale(Math.max(0.1, playerPct))

  const curvePath = generateCurvePath(
    data.peakAgeStart,
    data.peakAgeEnd,
    data.declineStart,
    data.cliffAge,
    minAge,
    maxAge,
    chartWidth,
    chartHeight
  )

  return (
    <div style={{
      padding: 16,
      borderRadius: 12,
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
      }}>
        <span style={{ fontSize: 18 }}>📈</span>
        <h4 style={{
          margin: 0,
          fontSize: 13,
          fontWeight: 700,
          color: isDark ? '#f1f5f9' : '#1e293b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {data.position} Aging Curve
        </h4>
      </div>

      {/* Chart Container */}
      <div style={{
        padding: 16,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
        marginBottom: 12,
      }}>
        {/* Y-Axis Labels */}
        <div style={{
          display: 'flex',
          gap: 8,
        }}>
          <div style={{
            width: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: 10,
            color: isDark ? '#64748b' : '#94a3b8',
            textAlign: 'right',
            paddingRight: 4,
            height: chartHeight,
          }}>
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative' }}>
            <svg
              width={chartWidth}
              height={chartHeight}
              style={{ overflow: 'visible' }}
            >
              {/* Grid lines */}
              {[0.25, 0.5, 0.75, 1].map((pct) => (
                <line
                  key={pct}
                  x1={0}
                  y1={yScale(pct)}
                  x2={chartWidth}
                  y2={yScale(pct)}
                  stroke={isDark ? '#1e293b' : '#e2e8f0'}
                  strokeDasharray="4"
                />
              ))}

              {/* Peak range highlight */}
              <rect
                x={xScale(data.peakAgeStart)}
                y={0}
                width={xScale(data.peakAgeEnd) - xScale(data.peakAgeStart)}
                height={chartHeight}
                fill={isDark ? '#22c55e10' : '#22c55e15'}
              />

              {/* Curve */}
              <path
                d={curvePath}
                fill="none"
                stroke={teamColor}
                strokeWidth={3}
                strokeLinecap="round"
              />

              {/* Player marker */}
              <circle
                cx={playerX}
                cy={playerY}
                r={8}
                fill={assessmentStyle.color}
                stroke="#fff"
                strokeWidth={2}
              />

              {/* Player age label */}
              <text
                x={playerX}
                y={playerY - 15}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fill={assessmentStyle.color}
              >
                Age {data.playerAge}
              </text>
            </svg>

            {/* X-Axis Labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: 10,
              color: isDark ? '#64748b' : '#94a3b8',
              width: chartWidth,
            }}>
              {[22, 26, 30, 34, 38].map((age) => (
                <span key={age} style={{ textAlign: 'center', width: 30 }}>{age}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Player Summary */}
      <div style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: isDark ? '#0f172a' : '#ffffff',
        border: `2px solid ${assessmentStyle.color}`,
      }}>
        <div style={{
          fontWeight: 700,
          fontSize: 15,
          color: teamColor,
          marginBottom: 8,
        }}>
          {data.playerName}, Age {data.playerAge}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 10,
        }}>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Peak Range: <strong style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{data.peakAgeStart}-{data.peakAgeEnd}</strong>
          </div>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Multiplier: <strong style={{ color: assessmentStyle.color }}>{data.multiplier.toFixed(2)}x</strong>
          </div>
          <div style={{
            fontSize: 12,
            color: isDark ? '#94a3b8' : '#64748b',
          }}>
            Prime Years Left: <strong style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{data.primeYearsRemaining}</strong>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
          }}>
            <span style={{
              padding: '3px 10px',
              borderRadius: 12,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: assessmentStyle.bg,
              color: assessmentStyle.color,
            }}>
              {assessmentStyle.label}
            </span>
          </div>
        </div>
      </div>

      {/* Position Reference */}
      <div style={{
        marginTop: 10,
        padding: 10,
        borderRadius: 6,
        backgroundColor: isDark ? '#0f172a' : '#f1f5f9',
        fontSize: 10,
        color: isDark ? '#94a3b8' : '#64748b',
      }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Position Peak Ranges:</div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span>QB: 28-33</span>
          <span>EDGE: 26-29</span>
          <span>WR: 27-30</span>
          <span>CB: 25-28</span>
          <span>OT: 27-32</span>
          <span>RB: 22-27</span>
        </div>
      </div>
    </div>
  )
}
