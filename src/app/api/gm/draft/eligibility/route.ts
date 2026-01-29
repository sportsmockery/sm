import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Fetch eligibility for all Chicago teams
    const { data: teams, error } = await datalabAdmin
      .from('gm_draft_eligibility')
      .select('*')
      .in('team_key', ['chi', 'chc', 'chw'])
      .eq('draft_year', 2026)

    if (error) {
      console.error('Eligibility fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
    }

    return NextResponse.json({ teams: teams || [] })
  } catch (error) {
    console.error('Eligibility error:', error)
    return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
  }
}
