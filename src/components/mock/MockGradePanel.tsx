'use client'

import { useState } from 'react'
import type { MockGradeResponse, MockPickGrade } from '@/types/gm'

interface MockGradePanelProps {
  gradeData: MockGradeResponse
  className?: string
}

function gradeColor(letter: string): string {
  if (letter.startsWith('A')) return '#22c55e'
  if (letter.startsWith('B')) return '#84cc16'
  if (letter.startsWith('C')) return '#eab308'
  if (letter.startsWith('D')) return '#f97316'
  return '#ef4444'
}

function PickGradeRow({ pick }: { pick: MockPickGrade }) {
  const reachColor = pick.reach_steal >= 15
    ? '#22c55e'
    : pick.reach_steal >= -5
    ? '#eab308'
    : '#ef4444'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        marginBottom: '8px',
      }}
    >
      <div style={{ minWidth: '48px', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '10px',
          color: 'rgba(255, 255, 255, 0.4)',
          margin: '0 0 2px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          Pick {pick.overall_pick}
        </p>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 700,
          fontSize: '16px',
          color: gradeColor(pick.grade_letter),
          margin: 0,
        }}>
          {pick.grade_letter}
        </p>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 600,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.9)',
          }}>
            {pick.prospect_name}
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}>
            {pick.position}
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            color: reachColor,
            background: `${reachColor}18`,
            borderRadius: '4px',
            padding: '2px 6px',
          }}>
            {pick.reach_steal_label}
          </span>
        </div>
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {pick.commentary}
        </p>
      </div>
    </div>
  )
}

export function MockGradePanel({ gradeData, className = '' }: MockGradePanelProps) {
  const [expanded, setExpanded] = useState(false)
  const { grades } = gradeData
  const chicago = grades.chicago_analysis

  const bestPick = chicago?.pick_grades?.reduce((best, pick) =>
    !best || pick.grade > best.grade ? pick : best, null as MockPickGrade | null)
  const worstPick = chicago?.pick_grades?.reduce((worst, pick) =>
    !worst || pick.grade < worst.grade ? pick : worst, null as MockPickGrade | null)

  return (
    <div
      className={className}
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px',
        animation: 'fadeInMockGrade 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeInMockGrade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .mock-grade-two-col { flex-direction: column !important; }
          .mock-grade-window-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Overall Grade Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${gradeColor(grades.overall_grade_letter)}22, ${gradeColor(grades.overall_grade_letter)}08)`,
          border: `2px solid ${gradeColor(grades.overall_grade_letter)}44`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 800,
            fontSize: '28px',
            color: gradeColor(grades.overall_grade_letter),
            lineHeight: 1,
          }}>
            {grades.overall_grade_letter}
          </span>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.4)',
            marginTop: '2px',
          }}>
            {grades.overall_grade}
          </span>
        </div>
        <div>
          <h2 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.95)',
            margin: '0 0 6px',
          }}>
            Draft Grade
          </h2>
          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {grades.grade_reasoning}
          </p>
        </div>
      </div>

      {/* Chicago Team Deep Dive */}
      {chicago && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
              }}>
                {chicago.team_name}
              </h3>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: '18px',
                color: gradeColor(chicago.grade_letter),
              }}>
                {chicago.grade_letter}
              </span>
              <span style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.4)',
              }}>
                ({chicago.grade}/100)
              </span>
            </div>
          </div>

          <p style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: 1.6,
            marginBottom: '16px',
          }}>
            {chicago.detailed_summary}
          </p>

          {/* Scheme fit */}
          {chicago.scheme_fit_analysis && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
              borderLeft: '3px solid rgba(220, 38, 38, 0.6)',
            }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 6px',
              }}>
                Scheme Fit
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {chicago.scheme_fit_analysis}
              </p>
            </div>
          )}

          {/* Best / Worst pick highlights */}
          {(bestPick || worstPick) && (
            <div
              className="mock-grade-two-col"
              style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}
            >
              {bestPick && (
                <div style={{
                  flex: 1,
                  background: 'rgba(34, 197, 94, 0.06)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#22c55e',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 6px',
                  }}>
                    Best Pick
                  </p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: '0 0 2px',
                  }}>
                    {bestPick.prospect_name}
                  </p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: 0,
                  }}>
                    Pick #{bestPick.overall_pick} · {bestPick.position} · {bestPick.grade_letter}
                  </p>
                </div>
              )}
              {worstPick && worstPick !== bestPick && (
                <div style={{
                  flex: 1,
                  background: 'rgba(239, 68, 68, 0.06)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                }}>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#ef4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    margin: '0 0 6px',
                  }}>
                    Concern
                  </p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: '0 0 2px',
                  }}>
                    {worstPick.prospect_name}
                  </p>
                  <p style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: 0,
                  }}>
                    Pick #{worstPick.overall_pick} · {worstPick.position} · {worstPick.grade_letter}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pick-by-pick grades */}
          {chicago.pick_grades && chicago.pick_grades.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 600,
                  fontSize: '13px',
                  color: 'rgba(220, 38, 38, 0.9)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {expanded ? 'Hide' : 'Show'} Pick-by-Pick Breakdown ({chicago.pick_grades.length} picks)
              </button>

              {expanded && (
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  paddingRight: '4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.15) transparent',
                }}>
                  {chicago.pick_grades.map(pick => (
                    <PickGradeRow key={pick.overall_pick} pick={pick} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Roster impact */}
          {chicago.roster_impact && (
            <div style={{ marginTop: '16px' }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 6px',
              }}>
                Roster Impact
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                lineHeight: 1.5,
              }}>
                {chicago.roster_impact}
              </p>
            </div>
          )}

          {/* Competitive window */}
          {chicago.window_impact && (
            <div style={{ marginTop: '16px' }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 10px',
              }}>
                Competitive Window
              </p>
              <div
                className="mock-grade-window-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}
              >
                {[
                  { label: '1 Year', value: chicago.window_impact.one_year },
                  { label: '3 Years', value: chicago.window_impact.three_year },
                  { label: '5 Years', value: chicago.window_impact.five_year },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                  }}>
                    <p style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'rgba(220, 38, 38, 0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      margin: '0 0 4px',
                    }}>
                      {label}
                    </p>
                    <p style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.7)',
                      margin: 0,
                      lineHeight: 1.4,
                    }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {chicago.recommendation && (
            <div style={{
              marginTop: '16px',
              background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(153,27,27,0.04))',
              border: '1px solid rgba(220, 38, 38, 0.15)',
              borderRadius: '8px',
              padding: '14px 16px',
            }}>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '11px',
                fontWeight: 600,
                color: 'rgba(220, 38, 38, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '0 0 6px',
              }}>
                Assessment
              </p>
              <p style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.75)',
                margin: 0,
                lineHeight: 1.5,
                fontStyle: 'italic',
              }}>
                {chicago.recommendation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* All Teams Summary */}
      {Object.keys(grades.team_grades).length > 0 && (
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <h3 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 12px',
          }}>
            All Teams
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(grades.team_grades).map(([teamId, tg]) => (
              <div key={teamId} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
              }}>
                <span style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontWeight: 700,
                  fontSize: '16px',
                  color: gradeColor(tg.grade_letter),
                  minWidth: '32px',
                }}>
                  {tg.grade_letter}
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}>
                    {teamId}
                  </span>
                  {tg.identity && (
                    <span style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.4)',
                      marginLeft: '8px',
                    }}>
                      {tg.identity}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
