'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GradeRow {
  team_slug: string
  league: string
  owner_name: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
}

type SortKey = 'overall_grade' | 'spend_grade' | 'results_grade' | 'sentiment_grade' | 'loyalty_tax'

const TEAM_NAMES: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  whitesox: 'White Sox',
}

function gradeColor(value: number): string {
  if (value >= 7) return '#00d084'
  if (value >= 5) return '#facc15'
  if (value >= 3) return '#fb923c'
  return '#ef4444'
}

export default function LeagueCompareTable({ grades }: { grades: GradeRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('overall_grade')
  const [sortAsc, setSortAsc] = useState(false)

  const sorted = [...grades].sort((a, b) => {
    const diff = (a[sortKey] ?? 0) - (b[sortKey] ?? 0)
    return sortAsc ? diff : -diff
  })

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc)
    else { setSortKey(key); setSortAsc(false) }
  }

  const headerStyle = (key: SortKey): React.CSSProperties => ({
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: sortKey === key ? 'var(--sm-text)' : 'var(--sm-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    cursor: 'pointer',
    textAlign: 'right' as const,
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
  })

  const cellStyle: React.CSSProperties = {
    padding: '10px 12px',
    fontSize: 13,
    fontWeight: 600,
    textAlign: 'right',
  }

  return (
    <div style={{
      borderRadius: 12,
      border: '1px solid var(--sm-border)',
      background: 'var(--sm-card)',
      overflow: 'hidden',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--sm-border)' }}>
              <th style={{ padding: '10px 12px', fontSize: 11, fontWeight: 600, color: 'var(--sm-text-muted)', textTransform: 'uppercase', textAlign: 'left', letterSpacing: 0.5 }}>
                Team
              </th>
              <th style={headerStyle('spend_grade')} onClick={() => handleSort('spend_grade')}>
                Spend {sortKey === 'spend_grade' && (sortAsc ? '↑' : '↓')}
              </th>
              <th style={headerStyle('results_grade')} onClick={() => handleSort('results_grade')}>
                Results {sortKey === 'results_grade' && (sortAsc ? '↑' : '↓')}
              </th>
              <th style={headerStyle('sentiment_grade')} onClick={() => handleSort('sentiment_grade')}>
                Sentiment {sortKey === 'sentiment_grade' && (sortAsc ? '↑' : '↓')}
              </th>
              <th style={headerStyle('loyalty_tax')} onClick={() => handleSort('loyalty_tax')}>
                Loyalty Tax {sortKey === 'loyalty_tax' && (sortAsc ? '↑' : '↓')}
              </th>
              <th style={headerStyle('overall_grade')} onClick={() => handleSort('overall_grade')}>
                Overall {sortKey === 'overall_grade' && (sortAsc ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((g, i) => (
              <tr
                key={g.team_slug}
                style={{
                  borderBottom: i < sorted.length - 1 ? '1px solid var(--sm-border)' : undefined,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sm-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px' }}>
                  <Link href={`/owner/${g.team_slug}`} style={{ textDecoration: 'none', color: 'var(--sm-text)', fontWeight: 600, fontSize: 13 }}>
                    {TEAM_NAMES[g.team_slug] || g.team_slug}
                  </Link>
                  <div style={{ fontSize: 11, color: 'var(--sm-text-muted)' }}>{g.league}</div>
                </td>
                <td style={{ ...cellStyle, color: gradeColor(g.spend_grade) }}>{g.spend_grade.toFixed(1)}</td>
                <td style={{ ...cellStyle, color: gradeColor(g.results_grade) }}>{g.results_grade.toFixed(1)}</td>
                <td style={{ ...cellStyle, color: gradeColor(g.sentiment_grade) }}>{g.sentiment_grade.toFixed(1)}</td>
                <td style={{ ...cellStyle, color: gradeColor(10 - g.loyalty_tax) }}>{g.loyalty_tax.toFixed(1)}</td>
                <td style={{ ...cellStyle, color: gradeColor(g.overall_grade), fontSize: 15, fontWeight: 800 }}>{g.overall_grade.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
