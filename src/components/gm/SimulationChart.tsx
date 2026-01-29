'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface SimulationResult {
  num_simulations: number
  original_grade: number
  mean_grade: number
  median_grade: number
  std_deviation: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  distribution: Array<{
    grade_bucket: number
    count: number
    percentage: number
  }>
  risk_analysis: {
    downside_risk: number
    upside_potential: number
    variance_band: [number, number]
  }
  key_factors: Array<{
    factor: string
    impact: 'positive' | 'negative' | 'neutral'
    magnitude: number
    description: string
  }>
}

interface SimulationChartProps {
  tradeId: string
  originalGrade: number
  show: boolean
  onClose: () => void
}

export function SimulationChart({ tradeId, originalGrade, show, onClose }: SimulationChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [volatility, setVolatility] = useState<'low' | 'medium' | 'high'>('medium')
  const [includeInjury, setIncludeInjury] = useState(true)
  const [includeDevelopment, setIncludeDevelopment] = useState(true)

  const textColor = isDark ? '#fff' : '#1a1a1a'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

  async function runSimulation() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/gm/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade_id: tradeId,
          original_grade: originalGrade,
          num_simulations: 1000,
          player_volatility: volatility,
          injury_factor: includeInjury,
          development_factor: includeDevelopment,
        }),
      })

      if (!res.ok) throw new Error('Simulation failed')
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed')
    } finally {
      setLoading(false)
    }
  }

  // Draw histogram when result changes
  useEffect(() => {
    if (!result || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set up for retina
    const dpr = window.devicePixelRatio || 1
    const width = 400
    const height = 200
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Draw histogram
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const barWidth = chartWidth / result.distribution.length - 4

    const maxPercentage = Math.max(...result.distribution.map(d => d.percentage))

    // Y-axis grid lines
    ctx.strokeStyle = isDark ? '#374151' : '#e5e7eb'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * i) / 4
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
    }

    // Draw bars
    result.distribution.forEach((d, i) => {
      const barHeight = (d.percentage / maxPercentage) * chartHeight
      const x = padding.left + i * (barWidth + 4) + 2
      const y = padding.top + chartHeight - barHeight

      // Bar color based on grade
      let color = '#6b7280'
      if (d.grade_bucket >= 70) color = '#22c55e'
      else if (d.grade_bucket >= 50) color = '#eab308'
      else color = '#ef4444'

      ctx.fillStyle = color + '80'
      ctx.fillRect(x, y, barWidth, barHeight)

      // X-axis labels
      ctx.fillStyle = subText
      ctx.font = '10px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(`${d.grade_bucket}`, x + barWidth / 2, height - 8)
    })

    // Y-axis label
    ctx.save()
    ctx.translate(12, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = subText
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('%', 0, 0)
    ctx.restore()

    // Original grade marker
    const origX = padding.left + (originalGrade / 100) * chartWidth
    ctx.strokeStyle = '#bc0000'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(origX, padding.top)
    ctx.lineTo(origX, padding.top + chartHeight)
    ctx.stroke()
    ctx.setLineDash([])

    // Mean marker
    const meanX = padding.left + (result.mean_grade / 100) * chartWidth
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(meanX, padding.top)
    ctx.lineTo(meanX, padding.top + chartHeight)
    ctx.stroke()
  }, [result, isDark, originalGrade, subText])

  if (!show) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      style={{
        marginTop: 20,
        padding: 20,
        borderRadius: 12,
        backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        border: `1px solid ${borderColor}`,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: textColor, margin: 0 }}>
            Monte Carlo Simulation
          </h3>
          <p style={{ fontSize: '12px', color: subText, margin: '4px 0 0' }}>
            1,000 simulations of possible outcomes
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            color: subText,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ×
        </button>
      </div>

      {/* Settings */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: subText, marginBottom: 4 }}>
            Volatility
          </label>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['low', 'medium', 'high'] as const).map(v => (
              <button
                key={v}
                onClick={() => setVolatility(v)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${volatility === v ? '#bc0000' : borderColor}`,
                  backgroundColor: volatility === v ? '#bc000015' : 'transparent',
                  color: volatility === v ? '#bc0000' : subText,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeInjury}
            onChange={e => setIncludeInjury(e.target.checked)}
            style={{ accentColor: '#bc0000' }}
          />
          <span style={{ fontSize: '11px', color: textColor }}>Injury Risk</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeDevelopment}
            onChange={e => setIncludeDevelopment(e.target.checked)}
            style={{ accentColor: '#bc0000' }}
          />
          <span style={{ fontSize: '11px', color: textColor }}>Development</span>
        </label>
      </div>

      {/* Run button */}
      <button
        onClick={runSimulation}
        disabled={loading}
        style={{
          width: '100%',
          padding: '10px 20px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#bc0000',
          color: '#fff',
          fontWeight: 700,
          fontSize: '13px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          marginBottom: 16,
        }}
      >
        {loading ? 'Running Simulations...' : 'Run Simulation'}
      </button>

      {/* Error */}
      {error && (
        <div style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: '#ef444420',
          color: '#ef4444',
          fontSize: '13px',
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Chart */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <canvas
                ref={canvasRef}
                style={{ width: 400, height: 200 }}
              />
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 16, height: 2, backgroundColor: '#bc0000' }} />
                <span style={{ fontSize: '11px', color: subText }}>Original ({originalGrade})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 16, height: 2, backgroundColor: '#3b82f6' }} />
                <span style={{ fontSize: '11px', color: subText }}>Mean ({result.mean_grade})</span>
              </div>
            </div>

            {/* Statistics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 16,
            }}>
              {[
                { label: 'Mean', value: result.mean_grade },
                { label: 'Median', value: result.median_grade },
                { label: 'Std Dev', value: result.std_deviation },
                { label: '90% Range', value: `${result.risk_analysis.variance_band[0]}-${result.risk_analysis.variance_band[1]}` },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: 'center',
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#fff',
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 700, color: textColor }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: '10px', color: subText }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Risk Analysis */}
            <div style={{
              display: 'flex',
              gap: 12,
              marginBottom: 16,
            }}>
              <div style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#ef444415',
                border: '1px solid #ef444430',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#ef4444' }}>
                  {result.risk_analysis.downside_risk}%
                </div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>Downside Risk</div>
                <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                  Chance of grade below 50
                </div>
              </div>
              <div style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: '#22c55e15',
                border: '1px solid #22c55e30',
              }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#22c55e' }}>
                  {result.risk_analysis.upside_potential}%
                </div>
                <div style={{ fontSize: '11px', color: '#22c55e' }}>Upside Potential</div>
                <div style={{ fontSize: '10px', color: subText, marginTop: 2 }}>
                  Chance of grade 80+
                </div>
              </div>
            </div>

            {/* Key Factors */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: subText, marginBottom: 8, textTransform: 'uppercase' }}>
                Key Factors
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {result.key_factors.map((factor, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      backgroundColor: isDark ? '#111827' : '#fff',
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <span style={{
                      fontSize: '14px',
                      color: factor.impact === 'positive' ? '#22c55e' : factor.impact === 'negative' ? '#ef4444' : '#6b7280',
                    }}>
                      {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>
                        {factor.factor}
                      </div>
                      <div style={{ fontSize: '10px', color: subText }}>
                        {factor.description}
                      </div>
                    </div>
                    <div style={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: isDark ? '#374151' : '#e5e7eb',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${factor.magnitude * 100}%`,
                        height: '100%',
                        backgroundColor: factor.impact === 'positive' ? '#22c55e' : factor.impact === 'negative' ? '#ef4444' : '#6b7280',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
