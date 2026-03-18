'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface HistoryPoint {
  recorded_at: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  trigger_event: string | null
}

const LINES = [
  { key: 'overall_grade', name: 'Overall', color: '#fff', strokeWidth: 3 },
  { key: 'spend_grade', name: 'Spend', color: '#4ade80' },
  { key: 'results_grade', name: 'Results', color: '#60a5fa' },
  { key: 'sentiment_grade', name: 'Sentiment', color: '#facc15' },
  { key: 'loyalty_tax', name: 'Loyalty Tax', color: '#ef4444' },
]

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
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
    date: formatDate(h.recorded_at),
  }))

  return (
    <div style={{
      padding: 20,
      borderRadius: 12,
      border: '1px solid var(--sm-border)',
      background: 'var(--sm-card)',
    }}>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
          <XAxis
            dataKey="date"
            tick={{ fill: 'var(--sm-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--sm-border)' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: 'var(--sm-text-muted)', fontSize: 11 }}
            axisLine={{ stroke: 'var(--sm-border)' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--sm-surface)',
              border: '1px solid var(--sm-border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--sm-text)',
            }}
            labelStyle={{ color: 'var(--sm-text-dim)', fontWeight: 600 }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: 'var(--sm-text-muted)' }}
          />
          {LINES.map(line => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
