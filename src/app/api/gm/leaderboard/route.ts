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

    // Get active competition for date filter and daily cap
    const { data: activeComp } = await datalabAdmin
      .from('gm_competitions')
      .select('*')
      .eq('status', 'active')
      .limit(1)

    const comp = activeComp?.[0]
    const dailyCap = comp?.max_scored_trades_per_day || 5

    // Compute leaderboard from gm_trades with anti-inflation
    let tradesQuery = datalabAdmin
      .from('gm_trades')
      .select('user_id, user_email, grade, trade_hash, created_at')
      .gte('grade', 70)
      .not('user_id', 'is', null)
      .not('user_email', 'is', null)
      .order('created_at', { ascending: true })

    // Filter by competition period
    if (comp) {
      tradesQuery = tradesQuery.gte('created_at', comp.start_date)
    }

    // Filter by sport if specified
    if (sport && sport !== 'ALL') {
      tradesQuery = tradesQuery.eq('sport', sport.toLowerCase())
    }

    const { data: trades, error } = await tradesQuery
    if (error) throw error

    // Anti-inflation tracking
    const dailyCountMap = new Map<string, number>()
    const seenHashes = new Set<string>()

    // Aggregate per user with daily cap + duplicate detection
    const userMap = new Map<string, { user_id: string; user_email: string; total_score: number; trades_count: number; best_grade: number }>()
    for (const trade of (trades || [])) {
      if (!trade.user_id || !trade.user_email || trade.user_email === 'api@sportsmockery.com' || trade.user_email === 'guest') continue

      const key = trade.user_email
      if (!userMap.has(key)) {
        userMap.set(key, { user_id: trade.user_id, user_email: trade.user_email, total_score: 0, trades_count: 0, best_grade: 0 })
      }
      const u = userMap.get(key)!
      u.best_grade = Math.max(u.best_grade, trade.grade || 0)

      // Skip duplicate trades (same trade_hash for same user)
      if (trade.trade_hash) {
        const hashKey = `${key}:${trade.trade_hash}`
        if (seenHashes.has(hashKey)) continue
        seenHashes.add(hashKey)
      }

      // Daily cap: max N scored trades per user per day
      const tradeDate = new Date(trade.created_at).toISOString().slice(0, 10)
      const dayKey = `${key}:${tradeDate}`
      if (!dailyCountMap.has(dayKey)) dailyCountMap.set(dayKey, 0)
      const dayCount = dailyCountMap.get(dayKey)!
      if (dayCount >= dailyCap) continue
      dailyCountMap.set(dayKey, dayCount + 1)

      u.total_score += (trade.grade || 0)
      u.trades_count += 1
    }

    // Sort by total_score descending and limit
    const sorted = [...userMap.values()]
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, limit)

    // Add rank and display_name
    const rankedLeaderboard = sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      display_name: entry.user_email.split('@')[0],
      score: entry.total_score,
      activities_count: entry.trades_count,
    }))

    const totalParticipants = sorted.length

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
