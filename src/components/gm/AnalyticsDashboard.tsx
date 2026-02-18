'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'

interface AnalyticsData {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{
    bucket: string
    count: number
    percentage: number
  }>
  trading_partners: Array<{
    team_name: string
    team_key: string
    trade_count: number
    avg_grade: number
  }>
  position_analysis: Array<{
    position: string
    sent_count: number
    received_count: number
    net_value: number
  }>
  activity_timeline: Array<{
    date: string
    trade_count: number
    avg_grade: number
  }>
  chicago_teams: Array<{
    team: string
    trade_count: number
    avg_grade: number
    accepted_rate: number
  }>
}

export function AnalyticsDashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const distributionCanvasRef = useRef<HTMLCanvasElement>(null)
  const timelineCanvasRef = useRef<HTMLCanvasElement>(null)

  const textColor = 'var(--sm-text)'
  const subText = 'var(--sm-text-muted)'
  const cardBg = isDark ? '#1f2937' : '#fff'
  const borderColor = 'var(--sm-border)'

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true)
      try {
        const res = await fetch('/api/gm/analytics')
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const result = await res.json()
        setData(result)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  // Draw grade distribution chart
  useEffect(() => {
    if (!data || !distributionCanvasRef.current) return

    const canvas = distributionCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 300
    const height = 150
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 10, right: 10, bottom: 25, left: 30 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom
    const barWidth = chartW / data.grade_distribution.length - 4

    const maxPct = Math.max(...data.grade_distribution.map(d => d.percentage), 1)

    data.grade_distribution.forEach((d, i) => {
      const barH = (d.percentage / maxPct) * chartH
      const x = padding.left + i * (barWidth + 4) + 2
      const y = padding.top + chartH - barH

      const bucketStart = parseInt(d.bucket.split('-')[0])
      let color = '#ef4444'
      if (bucketStart >= 70) color = '#22c55e'
      else if (bucketStart >= 50) color = '#eab308'

      ctx.fillStyle = color + '80'
      ctx.fillRect(x, y, barWidth, barH)

      ctx.fillStyle = subText
      ctx.font = '9px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText(d.bucket.split('-')[0], x + barWidth / 2, height - 5)
    })

    // Y-axis
    ctx.fillStyle = subText
    ctx.font = '9px system-ui'
    ctx.textAlign = 'right'
    ctx.fillText('0%', padding.left - 4, padding.top + chartH)
    ctx.fillText(`${maxPct}%`, padding.left - 4, padding.top + 10)
  }, [data, isDark, subText])

  // Draw timeline chart
  useEffect(() => {
    if (!data || !timelineCanvasRef.current || data.activity_timeline.length === 0) return

    const canvas = timelineCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const width = 300
    const height = 120
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, width, height)

    const padding = { top: 10, right: 10, bottom: 20, left: 30 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    const timeline = data.activity_timeline
    const maxCount = Math.max(...timeline.map(d => d.trade_count), 1)

    // Draw line
    ctx.strokeStyle = '#bc0000'
    ctx.lineWidth = 2
    ctx.beginPath()

    timeline.forEach((d, i) => {
      const x = padding.left + (i / (timeline.length - 1 || 1)) * chartW
      const y = padding.top + chartH - (d.trade_count / maxCount) * chartH
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw dots
    timeline.forEach((d, i) => {
      const x = padding.left + (i / (timeline.length - 1 || 1)) * chartW
      const y = padding.top + chartH - (d.trade_count / maxCount) * chartH
      ctx.fillStyle = '#bc0000'
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // X-axis labels
    ctx.fillStyle = subText
    ctx.font = '8px system-ui'
    ctx.textAlign = 'center'
    if (timeline.length > 0) {
      ctx.fillText(timeline[0].date.slice(5), padding.left, height - 4)
      ctx.fillText(timeline[timeline.length - 1].date.slice(5), width - padding.right, height - 4)
    }
  }, [data, isDark, subText])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: 40,
            height: 40,
            border: `3px solid ${borderColor}`,
            borderTopColor: '#bc0000',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: subText }}>Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#ef444420',
        borderRadius: 12,
      }}>
        {error}
      </div>
    )
  }

  if (!data || data.total_trades === 0) {
    return (
      <div style={{
        padding: 60,
        textAlign: 'center',
        backgroundColor: cardBg,
        borderRadius: 12,
        border: `1px solid ${borderColor}`,
      }}>
        <div style={{ fontSize: '48px', marginBottom: 16 }}>📊</div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: textColor, marginBottom: 8 }}>
          No Trade Data Yet
        </h3>
        <p style={{ fontSize: '14px', color: subText }}>
          Start making trades to see your analytics!
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Total Trades', value: data.total_trades, color: textColor },
          { label: 'Accepted', value: data.accepted_trades, color: '#22c55e' },
          { label: 'Rejected', value: data.rejected_trades, color: '#ef4444' },
          { label: 'Dangerous', value: data.dangerous_trades, color: '#eab308' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', fontWeight: 900, color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: subText, fontWeight: 600, textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Average Grade', value: data.average_grade },
          { label: 'Highest Grade', value: data.highest_grade },
          { label: 'Lowest Grade', value: data.lowest_grade },
          { label: 'GM Score', value: data.total_gm_score },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              textAlign: 'center',
            }}
          >
            <div style={{
              fontSize: '24px',
              fontWeight: 800,
              color: stat.label === 'GM Score' ? '#bc0000' : (stat.value >= 70 ? '#22c55e' : stat.value >= 50 ? '#eab308' : '#ef4444'),
            }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '11px', color: subText, fontWeight: 600, textTransform: 'uppercase' }}>
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Grade Distribution
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <canvas ref={distributionCanvasRef} style={{ width: 300, height: 150 }} />
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Trade Activity (Last 30 Days)
          </h3>
          {data.activity_timeline.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <canvas ref={timelineCanvasRef} style={{ width: 300, height: 120 }} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No recent activity
            </div>
          )}
        </motion.div>
      </div>

      {/* Trading Partners & Chicago Teams */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Top Trading Partners */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Top Trading Partners
          </h3>
          {data.trading_partners.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.trading_partners.slice(0, 5).map((partner, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: textColor }}>{partner.team_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '11px', color: subText }}>{partner.trade_count} trades</span>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: partner.avg_grade >= 70 ? '#22c55e' : partner.avg_grade >= 50 ? '#eab308' : '#ef4444',
                    }}>
                      {partner.avg_grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No trading partners yet
            </div>
          )}
        </motion.div>

        {/* Chicago Teams */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Your Chicago Teams
          </h3>
          {data.chicago_teams.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.chicago_teams.map((team, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 8,
                    backgroundColor: isDark ? '#111827' : '#f9fafb',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: textColor, textTransform: 'capitalize' }}>
                    {team.team}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: '11px', color: subText }}>{team.trade_count} trades</span>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: '#22c55e20',
                      color: '#22c55e',
                      fontWeight: 600,
                    }}>
                      {team.accepted_rate}% accepted
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: subText, fontSize: '13px' }}>
              No team data yet
            </div>
          )}
        </motion.div>
      </div>

      {/* Position Analysis */}
      {data.position_analysis.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
          }}
        >
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: textColor, marginBottom: 12 }}>
            Position Analysis
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.position_analysis.slice(0, 10).map((pos, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${borderColor}`,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: textColor }}>
                  {pos.position}
                </div>
                <div style={{ fontSize: '10px', color: subText }}>
                  Sent: {pos.sent_count} | Recv: {pos.received_count}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: pos.net_value > 0 ? '#22c55e' : pos.net_value < 0 ? '#ef4444' : subText,
                }}>
                  {pos.net_value > 0 ? '+' : ''}{pos.net_value} net
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
