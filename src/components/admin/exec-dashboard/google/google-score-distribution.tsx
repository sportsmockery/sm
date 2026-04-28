'use client'

import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts'
import type { GoogleTabPayload } from '@/lib/google/types'

const C = { cyan: '#00D4FF', red: '#BC0000', gold: '#D6B05E', green: '#00D4FF' }

export function GoogleScoreDistribution({ data }: { data: GoogleTabPayload }) {
  return (
    <div className="rounded-lg border" style={{ background: 'var(--sm-card)', borderColor: 'var(--sm-border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-lg font-semibold" style={{ color: 'var(--sm-text)' }}>Score Distribution</h3>
        <span className="text-xs tabular-nums" style={{ color: 'var(--sm-text-dim)' }}>{data.articles.length} articles</span>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data.scoreDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="bucket" tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#55556a', fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
              contentStyle={{ background: 'var(--sm-surface)', border: '1px solid var(--sm-border)', borderRadius: 6, color: 'var(--sm-text)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.scoreDistribution.map((d) => (
                <Cell key={d.bucket} fill={bucketColor(d.bucket)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function bucketColor(bucket: string): string {
  if (bucket.startsWith('90')) return C.green
  if (bucket.startsWith('80')) return C.cyan
  if (bucket.startsWith('70')) return C.cyan
  if (bucket.startsWith('60')) return C.gold
  return C.red
}
