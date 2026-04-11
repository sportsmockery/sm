import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// GET — current scores with anti-inflation applied
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    // Get active competition for date filter and daily cap
    const { data: activeComp } = await datalabAdmin
      .from('gm_competitions')
      .select('*')
      .eq('status', 'active')
      .limit(1)

    const comp = activeComp?.[0]
    const dailyCap = comp?.max_scored_trades_per_day || 5

    // Query accepted trades, filtered to competition period if active
    let query = datalabAdmin
      .from('gm_trades')
      .select('user_id, user_email, grade, trade_hash, created_at')
      .gte('grade', 70)
      .not('user_id', 'is', null)
      .not('user_email', 'is', null)
      .order('created_at', { ascending: true })

    if (comp) {
      query = query.gte('created_at', comp.start_date)
    }

    const { data: trades, error } = await query
    if (error) throw error

    // Per-request tracking maps
    const dailyCountMap = new Map<string, number>()
    const seenHashes = new Set<string>()

    // Aggregate per user with anti-inflation
    const userMap = new Map<string, {
      user_id: string
      user_email: string
      gm_score: number
      accepted_trades: number
      unique_trades: number
      capped_trades: number
      best_grade: number
    }>()

    for (const t of (trades || [])) {
      if (!t.user_id || t.user_email === 'api@sportsmockery.com' || t.user_email === 'guest') continue

      const key = t.user_email
      if (!userMap.has(key)) {
        userMap.set(key, {
          user_id: t.user_id,
          user_email: t.user_email,
          gm_score: 0,
          accepted_trades: 0,
          unique_trades: 0,
          capped_trades: 0,
          best_grade: 0,
        })
      }

      const u = userMap.get(key)!
      u.accepted_trades += 1
      u.best_grade = Math.max(u.best_grade, t.grade || 0)

      // Anti-inflation: check duplicate by trade_hash
      if (t.trade_hash) {
        const hashKey = `${key}:${t.trade_hash}`
        if (seenHashes.has(hashKey)) {
          continue // Duplicate trade, skip
        }
        seenHashes.add(hashKey)
      }

      // Anti-inflation: check daily cap
      const tradeDate = new Date(t.created_at).toISOString().slice(0, 10)
      const dayKey = `${key}:${tradeDate}`
      if (!dailyCountMap.has(dayKey)) dailyCountMap.set(dayKey, 0)
      const dayCount = dailyCountMap.get(dayKey)!

      if (dayCount < dailyCap) {
        u.gm_score += (t.grade || 0)
        u.unique_trades += 1
        dailyCountMap.set(dayKey, dayCount + 1)
      } else {
        u.capped_trades += 1
      }
    }

    const sorted = [...userMap.values()].sort((a, b) => b.gm_score - a.gm_score)

    return NextResponse.json({ scores: sorted, daily_cap: dailyCap, competition: comp || null })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
