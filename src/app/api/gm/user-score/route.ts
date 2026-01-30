import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

interface MockDraft {
  id: string
  chicago_team: string
  sport: string
  draft_year: number
  completed: boolean
  completed_at: string | null
  mock_score: number | null
  value_score: number | null
  need_fit_score: number | null
  upside_risk_score: number | null
  mock_grade_letter: string | null
  is_best_of_three: boolean
  feedback_json: any
  created_at: string
}

interface UserScore {
  user_id: string
  combined_gm_score: number | null
  best_trade_score: number | null
  best_mock_draft_score: number | null
  best_mock_draft_id: string | null
  trade_count: number
  mock_count: number
  trade_weight: number
  mock_weight: number
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Get user's combined score
    const { data: userScore } = await datalabAdmin
      .from('gm_user_scores')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get user's recent mock drafts (using the view if available, fallback to base table)
    let mockDrafts: MockDraft[] = []

    // Try gm_mock_drafts view first (has new scoring columns)
    const { data: viewMocks, error: viewError } = await datalabAdmin
      .from('gm_mock_drafts')
      .select(`
        id, chicago_team, sport, draft_year, completed, completed_at,
        mock_score, value_score, need_fit_score, upside_risk_score,
        mock_grade_letter, is_best_of_three, feedback_json, created_at
      `)
      .eq('user_id', user.id)
      .eq('is_reset', false)
      .order('created_at', { ascending: false })
      .limit(10)

    if (!viewError && viewMocks) {
      mockDrafts = viewMocks
    } else {
      // Fallback to draft_mocks base table
      const { data: baseMocks } = await datalabAdmin
        .from('draft_mocks')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_reset', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (baseMocks) {
        mockDrafts = baseMocks.map(m => ({
          id: m.id,
          chicago_team: m.chicago_team,
          sport: m.league?.toLowerCase() || m.sport || 'nfl',
          draft_year: m.draft_year,
          completed: m.completed,
          completed_at: m.completed_at,
          mock_score: m.mock_score,
          value_score: m.value_score,
          need_fit_score: m.need_fit_score,
          upside_risk_score: m.upside_risk_score,
          mock_grade_letter: m.mock_grade_letter,
          is_best_of_three: m.is_best_of_three || false,
          feedback_json: m.feedback_json,
          created_at: m.created_at,
        }))
      }
    }

    // Get trade analytics for comparison
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('grade, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    const tradeStats = {
      total: trades?.length || 0,
      accepted: trades?.filter(t => t.status === 'accepted').length || 0,
      average_grade: trades && trades.length > 0
        ? Math.round((trades.reduce((a, t) => a + t.grade, 0) / trades.length) * 10) / 10
        : 0,
    }

    return NextResponse.json({
      user_score: userScore || {
        user_id: user.id,
        combined_gm_score: null,
        best_trade_score: tradeStats.average_grade || null,
        best_mock_draft_score: null,
        best_mock_draft_id: null,
        trade_count: tradeStats.total,
        mock_count: mockDrafts.filter(m => m.completed).length,
        trade_weight: 0.60,
        mock_weight: 0.40,
      },
      mock_drafts: mockDrafts,
      trade_stats: tradeStats,
    })
  } catch (error) {
    console.error('User score error:', error)
    return NextResponse.json({ error: 'Failed to fetch user score' }, { status: 500 })
  }
}

// Set best mock draft for combined scoring
export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id } = body

    if (!mock_id) {
      return NextResponse.json({ error: 'mock_id is required' }, { status: 400 })
    }

    // Verify the mock belongs to the user
    const { data: mock } = await datalabAdmin
      .from('draft_mocks')
      .select('id, user_id')
      .eq('id', mock_id)
      .single()

    if (!mock || mock.user_id !== user.id) {
      return NextResponse.json({ error: 'Mock draft not found' }, { status: 404 })
    }

    // Clear any existing best_of_three for this user
    await datalabAdmin
      .from('draft_mocks')
      .update({ is_best_of_three: false })
      .eq('user_id', user.id)
      .eq('is_best_of_three', true)

    // Set the selected mock as best
    await datalabAdmin
      .from('draft_mocks')
      .update({ is_best_of_three: true })
      .eq('id', mock_id)

    // Recalculate combined score
    await updateCombinedUserScore(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Set best mock error:', error)
    return NextResponse.json({ error: 'Failed to set best mock' }, { status: 500 })
  }
}

// Helper function to update combined score
async function updateCombinedUserScore(userId: string) {
  // Get trade score from gm_leaderboard
  const { data: leaderboard } = await datalabAdmin
    .from('gm_leaderboard')
    .select('avg_grade, trades_count')
    .eq('user_id', userId)
    .single()

  const tradeScore = leaderboard?.avg_grade || null
  const tradeCount = leaderboard?.trades_count || 0

  // Get best mock score
  let bestMock: { id: string; mock_score: number } | null = null

  const { data: bestOfThreeMock } = await datalabAdmin
    .from('draft_mocks')
    .select('id, mock_score')
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('is_best_of_three', true)
    .single()

  if (bestOfThreeMock) {
    bestMock = bestOfThreeMock
  } else {
    const { data: highestMock } = await datalabAdmin
      .from('draft_mocks')
      .select('id, mock_score')
      .eq('user_id', userId)
      .eq('is_reset', false)
      .eq('completed', true)
      .not('mock_score', 'is', null)
      .order('mock_score', { ascending: false })
      .limit(1)
      .single()
    bestMock = highestMock
  }

  const mockScore = bestMock?.mock_score || null

  // Count completed mocks
  const { count: mockCount } = await datalabAdmin
    .from('draft_mocks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_reset', false)
    .eq('completed', true)

  // Calculate combined score
  let combinedScore: number | null = null
  if (tradeScore !== null && mockScore !== null) {
    combinedScore = (tradeScore * 0.60) + (mockScore * 0.40)
  } else if (tradeScore !== null) {
    combinedScore = tradeScore
  } else if (mockScore !== null) {
    combinedScore = mockScore
  }

  // Upsert gm_user_scores
  await datalabAdmin
    .from('gm_user_scores')
    .upsert({
      user_id: userId,
      best_trade_score: tradeScore,
      trade_count: tradeCount,
      best_mock_draft_id: bestMock?.id || null,
      best_mock_draft_score: mockScore,
      mock_count: mockCount || 0,
      combined_gm_score: combinedScore ? Math.round(combinedScore * 10) / 10 : null,
      trade_weight: 0.60,
      mock_weight: 0.40,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}
