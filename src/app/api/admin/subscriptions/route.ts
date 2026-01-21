import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    // Get query params for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active', 'canceled', etc.
    const tier = searchParams.get('tier') // 'sm_plus_monthly', 'sm_plus_annual'

    // Build query
    let query = supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        user:user_id (
          id,
          email,
          raw_user_meta_data
        )
      `)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    if (tier && tier !== 'all') {
      query = query.eq('tier', tier)
    }

    const { data: subscriptions, error } = await query

    if (error) {
      console.error('Error fetching subscriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    // Get stats
    const { data: stats } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, status')

    const summary = {
      total: stats?.length || 0,
      active: stats?.filter(s => s.status === 'active').length || 0,
      monthly: stats?.filter(s => s.tier === 'sm_plus_monthly' && s.status === 'active').length || 0,
      annual: stats?.filter(s => s.tier === 'sm_plus_annual' && s.status === 'active').length || 0,
      canceled: stats?.filter(s => s.status === 'canceled').length || 0,
      pastDue: stats?.filter(s => s.status === 'past_due').length || 0,
    }

    return NextResponse.json({ subscriptions, summary })
  } catch (error) {
    console.error('Admin subscriptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
