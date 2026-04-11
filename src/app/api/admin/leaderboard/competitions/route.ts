import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { requireAdmin } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

// GET — list all competitions
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { data, error } = await datalabAdmin
      .from('gm_competitions')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ competitions: data || [] })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST — start a new competition
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { name, max_scored_trades_per_day = 5 } = body

    if (!name) {
      return NextResponse.json({ error: 'Competition name is required' }, { status: 400 })
    }

    // Check if there's already an active competition
    const { data: active } = await datalabAdmin
      .from('gm_competitions')
      .select('id')
      .eq('status', 'active')
      .limit(1)

    if (active && active.length > 0) {
      return NextResponse.json({ error: 'An active competition already exists. End it first.' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from('gm_competitions')
      .insert({
        name,
        start_date: new Date().toISOString(),
        status: 'active',
        max_scored_trades_per_day,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ competition: data })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// PATCH — end a competition (archive results, mark completed)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { competition_id, action } = body

    if (action !== 'end' || !competition_id) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Get the competition
    const { data: comp } = await datalabAdmin
      .from('gm_competitions')
      .select('*')
      .eq('id', competition_id)
      .single()

    if (!comp || comp.status !== 'active') {
      return NextResponse.json({ error: 'Competition not found or not active' }, { status: 400 })
    }

    // Get current standings to archive
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('user_id, user_email, grade')
      .gte('grade', 70)
      .gte('created_at', comp.start_date)
      .not('user_id', 'is', null)
      .not('user_email', 'is', null)

    // Aggregate scores
    const userMap = new Map<string, { user_id: string; user_email: string; score: number; count: number; best: number }>()
    for (const t of (trades || [])) {
      if (!t.user_id || t.user_email === 'api@sportsmockery.com' || t.user_email === 'guest') continue
      const key = t.user_email
      if (userMap.has(key)) {
        const u = userMap.get(key)!
        u.score += (t.grade || 0)
        u.count += 1
        u.best = Math.max(u.best, t.grade || 0)
      } else {
        userMap.set(key, { user_id: t.user_id, user_email: t.user_email, score: t.grade || 0, count: 1, best: t.grade || 0 })
      }
    }

    // Sort and archive
    const sorted = [...userMap.values()].sort((a, b) => b.score - a.score)
    const results = sorted.map((u, i) => ({
      competition_id,
      user_id: u.user_id,
      user_email: u.user_email,
      rank: i + 1,
      gm_score: u.score,
      accepted_trades: u.count,
      best_grade: u.best,
    }))

    if (results.length > 0) {
      await datalabAdmin.from('gm_competition_results').insert(results)
    }

    // Mark competition as completed
    await datalabAdmin
      .from('gm_competitions')
      .update({ status: 'completed', end_date: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', competition_id)

    return NextResponse.json({ success: true, archived: results.length })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
