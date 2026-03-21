'use client'

interface GradeBarProps {
  label: string
  value: number
  maxValue?: number
  inverted?: boolean // true for loyalty_tax where higher = worse
}

function getGradeColor(value: number, inverted: boolean): string {
  const effective = inverted ? 10 - value : value
  if (effective >= 8) return '#00d084'
  if (effective >= 6) return '#4ade80'
  if (effective >= 4) return '#facc15'
  if (effective >= 2) return '#fb923c'
  return '#ef4444'
}

function getLetterGrade(value: number, inverted: boolean): string {
  const effective = inverted ? 10 - value : value
  if (effective >= 9) return 'A+'
  if (effective >= 8) return 'A'
  if (effective >= 7) return 'B+'
  if (effective >= 6) return 'B'
  if (effective >= 5) return 'C+'
  if (effective >= 4) return 'C'
  if (effective >= 3) return 'D+'
  if (effective >= 2) return 'D'
  return 'F'
}

export default function GradeBar({ label, value, maxValue = 10, inverted = false }: GradeBarProps) {
  const color = getGradeColor(value, inverted)
  const letter = getLetterGrade(value, inverted)
  const pct = Math.min((value / maxValue) * 100, 100)

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--sm-text-dim)', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--sm-text)', fontWeight: 600 }}>{value.toFixed(1)}</span>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            color: '#FAFAFB',
            background: color,
            padding: '2px 7px',
            borderRadius: 4,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 24,
          }}>
            {letter}
          </span>
        </div>
      </div>
      <div style={{
        height: 6,
        borderRadius: 3,
        background: 'var(--sm-border)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 3,
          background: color,
          transition: 'width 0.6s ease',
        }} />
      </div>
    </div>
  )
}
