import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport to team
const SPORT_TO_TEAM: Record<string, string> = {
  'NFL': 'bears',
  'NBA': 'bulls',
  'MLB': 'cubs',
  'NHL': 'blackhawks',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({
        error: 'Sign in to view the GM leaderboard and compete with other fans',
        code: 'AUTH_REQUIRED',
      }, { status: 401 })
    }

    const team = request.nextUrl.searchParams.get('team')
    const sport = request.nextUrl.searchParams.get('sport')
    const limitParam = request.nextUrl.searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    // Determine team filter from sport or direct team param
    let teamFilter = team
    if (sport && SPORT_TO_TEAM[sport]) {
      teamFilter = SPORT_TO_TEAM[sport]
    }

    let query = datalabAdmin
      .from('gm_leaderboard')
      .select('*, users:user_id(username, email)')
      .order('total_improvement', { ascending: false })
      .limit(limit)

    if (teamFilter) {
      query = query.eq('favorite_team', teamFilter)
    }

    const { data: leaderboard, error } = await query
    if (error) throw error

    // Get total count for the sport
    let countQuery = datalabAdmin
      .from('gm_leaderboard')
      .select('id', { count: 'exact', head: true })

    if (teamFilter) {
      countQuery = countQuery.eq('favorite_team', teamFilter)
    }

    const { count: totalParticipants } = await countQuery

    // Add rank to each entry
    const rankedLeaderboard = leaderboard?.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      score: entry.total_improvement || 0,
      activities_count: (entry.total_trades || 0) + (entry.total_drafts || 0) + (entry.total_sims || 0),
      trades_count: entry.total_trades || 0,
      drafts_count: entry.total_drafts || 0,
      sims_count: entry.total_sims || 0,
    })) || []

    // Get current month info
    const now = new Date()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']

    // Calculate days remaining in month
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const daysRemaining = lastDay - now.getDate()

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      total_participants: totalParticipants || 0,
      sport: sport || (teamFilter ? Object.keys(SPORT_TO_TEAM).find(s => SPORT_TO_TEAM[s] === teamFilter) : 'ALL'),
      month: now.getMonth() + 1,
      month_name: monthNames[now.getMonth()],
      year: now.getFullYear(),
      days_remaining: daysRemaining,
      status: 'active',
    })
  } catch (error) {
    console.error('GM leaderboard error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/leaderboard',
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
