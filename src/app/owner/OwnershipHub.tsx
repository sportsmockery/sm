'use client'

import { useState } from 'react'
import OwnershipCard from '@/components/ownership/OwnershipCard'
import LeagueCompareTable from '@/components/ownership/LeagueCompareTable'
import ScoutCommentary from '@/components/ownership/ScoutCommentary'

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

export default function OwnershipHub({ grades }: { grades: OwnershipGrade[] }) {
  const [showMethodology, setShowMethodology] = useState(false)

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'calc(var(--sm-nav-height, 72px)) 24px 64px',
      maxWidth: 'var(--sm-max-width, 1200px)',
      margin: '0 auto',
    }}>
      {/* Hero */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: '#FAFAFB',
            backgroundColor: '#BC0000',
            padding: '3px 8px',
            borderRadius: 4,
            lineHeight: 1,
          }}>
            Data Lab
          </div>
        </div>
        <h1 style={{
          fontSize: 'clamp(26px, 4vw, 36px)',
          fontWeight: 800,
          color: 'var(--sm-text)',
          margin: '0 0 8px',
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
        }}>
          Owner & GM Report Cards
        </h1>
        <p style={{
          fontSize: 14,
          color: 'var(--sm-text-dim)',
          maxWidth: 520,
          margin: 0,
          lineHeight: 1.5,
        }}>
          Data-backed grades on every Chicago ownership group. Spending, Results, Fan Sentiment, and Loyalty Tax. Grades are reviewed and updated monthly.
        </p>
      </div>

      {/* League Comparison Table */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', margin: 0 }}>
              League Comparison
            </h2>
            <span style={{ fontSize: 11, color: 'var(--sm-text-dim)', fontWeight: 500 }}>Q1 2023 – Present</span>
          </div>
          <button
            onClick={() => setShowMethodology(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--sm-text-muted)',
              backgroundColor: 'var(--sm-surface)',
              border: '1px solid var(--sm-border)',
              borderRadius: 20,
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              lineHeight: 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
            How We Grade
          </button>
        </div>
        <LeagueCompareTable grades={grades} />
      </div>

      {/* Team Cards Grid */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 16 }}>
          Team Report Cards
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {grades.map(grade => (
            <OwnershipCard key={grade.id} grade={grade} />
          ))}
        </div>
      </div>

      {/* Scout Commentary */}
      <ScoutCommentary />

      {/* How We Grade Modal */}
      {showMethodology && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setShowMethodology(false)}
        >
          {/* Backdrop */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
          }} />

          {/* Modal */}
          <div
            style={{
              position: 'relative',
              maxWidth: 480,
              width: '100%',
              borderRadius: 16,
              border: '1px solid var(--sm-border)',
              background: 'var(--sm-card)',
              padding: '28px 24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowMethodology(false)}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--sm-text-muted)',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Close"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--sm-text)', margin: '0 0 16px' }}>
              How We Grade
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(0,212,255,0.15)', fontSize: 12 }}>$</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text)' }}>Spending (0-10)</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', margin: 0, lineHeight: 1.5, paddingLeft: 32 }}>
                  How much does ownership invest relative to market size? Measures payroll rank vs. expected rank for a top-3 market.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(96,165,250,0.15)', color: '#60a5fa', fontSize: 13, fontWeight: 700 }}>W</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text)' }}>Results (0-10)</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', margin: 0, lineHeight: 1.5, paddingLeft: 32 }}>
                  Are they winning? Win percentage percentile plus payroll efficiency (wins per dollar).
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(250,204,21,0.15)', color: '#facc15', fontSize: 13, fontWeight: 700 }}>S</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text)' }}>Fan Sentiment (0-10)</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', margin: 0, lineHeight: 1.5, paddingLeft: 32 }}>
                  AI-aggregated fan sentiment from Reddit, Twitter/X, and local media. Updated quarterly.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 6, backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 13, fontWeight: 700 }}>L</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--sm-text)' }}>Loyalty Tax (0-10)</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--sm-text-dim)', margin: 0, lineHeight: 1.5, paddingLeft: 32 }}>
                  Broken promises, failed rebuilds, and superstar departures. Lower is better — the cost of being a loyal fan.
                </p>
              </div>
            </div>

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--sm-border)', fontSize: 12, color: 'var(--sm-text-dim)', lineHeight: 1.5 }}>
              Overall = (Spend + Results + Sentiment + (10 - Loyalty Tax)) / 4
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
