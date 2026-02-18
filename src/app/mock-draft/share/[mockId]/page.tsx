'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import Image from 'next/image'
import Link from 'next/link'

interface PickGrade {
  pick_number: number
  prospect_name: string
  grade: number
  analysis: string
}

interface MockDraftData {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  status: string
  overall_grade?: number
  letter_grade?: string
  analysis?: string
  pick_grades?: PickGrade[]
  strengths?: string[]
  weaknesses?: string[]
  picks?: Array<{
    pick_number: number
    team_name: string
    is_user_pick: boolean
    selected_prospect?: {
      name: string
      position: string
      school: string
    }
  }>
}

// Chicago teams config
const CHICAGO_TEAMS: Record<string, { name: string; logo: string; color: string }> = {
  bears: { name: 'Chicago Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', color: '#0B162A' },
  bulls: { name: 'Chicago Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', color: '#CE1141' },
  blackhawks: { name: 'Chicago Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', color: '#CF0A2C' },
  cubs: { name: 'Chicago Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', color: '#0E3386' },
  whitesox: { name: 'Chicago White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', color: '#27251F' },
}

export default function MockDraftSharePage() {
  const params = useParams()
  const mockId = params.mockId as string
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draftData, setDraftData] = useState<MockDraftData | null>(null)

  useEffect(() => {
    async function fetchDraft() {
      try {
        const res = await fetch(`/api/gm/draft/share/${mockId}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('Mock draft not found')
          } else {
            setError('Failed to load mock draft')
          }
          setLoading(false)
          return
        }
        const data = await res.json()
        setDraftData(data.draft)
      } catch (e) {
        console.error('Error fetching draft:', e)
        setError('Failed to load mock draft')
      }
      setLoading(false)
    }

    if (mockId) {
      fetchDraft()
    }
  }, [mockId])

  const subText = 'var(--sm-text-muted)'
  const cardBg = 'var(--sm-card)'
  const borderColor = 'var(--sm-border)'

  const team = draftData ? CHICAGO_TEAMS[draftData.chicago_team] : null
  const teamColor = team?.color || '#bc0000'

  const getGradeColor = (gradeValue: number) => {
    if (gradeValue >= 90) return '#10b981'
    if (gradeValue >= 80) return '#22c55e'
    if (gradeValue >= 70) return '#84cc16'
    if (gradeValue >= 60) return '#f59e0b'
    if (gradeValue >= 50) return '#f97316'
    return '#ef4444'
  }

  if (loading) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sm-grid-overlay" />
        <div style={{ width: 32, height: 32, border: '3px solid var(--sm-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin-2030 1s linear infinite' }} />
      </div>
    )
  }

  if (error || !draftData) {
    return (
      <div className="sm-hero-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div className="sm-grid-overlay" />
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: 400, position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 24, fontWeight: 700, color: 'var(--sm-text)', marginBottom: 8 }}>
            {error || 'Draft not found'}
          </h1>
          <p style={{ color: subText, marginBottom: 24 }}>
            This mock draft may have been removed or the link is incorrect.
          </p>
          <Link href="/mock-draft" className="btn btn-primary btn-md">
            Create Your Own Mock Draft
          </Link>
        </div>
      </div>
    )
  }

  const gradeColor = draftData.overall_grade ? getGradeColor(draftData.overall_grade) : '#6b7280'
  const userPicks = draftData.picks?.filter(p => p.is_user_pick && p.selected_prospect) || []

  return (
    <div className="sm-hero-bg" style={{ minHeight: '100vh', color: 'var(--sm-text)' }}>
      <div className="sm-grid-overlay" />
      <main style={{ maxWidth: 768, margin: '0 auto', padding: '32px 16px', paddingTop: 96, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {team && (
            <Image src={team.logo} alt={team.name} width={80} height={80} style={{ margin: '0 auto 16px', objectFit: 'contain' }} />
          )}
          <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 28, fontWeight: 800, color: 'var(--sm-text)', marginBottom: 8 }}>
            {team?.name || draftData.chicago_team} {draftData.draft_year} Mock Draft
          </h1>
          <p style={{ color: subText, fontSize: 14 }}>
            See how this GM did in their mock draft simulation
          </p>
        </div>

        {/* Grade Card */}
        {draftData.overall_grade && draftData.letter_grade && (
          <div className="glass-card glass-card-static" style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: gradeColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 36, lineHeight: 1 }}>
                  {draftData.letter_grade}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 600 }}>
                  {draftData.overall_grade}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontWeight: 700, fontSize: 20, color: 'var(--sm-text)', marginBottom: 8 }}>
                  Draft Grade
                </h2>
                {draftData.analysis && (
                  <p style={{ fontSize: 14, color: subText, lineHeight: 1.6 }}>
                    {draftData.analysis}
                  </p>
                )}
              </div>
            </div>

            {/* Pick Grades */}
            {draftData.pick_grades && draftData.pick_grades.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontWeight: 600, fontSize: 14, color: 'var(--sm-text)', marginBottom: 12 }}>
                  Pick Grades
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
                  {draftData.pick_grades.map((pick) => (
                    <div
                      key={pick.pick_number}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        borderRadius: 8,
                        backgroundColor: 'var(--sm-surface)',
                      }}
                    >
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        backgroundColor: getGradeColor(pick.grade),
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {pick.grade}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 600,
                          fontSize: 12,
                          color: 'var(--sm-text)',
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
              {draftData.strengths && draftData.strengths.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 13, color: 'var(--sm-success)', marginBottom: 8 }}>
                    Strengths
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {draftData.strengths.map((s, i) => (
                      <li key={i} style={{ fontSize: 12, color: subText, marginBottom: 4 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {draftData.weaknesses && draftData.weaknesses.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 13, color: 'var(--sm-error)', marginBottom: 8 }}>
                    Areas to Improve
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {draftData.weaknesses.map((w, i) => (
                      <li key={i} style={{ fontSize: 12, color: subText, marginBottom: 4 }}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Picks */}
        {userPicks.length > 0 && (
          <div className="glass-card glass-card-static" style={{ marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--sm-text)', marginBottom: 16 }}>
              Draft Picks Made
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {userPicks.map(pick => (
                <div
                  key={pick.pick_number}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 'var(--sm-radius-md)',
                    backgroundColor: teamColor + '20',
                    border: `1px solid ${teamColor}40`,
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--sm-radius-sm)',
                    backgroundColor: teamColor,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    #{pick.pick_number}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--sm-text)' }}>
                      {pick.selected_prospect!.name}
                    </div>
                    <div style={{ fontSize: 12, color: subText }}>
                      {pick.selected_prospect!.position} • {pick.selected_prospect!.school}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Card */}
        <div className="glass-card glass-card-static" style={{
          background: 'var(--sm-gradient)',
          borderColor: 'transparent',
          textAlign: 'center',
          color: '#fff',
        }}>
          <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, fontFamily: 'var(--sm-font-heading)' }}>
            Think You Can Draft Better?
          </div>
          <p style={{ fontSize: 16, opacity: 0.9, marginBottom: 24 }}>
            Test your GM skills with the Mock Draft Simulator and Trade Simulator.
            Get AI-powered grades and compete with your friends!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/mock-draft"
              className="btn btn-lg"
              style={{
                background: '#fff',
                color: 'var(--sm-red)',
                borderRadius: 'var(--sm-radius-md)',
                fontWeight: 800,
                fontSize: 16,
                border: 'none',
                display: 'inline-flex',
              }}
            >
              Try Mock Draft
            </Link>
            <Link
              href="/gm"
              className="btn btn-lg"
              style={{
                background: 'transparent',
                color: '#fff',
                borderRadius: 'var(--sm-radius-md)',
                fontWeight: 700,
                fontSize: 16,
                border: '2px solid rgba(255,255,255,0.5)',
                display: 'inline-flex',
              }}
            >
              Try Trade Simulator
            </Link>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.8 }}>
            Free for all SportsMockery members
          </div>
        </div>
      </main>
    </div>
  )
}
