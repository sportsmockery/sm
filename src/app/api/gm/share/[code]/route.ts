import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

    const { data: trade, error } = await datalabAdmin
      .from('gm_trades')
      .select('id, chicago_team, sport, trade_partner, players_sent, players_received, grade, grade_reasoning, status, is_dangerous, improvement_score, trade_summary, talent_balance, contract_value, team_fit, future_assets, partner_team_key, partner_team_logo, chicago_team_logo, draft_picks_sent, draft_picks_received, created_at')
      .eq('shared_code', code)
      .single()

    if (error || !trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    const { data: items } = await datalabAdmin
      .from('gm_trade_items')
      .select('*')
      .eq('trade_id', trade.id)
      .order('side')
      .order('asset_type')

    return NextResponse.json({ trade: { ...trade, items: items || [] } })
  } catch (error) {
    console.error('GM share error:', error)
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 })
  }
}
