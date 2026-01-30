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

  const subText = isDark ? '#9ca3af' : '#6b7280'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const borderColor = isDark ? '#374151' : '#e5e7eb'

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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !draftData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 8 }}>
          {error || 'Draft not found'}
        </h1>
        <p style={{ color: subText, marginBottom: 24 }}>
          This mock draft may have been removed or the link is incorrect.
        </p>
        <Link
          href="/mock-draft"
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            backgroundColor: '#bc0000',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Create Your Own Mock Draft
        </Link>
      </div>
    )
  }

  const gradeColor = draftData.overall_grade ? getGradeColor(draftData.overall_grade) : '#6b7280'
  const userPicks = draftData.picks?.filter(p => p.is_user_pick && p.selected_prospect) || []

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-3xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {team && (
            <Image src={team.logo} alt={team.name} width={80} height={80} style={{ margin: '0 auto 16px', objectFit: 'contain' }} />
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 8 }}>
            {team?.name || draftData.chicago_team} {draftData.draft_year} Mock Draft
          </h1>
          <p style={{ color: subText, fontSize: 14 }}>
            See how this GM did in their mock draft simulation
          </p>
        </div>

        {/* Grade Card */}
        {draftData.overall_grade && draftData.letter_grade && (
          <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}>
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
                <h2 style={{ fontWeight: 700, fontSize: 20, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 8 }}>
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
                <h3 style={{ fontWeight: 600, fontSize: 14, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 12 }}>
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
                        backgroundColor: isDark ? '#374151' : '#f3f4f6',
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
              {draftData.strengths && draftData.strengths.length > 0 && (
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 13, color: '#10b981', marginBottom: 8 }}>
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
                  <h4 style={{ fontWeight: 600, fontSize: 13, color: '#ef4444', marginBottom: 8 }}>
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
          <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
          }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 16 }}>
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
                    borderRadius: 10,
                    backgroundColor: teamColor + '20',
                    border: `1px solid ${teamColor}40`,
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
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
                    <div style={{ fontWeight: 700, fontSize: 14, color: isDark ? '#fff' : '#1a1a1a' }}>
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
        <div style={{
          backgroundColor: isDark ? 'rgba(188, 0, 0, 0.15)' : 'rgba(188, 0, 0, 0.08)',
          border: '2px solid rgba(188, 0, 0, 0.4)',
          borderRadius: 16,
          padding: 32,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏈</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#bc0000', marginBottom: 8 }}>
            Think You Can Draft Better?
          </h2>
          <p style={{ fontSize: 14, color: subText, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            Test your GM skills with the Mock Draft Simulator and Trade Simulator on Sports Mockery.
            Get AI-powered grades and compete with your friends!
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/mock-draft"
              style={{
                padding: '14px 28px',
                borderRadius: 10,
                backgroundColor: '#bc0000',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Try Mock Draft
            </Link>
            <Link
              href="/gm"
              style={{
                padding: '14px 28px',
                borderRadius: 10,
                backgroundColor: 'transparent',
                border: '2px solid #bc0000',
                color: '#bc0000',
                fontWeight: 700,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Try Trade Simulator
            </Link>
          </div>
          <p style={{ fontSize: 12, color: subText, marginTop: 16 }}>
            Free to use! Register at <span style={{ color: '#bc0000', fontWeight: 600 }}>sportsmockery.com</span>
          </p>
        </div>
      </main>
    </div>
  )
}
