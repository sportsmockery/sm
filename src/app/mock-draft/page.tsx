'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'

// Types
interface Prospect {
  id: string
  name: string
  position: string
  school: string
  height?: string
  weight?: number
  age?: number
  headshot_url?: string
  projected_round?: number
  projected_pick?: number
  grade?: number
  strengths?: string[]
  weaknesses?: string[]
  comparison?: string
}

interface DraftPick {
  pick_number: number
  round: number
  team_key: string
  team_name: string
  team_logo?: string
  team_color?: string
  is_user_pick: boolean
  selected_prospect?: Prospect
  is_current?: boolean
}

interface MockDraft {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  status: 'in_progress' | 'completed' | 'graded'
  current_pick: number
  total_picks: number
  picks: DraftPick[]
  user_picks: number[]
  created_at: string
}

interface DraftGrade {
  overall_grade: number
  letter_grade: string
  analysis: string
  pick_grades: Array<{
    pick_number: number
    prospect_name: string
    grade: number
    analysis: string
  }>
  strengths: string[]
  weaknesses: string[]
}

interface DraftHistoryItem {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  status: string
  grade?: number
  letter_grade?: string
  created_at: string
  picks_made: number
}

// Chicago teams with offseason info
const CHICAGO_TEAMS = [
  { key: 'bears', name: 'Chicago Bears', sport: 'nfl', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', color: '#0B162A' },
  { key: 'bulls', name: 'Chicago Bulls', sport: 'nba', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', color: '#CE1141' },
  { key: 'blackhawks', name: 'Chicago Blackhawks', sport: 'nhl', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', color: '#CF0A2C' },
  { key: 'cubs', name: 'Chicago Cubs', sport: 'mlb', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', color: '#0E3386' },
  { key: 'whitesox', name: 'Chicago White Sox', sport: 'mlb', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', color: '#27251F' },
]

// Check if team is in offseason (client-side check)
function isInOffseason(sport: string): boolean {
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  switch (sport) {
    case 'nfl':
      // NFL offseason: Mid-Jan through August (most teams eliminated by wild card weekend)
      return (month === 1 && day >= 15) || (month >= 2 && month <= 8)
    case 'nba': return month >= 6 && month <= 10
    case 'nhl': return month >= 6 && month <= 9
    case 'mlb': return month >= 10 || month <= 3
    default: return false
  }
}

function getOffseasonText(sport: string): string {
  switch (sport) {
    case 'nfl': return 'Available mid-Jan - Aug'
    case 'nba': return 'Available Jun - Oct'
    case 'nhl': return 'Available Jun - Sep'
    case 'mlb': return 'Available Oct - Mar'
    default: return ''
  }
}

export default function MockDraftPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const [pageLoading, setPageLoading] = useState(true)
  const router = useRouter()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  // State
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [activeDraft, setActiveDraft] = useState<MockDraft | null>(null)
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [prospectsLoading, setProspectsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('')
  const [gradeResult, setGradeResult] = useState<DraftGrade | null>(null)
  const [history, setHistory] = useState<DraftHistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittingPick, setSubmittingPick] = useState(false)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const [grading, setGrading] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)

  // Computed
  const currentTeamConfig = CHICAGO_TEAMS.find(t => t.key === selectedTeam)
  const teamColor = currentTeamConfig?.color || '#bc0000'
  const sport = currentTeamConfig?.sport || 'nfl'

  // Current pick info
  const currentPick = activeDraft?.picks.find(p => p.is_current)
  const isUserPick = currentPick?.is_user_pick ?? false

  // Filter prospects
  const filteredProspects = prospects.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (positionFilter && p.position !== positionFilter) return false
    // Hide already picked prospects
    const pickedIds = new Set(activeDraft?.picks.filter(pk => pk.selected_prospect).map(pk => pk.selected_prospect!.id) || [])
    if (pickedIds.has(p.id)) return false
    return true
  })

  // Get unique positions for filter
  const positions = [...new Set(prospects.map(p => p.position))].sort()

  // Auth check
  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login?next=/mock-draft')
      return
    }
    setPageLoading(false)
    fetchHistory()
  }, [authLoading, isAuthenticated, router])

  // Fetch draft history
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch('/api/gm/draft/history')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.drafts || [])
      }
    } catch (e) {
      console.error('Failed to fetch history:', e)
    }
    setHistoryLoading(false)
  }, [])

  // Fetch prospects when draft starts
  const fetchProspects = useCallback(async (sportParam: string, year?: number) => {
    setProspectsLoading(true)
    try {
      const params = new URLSearchParams({ sport: sportParam })
      if (year) params.set('year', year.toString())
      const res = await fetch(`/api/gm/draft/prospects?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProspects(data.prospects || [])
      }
    } catch (e) {
      console.error('Failed to fetch prospects:', e)
    }
    setProspectsLoading(false)
  }, [])

  // Start a new draft
  async function startDraft(teamKey: string) {
    setError(null)
    const team = CHICAGO_TEAMS.find(t => t.key === teamKey)
    if (!team) return

    if (!isInOffseason(team.sport)) {
      setError(`Mock Draft is only available during the ${team.sport.toUpperCase()} offseason`)
      return
    }

    try {
      const res = await fetch('/api/gm/draft/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chicago_team: teamKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === 'NOT_OFFSEASON') {
          setError(data.error)
        } else if (data.code === 'AUTH_REQUIRED') {
          router.push('/login?next=/mock-draft')
        } else {
          setError(data.error || 'Failed to start draft')
        }
        return
      }

      setSelectedTeam(teamKey)
      setActiveDraft(data.draft)
      fetchProspects(team.sport, data.draft?.draft_year)
    } catch (e) {
      setError('Network error. Please try again.')
    }
  }

  // Submit a pick
  async function submitPick(prospect: Prospect) {
    if (!activeDraft || !currentPick || !isUserPick) return

    setSubmittingPick(true)
    setError(null)

    try {
      const res = await fetch('/api/gm/draft/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mock_id: activeDraft.id,
          prospect_id: prospect.id,
          pick_number: currentPick.pick_number,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit pick')
        setSubmittingPick(false)
        return
      }

      // Update the draft state
      setActiveDraft(data.draft)

      // If draft is complete, show grade option
      if (data.draft?.status === 'completed') {
        // Don't auto-grade, let user click button
      }
    } catch (e) {
      setError('Network error. Please try again.')
    }
    setSubmittingPick(false)
  }

  // Auto-advance to user's next pick
  async function autoAdvance() {
    if (!activeDraft) return

    setAutoAdvancing(true)
    setError(null)

    try {
      const res = await fetch('/api/gm/draft/auto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock_id: activeDraft.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to advance draft')
        setAutoAdvancing(false)
        return
      }

      setActiveDraft(data.draft)
    } catch (e) {
      setError('Network error. Please try again.')
    }
    setAutoAdvancing(false)
  }

  // Grade the draft
  async function gradeDraft() {
    if (!activeDraft) return

    setGrading(true)
    setError(null)

    try {
      const res = await fetch('/api/gm/draft/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mock_id: activeDraft.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to grade draft')
        setGrading(false)
        return
      }

      setGradeResult(data.grade)
      setShowGradeModal(true)
      setActiveDraft(prev => prev ? { ...prev, status: 'graded' } : null)
      fetchHistory()
    } catch (e) {
      setError('Network error. Please try again.')
    }
    setGrading(false)
  }

  // Reset to team selection
  function resetDraft() {
    setSelectedTeam(null)
    setActiveDraft(null)
    setProspects([])
    setGradeResult(null)
    setSearchQuery('')
    setPositionFilter('')
    setError(null)
    setShowGradeModal(false)
  }

  // Loading state
  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="w-8 h-8 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cardBg = isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
  const subText = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: isDark ? '#fff' : '#1a1a1a', marginBottom: 4 }}>
              Mock Draft Simulator
            </h1>
            <p style={{ fontSize: '14px', color: subText }}>
              Take control of your team&apos;s draft picks and see how you stack up
            </p>
          </div>
          {activeDraft && (
            <button
              onClick={resetDraft}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: `2px solid ${teamColor}`, backgroundColor: 'transparent',
                color: teamColor, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              New Draft
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 16,
            backgroundColor: '#ef444420', border: '1px solid #ef444440',
            color: '#ef4444', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 700 }}>
              &#x2715;
            </button>
          </div>
        )}

        {/* Team Selection */}
        {!selectedTeam && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Team picker */}
            <div className={`rounded-xl border p-6 ${cardBg}`}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                Select Your Team
              </h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {CHICAGO_TEAMS.map(team => {
                  const inOffseason = isInOffseason(team.sport)
                  return (
                    <button
                      key={team.key}
                      onClick={() => inOffseason && startDraft(team.key)}
                      disabled={!inOffseason}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px', borderRadius: 12,
                        border: `2px solid ${inOffseason ? team.color : (isDark ? '#4b5563' : '#d1d5db')}`,
                        backgroundColor: isDark ? '#1f2937' : '#fff',
                        opacity: inOffseason ? 1 : 0.5,
                        cursor: inOffseason ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: 8,
                        backgroundColor: team.color + '20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Image src={team.logo} alt={team.name} width={36} height={36} style={{ objectFit: 'contain' }} />
                      </div>
                      <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: isDark ? '#fff' : '#1a1a1a', fontSize: '15px' }}>
                          {team.name}
                        </div>
                        <div style={{ fontSize: '12px', color: inOffseason ? '#10b981' : subText }}>
                          {inOffseason ? '✓ In Offseason' : getOffseasonText(team.sport)}
                        </div>
                      </div>
                      {inOffseason && (
                        <div style={{ color: team.color, fontWeight: 600, fontSize: '13px' }}>
                          Start →
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* History */}
            <div className={`rounded-xl border p-6 ${cardBg}`}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: 16, color: isDark ? '#fff' : '#1a1a1a' }}>
                Draft History
              </h2>
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div className="w-6 h-6 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: subText }}>
                  <div style={{ fontSize: '32px', marginBottom: 8 }}>📋</div>
                  <div style={{ fontWeight: 600 }}>No drafts yet</div>
                  <div style={{ fontSize: '13px' }}>Complete a mock draft to see your history</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {history.map(draft => {
                    const team = CHICAGO_TEAMS.find(t => t.key === draft.chicago_team)
                    return (
                      <div
                        key={draft.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px', borderRadius: 10,
                          backgroundColor: isDark ? '#374151' : '#f3f4f6',
                        }}
                      >
                        {team && (
                          <Image src={team.logo} alt={team.name} width={28} height={28} style={{ objectFit: 'contain' }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: isDark ? '#fff' : '#1a1a1a' }}>
                            {team?.name || draft.chicago_team} {draft.draft_year}
                          </div>
                          <div style={{ fontSize: '11px', color: subText }}>
                            {draft.picks_made} picks • {new Date(draft.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        {draft.grade && (
                          <div style={{
                            padding: '4px 10px', borderRadius: 6,
                            backgroundColor: draft.grade >= 80 ? '#10b981' : draft.grade >= 60 ? '#f59e0b' : '#ef4444',
                            color: '#fff', fontWeight: 700, fontSize: '12px',
                          }}>
                            {draft.letter_grade || draft.grade}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Draft */}
        {selectedTeam && activeDraft && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Draft Board - Left */}
            <div className={`lg:col-span-1 rounded-xl border p-4 ${cardBg}`} style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontWeight: 700, fontSize: '15px', color: isDark ? '#fff' : '#1a1a1a' }}>
                  Draft Board
                </h3>
                <span style={{ fontSize: '12px', color: subText }}>
                  Pick {activeDraft.current_pick} of {activeDraft.total_picks}
                </span>
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeDraft.picks.map(pick => (
                  <div
                    key={pick.pick_number}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px', borderRadius: 8, marginBottom: 6,
                      backgroundColor: pick.is_current
                        ? (pick.is_user_pick ? teamColor + '30' : (isDark ? '#374151' : '#f3f4f6'))
                        : 'transparent',
                      border: pick.is_current ? `2px solid ${pick.is_user_pick ? teamColor : (isDark ? '#4b5563' : '#d1d5db')}` : '1px solid transparent',
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: 6,
                      backgroundColor: pick.is_user_pick ? teamColor : (pick.team_color || '#666'),
                      color: '#fff', fontWeight: 700, fontSize: '11px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {pick.pick_number}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '12px', color: isDark ? '#fff' : '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {pick.team_name}
                      </div>
                      {pick.selected_prospect && (
                        <div style={{ fontSize: '11px', color: subText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pick.selected_prospect.name} - {pick.selected_prospect.position}
                        </div>
                      )}
                    </div>
                    {pick.is_current && !pick.selected_prospect && (
                      <div style={{
                        padding: '2px 8px', borderRadius: 4,
                        backgroundColor: pick.is_user_pick ? teamColor : '#6b7280',
                        color: '#fff', fontSize: '10px', fontWeight: 600,
                      }}>
                        {pick.is_user_pick ? 'YOUR PICK' : 'ON CLOCK'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content - Center */}
            <div className="lg:col-span-2 space-y-4">
              {/* Current Pick Status */}
              <div className={`rounded-xl border p-4 ${cardBg}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {currentTeamConfig && (
                    <Image src={currentTeamConfig.logo} alt={currentTeamConfig.name} width={48} height={48} style={{ objectFit: 'contain' }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '18px', color: isDark ? '#fff' : '#1a1a1a' }}>
                      {activeDraft.status === 'completed' || activeDraft.status === 'graded'
                        ? 'Draft Complete!'
                        : isUserPick
                          ? `Your Pick: #${currentPick?.pick_number}`
                          : `Pick #${currentPick?.pick_number}: ${currentPick?.team_name}`
                      }
                    </div>
                    <div style={{ fontSize: '13px', color: subText }}>
                      {activeDraft.status === 'completed' && !gradeResult && 'Click below to get your AI draft grade'}
                      {activeDraft.status === 'graded' && 'Your draft has been graded'}
                      {activeDraft.status === 'in_progress' && (isUserPick ? 'Select a prospect to draft' : 'Click Auto-Advance to skip to your pick')}
                    </div>
                  </div>
                  {activeDraft.status === 'in_progress' && !isUserPick && (
                    <button
                      onClick={autoAdvance}
                      disabled={autoAdvancing}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        backgroundColor: '#6b7280', color: '#fff',
                        fontWeight: 600, fontSize: '13px', cursor: autoAdvancing ? 'not-allowed' : 'pointer',
                        opacity: autoAdvancing ? 0.7 : 1,
                      }}
                    >
                      {autoAdvancing ? 'Advancing...' : 'Auto-Advance →'}
                    </button>
                  )}
                  {activeDraft.status === 'completed' && !gradeResult && (
                    <button
                      onClick={gradeDraft}
                      disabled={grading}
                      style={{
                        padding: '10px 20px', borderRadius: 8, border: 'none',
                        backgroundColor: teamColor, color: '#fff',
                        fontWeight: 600, fontSize: '13px', cursor: grading ? 'not-allowed' : 'pointer',
                        opacity: grading ? 0.7 : 1,
                      }}
                    >
                      {grading ? 'Grading...' : 'Get Draft Grade'}
                    </button>
                  )}
                </div>
              </div>

              {/* Prospect Search (only show during draft) */}
              {activeDraft.status === 'in_progress' && isUserPick && (
                <>
                  <div className={`rounded-xl border p-4 ${cardBg}`}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Search prospects..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                          flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 8,
                          border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#fff' : '#000', fontSize: '14px',
                        }}
                      />
                      <select
                        value={positionFilter}
                        onChange={e => setPositionFilter(e.target.value)}
                        style={{
                          padding: '10px 14px', borderRadius: 8,
                          border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                          backgroundColor: isDark ? '#374151' : '#fff',
                          color: isDark ? '#fff' : '#000', fontSize: '14px',
                        }}
                      >
                        <option value="">All Positions</option>
                        {positions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Prospect List */}
                  <div className={`rounded-xl border p-4 ${cardBg}`} style={{ maxHeight: 500, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: 12, color: isDark ? '#fff' : '#1a1a1a' }}>
                      Available Prospects ({filteredProspects.length})
                    </h3>
                    {prospectsLoading ? (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <div className="w-6 h-6 border-2 border-[#bc0000] border-t-transparent rounded-full animate-spin mx-auto" />
                      </div>
                    ) : (
                      <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredProspects.map(prospect => (
                          <div
                            key={prospect.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '12px', borderRadius: 10, marginBottom: 8,
                              backgroundColor: isDark ? '#374151' : '#f3f4f6',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onClick={() => !submittingPick && submitPick(prospect)}
                          >
                            {prospect.headshot_url ? (
                              <Image src={prospect.headshot_url} alt={prospect.name} width={40} height={40} style={{ borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                              <div style={{
                                width: 40, height: 40, borderRadius: 8,
                                backgroundColor: isDark ? '#4b5563' : '#d1d5db',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: subText, fontWeight: 700, fontSize: '14px',
                              }}>
                                {prospect.name.charAt(0)}
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 700, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a' }}>
                                {prospect.name}
                              </div>
                              <div style={{ fontSize: '12px', color: subText }}>
                                {prospect.position} • {prospect.school}
                                {prospect.age && ` • ${prospect.age} yrs`}
                              </div>
                            </div>
                            {prospect.grade && (
                              <div style={{
                                padding: '4px 10px', borderRadius: 6,
                                backgroundColor: prospect.grade >= 80 ? '#10b981' : prospect.grade >= 60 ? '#f59e0b' : '#6b7280',
                                color: '#fff', fontWeight: 700, fontSize: '12px',
                              }}>
                                {prospect.grade}
                              </div>
                            )}
                            <button
                              disabled={submittingPick}
                              style={{
                                padding: '6px 14px', borderRadius: 6, border: 'none',
                                backgroundColor: teamColor, color: '#fff',
                                fontWeight: 600, fontSize: '12px', cursor: submittingPick ? 'not-allowed' : 'pointer',
                              }}
                            >
                              Draft
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Draft Summary (after completion) */}
              {(activeDraft.status === 'completed' || activeDraft.status === 'graded') && (
                <div className={`rounded-xl border p-4 ${cardBg}`}>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: 12, color: isDark ? '#fff' : '#1a1a1a' }}>
                    Your Picks
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {activeDraft.picks
                      .filter(p => p.is_user_pick && p.selected_prospect)
                      .map(pick => (
                        <div
                          key={pick.pick_number}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '12px', borderRadius: 10,
                            backgroundColor: teamColor + '20',
                            border: `1px solid ${teamColor}40`,
                          }}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 8,
                            backgroundColor: teamColor, color: '#fff',
                            fontWeight: 700, fontSize: '13px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            #{pick.pick_number}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px', color: isDark ? '#fff' : '#1a1a1a' }}>
                              {pick.selected_prospect!.name}
                            </div>
                            <div style={{ fontSize: '12px', color: subText }}>
                              {pick.selected_prospect!.position} • {pick.selected_prospect!.school}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Grade Modal */}
      {showGradeModal && gradeResult && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowGradeModal(false)}
        >
          <div
            style={{
              backgroundColor: isDark ? '#1f2937' : '#fff',
              borderRadius: 16, padding: 24, maxWidth: 500, width: '100%',
              maxHeight: '80vh', overflowY: 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 12px',
                backgroundColor: gradeResult.overall_grade >= 80 ? '#10b981' : gradeResult.overall_grade >= 60 ? '#f59e0b' : '#ef4444',
                color: '#fff', fontWeight: 800, fontSize: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {gradeResult.letter_grade}
              </div>
              <div style={{ fontWeight: 800, fontSize: '24px', color: isDark ? '#fff' : '#1a1a1a' }}>
                Draft Grade: {gradeResult.overall_grade}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 8, color: isDark ? '#fff' : '#1a1a1a' }}>
                Analysis
              </div>
              <p style={{ fontSize: '13px', color: subText, lineHeight: 1.6 }}>
                {gradeResult.analysis}
              </p>
            </div>

            {gradeResult.strengths.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 8, color: '#10b981' }}>
                  Strengths
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {gradeResult.strengths.map((s, i) => (
                    <li key={i} style={{ fontSize: '13px', color: subText, marginBottom: 4 }}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {gradeResult.weaknesses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: 8, color: '#ef4444' }}>
                  Areas for Improvement
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {gradeResult.weaknesses.map((w, i) => (
                    <li key={i} style={{ fontSize: '13px', color: subText, marginBottom: 4 }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowGradeModal(false)}
              style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                backgroundColor: teamColor, color: '#fff',
                fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
