import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

interface AnalyticsResult {
  total_trades: number
  accepted_trades: number
  rejected_trades: number
  dangerous_trades: number
  average_grade: number
  highest_grade: number
  lowest_grade: number
  total_gm_score: number
  grade_distribution: Array<{
    bucket: string // "0-10", "10-20", etc.
    count: number
    percentage: number
  }>
  trading_partners: Array<{
    team_name: string
    team_key: string
    trade_count: number
    avg_grade: number
  }>
  position_analysis: Array<{
    position: string
    sent_count: number
    received_count: number
    net_value: number
  }>
  activity_timeline: Array<{
    date: string
    trade_count: number
    avg_grade: number
  }>
  chicago_teams: Array<{
    team: string
    trade_count: number
    avg_grade: number
    accepted_rate: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/analytics?user_id=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local analytics
    }

    // Local analytics from database
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        total_trades: 0,
        accepted_trades: 0,
        rejected_trades: 0,
        dangerous_trades: 0,
        average_grade: 0,
        highest_grade: 0,
        lowest_grade: 0,
        total_gm_score: 0,
        grade_distribution: [],
        trading_partners: [],
        position_analysis: [],
        activity_timeline: [],
        chicago_teams: [],
      } as AnalyticsResult)
    }

    // Calculate analytics
    const accepted = trades.filter(t => t.status === 'accepted')
    const rejected = trades.filter(t => t.status === 'rejected')
    const dangerous = trades.filter(t => t.is_dangerous)

    const grades = trades.map(t => t.grade)
    const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length

    // Grade distribution
    const buckets = Array(10).fill(0)
    trades.forEach(t => {
      const idx = Math.min(9, Math.floor(t.grade / 10))
      buckets[idx]++
    })
    const gradeDistribution = buckets.map((count, i) => ({
      bucket: `${i * 10}-${(i + 1) * 10}`,
      count,
      percentage: Math.round((count / trades.length) * 100),
    }))

    // Trading partners
    const partnerMap = new Map<string, { count: number; totalGrade: number; key: string }>()
    trades.forEach(t => {
      const existing = partnerMap.get(t.trade_partner) || { count: 0, totalGrade: 0, key: t.partner_team_key || '' }
      partnerMap.set(t.trade_partner, {
        count: existing.count + 1,
        totalGrade: existing.totalGrade + t.grade,
        key: existing.key || t.partner_team_key || '',
      })
    })
    const tradingPartners = Array.from(partnerMap.entries())
      .map(([name, data]) => ({
        team_name: name,
        team_key: data.key,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
      }))
      .sort((a, b) => b.trade_count - a.trade_count)
      .slice(0, 10)

    // Position analysis
    const positionMap = new Map<string, { sent: number; received: number; value: number }>()
    trades.forEach(t => {
      (t.players_sent || []).forEach((p: any) => {
        const existing = positionMap.get(p.position) || { sent: 0, received: 0, value: 0 }
        positionMap.set(p.position, { ...existing, sent: existing.sent + 1 })
      })
      ;(t.players_received || []).forEach((p: any) => {
        const existing = positionMap.get(p.position) || { sent: 0, received: 0, value: 0 }
        positionMap.set(p.position, { ...existing, received: existing.received + 1 })
      })
    })
    const positionAnalysis = Array.from(positionMap.entries())
      .map(([position, data]) => ({
        position,
        sent_count: data.sent,
        received_count: data.received,
        net_value: data.received - data.sent,
      }))
      .sort((a, b) => b.sent_count + b.received_count - (a.sent_count + a.received_count))

    // Activity timeline (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentTrades = trades.filter(t => new Date(t.created_at) >= thirtyDaysAgo)
    const dateMap = new Map<string, { count: number; totalGrade: number }>()
    recentTrades.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0]
      const existing = dateMap.get(date) || { count: 0, totalGrade: 0 }
      dateMap.set(date, { count: existing.count + 1, totalGrade: existing.totalGrade + t.grade })
    })
    const activityTimeline = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Chicago teams
    const chicagoMap = new Map<string, { count: number; totalGrade: number; accepted: number }>()
    trades.forEach(t => {
      const existing = chicagoMap.get(t.chicago_team) || { count: 0, totalGrade: 0, accepted: 0 }
      chicagoMap.set(t.chicago_team, {
        count: existing.count + 1,
        totalGrade: existing.totalGrade + t.grade,
        accepted: existing.accepted + (t.status === 'accepted' ? 1 : 0),
      })
    })
    const chicagoTeams = Array.from(chicagoMap.entries())
      .map(([team, data]) => ({
        team,
        trade_count: data.count,
        avg_grade: Math.round(data.totalGrade / data.count),
        accepted_rate: Math.round((data.accepted / data.count) * 100),
      }))
      .sort((a, b) => b.trade_count - a.trade_count)

    const result: AnalyticsResult = {
      total_trades: trades.length,
      accepted_trades: accepted.length,
      rejected_trades: rejected.length,
      dangerous_trades: dangerous.length,
      average_grade: Math.round(avgGrade * 10) / 10,
      highest_grade: Math.max(...grades),
      lowest_grade: Math.min(...grades),
      total_gm_score: accepted.reduce((sum, t) => sum + t.grade, 0),
      grade_distribution: gradeDistribution,
      trading_partners: tradingPartners,
      position_analysis: positionAnalysis,
      activity_timeline: activityTimeline,
      chicago_teams: chicagoTeams,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('GM analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
