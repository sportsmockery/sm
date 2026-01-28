import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'


export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '50'), 100)
    const sessionId = request.nextUrl.searchParams.get('session_id')
    const offset = (page - 1) * limit

    let query = datalabAdmin
      .from('gm_trades')
      .select('*, gm_trade_items(*)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (sessionId) {
      query = query.eq('session_id', sessionId)
    }

    const { data: trades, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      trades: trades || [],
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('GM trades error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/trades GET' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await datalabAdmin
      .from('gm_sessions')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    await datalabAdmin.from('gm_trades').delete().eq('user_id', user.id)
    await datalabAdmin.from('gm_leaderboard').delete().eq('user_id', user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GM trades delete error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/gm/trades DELETE' }) } catch {}
    return NextResponse.json({ error: 'Failed to clear trades' }, { status: 500 })
  }
}
