'use client'

import { useState } from 'react'
import Link from 'next/link'
import GradeBar from './GradeBar'
import FanVoteWidget from './FanVoteWidget'

interface OwnershipGrade {
  id: string
  team_slug: string
  league: string
  owner_name: string
  gm_name: string | null
  season_label: string
  spend_grade: number
  results_grade: number
  sentiment_grade: number
  loyalty_tax: number
  overall_grade: number
  notes: string | null
  agree_count: number
  disagree_count: number
}

const TEAM_CONFIG: Record<string, { name: string; color: string; logo: string }> = {
  bears: { name: 'Chicago Bears', color: '#0B162A', logo: '/logos/bears.png' },
  bulls: { name: 'Chicago Bulls', color: '#CE1141', logo: '/logos/bulls.png' },
  blackhawks: { name: 'Chicago Blackhawks', color: '#CF0A2C', logo: '/logos/blackhawks.png' },
  cubs: { name: 'Chicago Cubs', color: '#0E3386', logo: '/logos/cubs.png' },
  whitesox: { name: 'Chicago White Sox', color: '#27251F', logo: '/logos/whitesox.png' },
}

function getOverallColor(grade: number): string {
  if (grade >= 7) return '#00d084'
  if (grade >= 5) return '#facc15'
  if (grade >= 3) return '#fb923c'
  return '#ef4444'
}

export default function OwnershipCard({ grade, showLink = true }: { grade: OwnershipGrade; showLink?: boolean }) {
  const [showNotes, setShowNotes] = useState(false)
  const team = TEAM_CONFIG[grade.team_slug] || { name: grade.team_slug, color: '#333', logo: '' }
  const overallColor = getOverallColor(grade.overall_grade)

  return (
    <div
      className="glass-card"
      style={{
        padding: 24,
        borderRadius: 16,
        background: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Team accent stripe */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: team.color,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--sm-text-muted)', fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            {grade.league}
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', margin: 0, lineHeight: 1.2 }}>
            {team.name}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--sm-text-dim)', marginTop: 4 }}>
            Owner: {grade.owner_name}
            {grade.gm_name && <> &middot; GM: {grade.gm_name}</>}
          </div>
        </div>

        {/* Overall grade circle */}
        <div style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: `3px solid ${overallColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          lineHeight: 1,
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: overallColor, lineHeight: 1 }}>
            {grade.overall_grade.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Grade bars */}
      <GradeBar label="Spending" value={grade.spend_grade} />
      <GradeBar label="Results" value={grade.results_grade} />
      <GradeBar label="Fan Sentiment" value={grade.sentiment_grade} />
      <GradeBar label="Loyalty Tax" value={grade.loyalty_tax} inverted />

      {/* Notes toggle */}
      {grade.notes && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => setShowNotes(!showNotes)}
            style={{
              fontSize: 12,
              color: 'var(--sm-text-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showNotes ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}><path d="M9 18l6-6-6-6" /></svg>
            {showNotes ? 'Hide analysis' : 'Show analysis'}
          </button>
          {showNotes && (
            <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', marginTop: 8, lineHeight: 1.5 }}>
              {grade.notes}
            </p>
          )}
        </div>
      )}

      {/* Fan vote */}
      <FanVoteWidget
        gradeId={grade.id}
        teamSlug={grade.team_slug}
        agreeCount={grade.agree_count}
        disagreeCount={grade.disagree_count}
      />

      {/* Link to detail */}
      {showLink && (
        <Link
          href={`/owner/${grade.team_slug}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 16,
            padding: '10px 0',
            borderRadius: 10,
            border: '1px solid var(--sm-border)',
            background: 'var(--sm-surface)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--sm-text)',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
        >
          Full Report Card
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </Link>
      )}
    </div>
  )
}
