import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gm/user-position
 *
 * Get the current user's position in the leaderboard for a specific sport.
 * Returns their rank, score, and activities even if not in top 20.
 * This is PRIVATE data - only the user themselves can see it.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({
        error: 'Sign in to view your leaderboard position',
        code: 'AUTH_REQUIRED',
      }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport') || 'NFL'

    // Get current month/year
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    // Map sport to team for GM leaderboard (use existing gm_leaderboard table)
    const sportToTeam: Record<string, string> = {
      'NFL': 'bears',
      'NBA': 'bulls',
      'MLB': 'cubs',
      'NHL': 'blackhawks',
    }
    const favoriteTeam = sportToTeam[sport] || 'bears'

    // First, get ALL entries for the sport to calculate rank
    const { data: allEntries, error: allError } = await datalabAdmin
      .from('gm_leaderboard')
      .select('user_id, total_improvement, total_trades, total_drafts, total_sims')
      .eq('favorite_team', favoriteTeam)
      .order('total_improvement', { ascending: false })

    if (allError) throw allError

    // Find user's position
    const userIndex = allEntries?.findIndex(e => e.user_id === user.id) ?? -1

    if (userIndex === -1) {
      // User has no entries for this sport
      return NextResponse.json({
        user_id: user.id,
        sport,
        competing: false,
        message: `You haven't made any ${sport} trades or drafts yet.`,
      })
    }

    const userEntry = allEntries[userIndex]
    const totalParticipants = allEntries.length

    // Get user's detailed stats from gm_trades
    const { data: userTrades, error: tradesError } = await datalabAdmin
      .from('gm_trades')
      .select('grade, is_accepted, created_at')
      .eq('user_id', user.id)
      .eq('sport', sport)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastActivityAt = userTrades?.[0]?.created_at || null

    // Calculate percentile
    const percentile = Math.round(100 - ((userIndex + 1) / totalParticipants) * 100)

    // Get what score is needed for top 20
    const top20Cutoff = allEntries.length >= 20 ? allEntries[19].total_improvement : 0

    return NextResponse.json({
      user_id: user.id,
      sport,
      competing: true,
      rank: userIndex + 1,
      score: userEntry.total_improvement || 0,
      activities_count: (userEntry.total_trades || 0) + (userEntry.total_drafts || 0) + (userEntry.total_sims || 0),
      trades_count: userEntry.total_trades || 0,
      drafts_count: userEntry.total_drafts || 0,
      sims_count: userEntry.total_sims || 0,
      total_participants: totalParticipants,
      percentile,
      last_activity_at: lastActivityAt,
      top20_cutoff: top20Cutoff,
      points_to_top20: userIndex >= 20 ? Math.max(0, top20Cutoff - (userEntry.total_improvement || 0)) : 0,
    })
  } catch (error) {
    console.error('User position error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/user-position',
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch position' }, { status: 500 })
  }
}
