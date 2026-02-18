'use client'
import { useState } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface DraftPick {
  year: number
  round: number
  condition?: string
  pickNumber?: number
}

const SPORT_ROUNDS: Record<string, number> = {
  nfl: 7, nba: 2, nhl: 7, mlb: 20,
}

// Picks per round by sport (for generating pick number options)
const PICKS_PER_ROUND: Record<string, number> = {
  nfl: 32, nba: 30, nhl: 32, mlb: 30,
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
  const [pickPosition, setPickPosition] = useState<'early' | 'mid' | 'late' | 'specific' | ''>('')
  const [specificPick, setSpecificPick] = useState<number | ''>('')

  const maxRound = SPORT_ROUNDS[sport] || 7
  const picksPerRound = PICKS_PER_ROUND[sport] || 32
  const years = [2026, 2027, 2028, 2029, 2030]
  const rounds = Array.from({ length: maxRound }, (_, i) => i + 1)

  // Generate pick numbers for the selected round
  const pickNumbers = Array.from({ length: picksPerRound }, (_, i) => {
    const pickNum = (round - 1) * picksPerRound + i + 1
    return pickNum
  })

  const selectStyle = {
    padding: '6px 8px',
    borderRadius: '6px',
    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
    backgroundColor: isDark ? '#374151' : '#fff',
    color: isDark ? '#fff' : '#000',
    fontSize: '12px',
  }

  const handleAdd = () => {
    let pickNumber: number | undefined

    if (pickPosition === 'specific' && specificPick) {
      pickNumber = specificPick as number
    } else if (pickPosition === 'early') {
      // Early = picks 1-10 in round, use middle value (5)
      pickNumber = (round - 1) * picksPerRound + 5
    } else if (pickPosition === 'mid') {
      // Mid = picks 11-21 in round, use middle value (16)
      pickNumber = (round - 1) * picksPerRound + 16
    } else if (pickPosition === 'late') {
      // Late = picks 22-32 in round, use middle value (27)
      pickNumber = (round - 1) * picksPerRound + 27
    }

    onAdd({
      year,
      round,
      condition: condition.trim() || undefined,
      pickNumber,
    })
    setCondition('')
    setPickPosition('')
    setSpecificPick('')
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--sm-text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select value={year} onChange={e => setYear(+e.target.value)} style={selectStyle}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={round} onChange={e => { setRound(+e.target.value); setSpecificPick('') }} style={selectStyle}>
          {rounds.map(r => <option key={r} value={r}>Round {r}</option>)}
        </select>
        <select
          value={pickPosition}
          onChange={e => { setPickPosition(e.target.value as typeof pickPosition); if (e.target.value !== 'specific') setSpecificPick('') }}
          style={selectStyle}
        >
          <option value="">Pick position</option>
          <option value="early">Early (1-10)</option>
          <option value="mid">Mid (11-21)</option>
          <option value="late">Late (22+)</option>
          <option value="specific">Specific #</option>
        </select>
        {pickPosition === 'specific' && (
          <select
            value={specificPick}
            onChange={e => setSpecificPick(e.target.value ? +e.target.value : '')}
            style={selectStyle}
          >
            <option value="">Pick #</option>
            {pickNumbers.map(num => (
              <option key={num} value={num}>#{num}</option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={condition}
          onChange={e => setCondition(e.target.value)}
          placeholder="Condition"
          style={{ ...selectStyle, width: 80 }}
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
          {picks.map((pk, i) => {
            // Format pick display with pick number if available
            let pickLabel = `${pk.year} R${pk.round}`
            if (pk.pickNumber) {
              pickLabel += ` #${pk.pickNumber}`
            }
            if (pk.condition) {
              pickLabel += ` (${pk.condition})`
            }
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '4px 10px', borderRadius: 6,
                backgroundColor: 'var(--sm-border)',
                fontSize: '11px', color: 'var(--sm-text)',
                fontWeight: 600,
              }}>
                {pickLabel}
                <button
                  onClick={() => onRemove(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700, padding: '0 2px' }}
                >
                  &#x2715;
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
