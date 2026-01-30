'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface PickGrade {
  pick_number: number
  prospect_name: string
  grade: number
  analysis: string
}

interface DraftGrade {
  overall_grade: number
  letter_grade: string
  analysis: string
  pick_grades: PickGrade[]
  strengths: string[]
  weaknesses: string[]
}

interface MockDraftGradePanelProps {
  grade: DraftGrade
  teamColor: string
  onViewDetails?: () => void
}

export default function MockDraftGradePanel({ grade, teamColor, onViewDetails }: MockDraftGradePanelProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'

  // Get grade color based on grade value
  const getGradeColor = (gradeValue: number) => {
    if (gradeValue >= 90) return '#10b981' // Green - A
    if (gradeValue >= 80) return '#22c55e' // Light green - B+
    if (gradeValue >= 70) return '#84cc16' // Yellow-green - B
    if (gradeValue >= 60) return '#f59e0b' // Orange - C
    if (gradeValue >= 50) return '#f97316' // Dark orange - D
    return '#ef4444' // Red - F
  }

  const gradeColor = getGradeColor(grade.overall_grade)

  return (
    <div className={`rounded-xl border p-4 sm:p-6 ${cardBg}`} style={{ marginTop: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: '18px', color: isDark ? '#fff' : '#1a1a1a' }}>
          Draft Grade
        </h3>
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: `1px solid ${teamColor}`,
              backgroundColor: 'transparent',
              color: teamColor,
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            View Details
          </button>
        )}
      </div>

      {/* Grade Display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
        {/* Large Grade Circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: gradeColor,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '28px', lineHeight: 1 }}>
            {grade.letter_grade}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontWeight: 600 }}>
            {grade.overall_grade}
          </span>
        </div>

        {/* Summary Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', color: isDark ? '#e5e7eb' : '#374151', lineHeight: 1.5 }}>
            {grade.analysis}
          </p>
        </div>
      </div>

      {/* Pick Grades Grid */}
      {grade.pick_grades && grade.pick_grades.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontWeight: 600, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a', marginBottom: 10 }}>
            Pick Grades
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {grade.pick_grades.map((pick) => (
              <div
                key={pick.pick_number}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    backgroundColor: getGradeColor(pick.grade),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {pick.grade}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: isDark ? '#fff' : '#1a1a1a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    #{pick.pick_number} {pick.prospect_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Weaknesses */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Strengths */}
        {grade.strengths && grade.strengths.length > 0 && (
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '13px', color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Strengths
            </h4>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {grade.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {grade.weaknesses && grade.weaknesses.length > 0 && (
          <div>
            <h4 style={{ fontWeight: 600, fontSize: '13px', color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Areas to Improve
            </h4>
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {grade.weaknesses.map((w, i) => (
                <li key={i} style={{ fontSize: '12px', color: subText, marginBottom: 4 }}>{w}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
