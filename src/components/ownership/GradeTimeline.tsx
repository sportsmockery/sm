'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface HistoryPoint {
  recorded_at: string
  season_label?: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  trigger_event: string | null
  notes?: string | null
}

const LINES = [
  { key: 'overall_grade', name: 'Overall', color: '#FAFAFB', strokeWidth: 3 },
  { key: 'spend_grade', name: 'Spend', color: '#4ade80' },
  { key: 'results_grade', name: 'Results', color: '#60a5fa' },
  { key: 'sentiment_grade', name: 'Sentiment', color: '#facc15' },
  { key: 'loyalty_tax', name: 'Loyalty Tax', color: '#ef4444' },
]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const point = payload[0]?.payload
  return (
    <div style={{
      background: 'var(--sm-surface)',
      border: '1px solid var(--sm-border)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
      color: 'var(--sm-text)',
      maxWidth: 260,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--sm-text)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
          <span style={{ color: p.color, fontWeight: 500 }}>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
      {point?.notes && (
        <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--sm-border)', fontSize: 11, color: 'var(--sm-text-dim)', lineHeight: 1.4 }}>
          {point.notes}
        </div>
      )}
    </div>
  )
}

export default function GradeTimeline({ history }: { history: HistoryPoint[] }) {
  if (history.length < 2) {
    return (
      <div style={{
        padding: 32,
        textAlign: 'center',
        color: 'var(--sm-text-muted)',
        fontSize: 13,
        border: '1px solid var(--sm-border)',
        borderRadius: 12,
        background: 'var(--sm-card)',
      }}>
        Grade timeline will populate as quarterly updates are recorded.
      </div>
    )
  }

  const data = history.map(h => ({
    ...h,
    quarter: h.season_label || new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    spend_grade: Number(h.spend_grade),
    results_grade: Number(h.results_grade),
    sentiment_grade: Number(h.sentiment_grade),
    loyalty_tax: Number(h.loyalty_tax),
    overall_grade: Number(h.overall_grade),
  }))

  return (
    <div style={{
      padding: 20,
      borderRadius: 12,
      border: '1px solid var(--sm-border)',
      background: 'var(--sm-card)',
    }}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <XAxis
            dataKey="quarter"
            tick={{ fill: 'var(--sm-text-muted)', fontSize: 10 }}
            axisLine={{ stroke: 'var(--sm-border)' }}
            tickLine={false}
            interval={1}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fill: 'var(--sm-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--sm-border)' }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--sm-text-muted)', paddingTop: 8 }}
          />
          {LINES.map(line => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 1.5}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
