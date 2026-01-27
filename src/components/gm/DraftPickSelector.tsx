'use client'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface DraftPick {
  year: number
  round: number
  condition?: string
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
}

interface DraftPickSelectorProps {
  sport: string
  picks: DraftPick[]
  onAdd: (pick: DraftPick) => void
  onRemove: (index: number) => void
  label: string
}

export function DraftPickSelector({ sport, picks, onAdd, onRemove, label }: DraftPickSelectorProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [year, setYear] = useState(2026)
  const [round, setRound] = useState(1)
  const [condition, setCondition] = useState('')

  const maxRound = SPORT_ROUNDS[sport] || 7
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  const selectStyle = {
    padding: '6px 8px',
    borderRadius: '6px',
    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
    backgroundColor: isDark ? '#374151' : '#fff',
    color: isDark ? '#fff' : '#000',
    fontSize: '12px',
  }

  const handleAdd = () => {
    onAdd({ year, round, condition: condition.trim() || undefined })
    setCondition('')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={year} onChange={e => setYear(+e.target.value)} style={selectStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={round} onChange={e => setRound(+e.target.value)} style={selectStyle}>
          {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
        </select>
        <input
          type="text"
          value={condition}
          onChange={e => setCondition(e.target.value)}
          placeholder="Condition (optional)"
          style={{ ...selectStyle, flex: 1, minWidth: 100 }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: '6px 12px', borderRadius: 6, border: 'none',
            backgroundColor: '#bc0000', color: '#fff',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
      {picks.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {picks.map((pk, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 6,
              backgroundColor: isDark ? '#374151' : '#e5e7eb',
              fontSize: '11px', color: isDark ? '#fff' : '#1a1a1a',
              fontWeight: 600,
            }}>
              {pk.year} R{pk.round}{pk.condition ? ` (${pk.condition})` : ''}
              <button
                onClick={() => onRemove(i)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, padding: '0 2px' }}
              >
                &#x2715;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
