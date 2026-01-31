import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map chicago_team to league for prospect check
const TEAM_TO_LEAGUE: Record<string, string> = {
  bears: 'NFL',
  bulls: 'NBA',
  blackhawks: 'NHL',
  cubs: 'MLB',
  whitesox: 'MLB',
}

export async function GET() {
  try {
    // Fetch eligibility from gm_draft_eligibility table
    const { data: teams, error } = await datalabAdmin
      .from('gm_draft_eligibility')
      .select('*')
      .in('team_key', ['chi', 'chc', 'chw'])
      .eq('draft_year', 2026)

    if (error) {
      console.error('Eligibility fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
    }

    // Also check if prospects actually exist for each sport
    // This ensures eligibility is based on actual data availability
    const prospectCounts: Record<string, number> = {}
    for (const league of ['NFL', 'NBA', 'NHL', 'MLB']) {
      const { count } = await datalabAdmin
        .from('draft_prospects')
        .select('*', { count: 'exact', head: true })
        .eq('league', league)
        .eq('draft_year', 2026)
      prospectCounts[league] = count || 0
    }

    // Enhance eligibility based on prospect availability
    const enhancedTeams = (teams || []).map((team: Record<string, unknown>) => {
      const league = TEAM_TO_LEAGUE[team.chicago_team as string]
      const hasProspects = league ? prospectCounts[league] > 0 : false

      // If prospects exist, team should be eligible regardless of eligibility table
      return {
        ...team,
        eligible: hasProspects || team.eligible,
        prospect_count: league ? prospectCounts[league] : 0,
        data_available: hasProspects,
      }
    })

    return NextResponse.json({ teams: enhancedTeams })
  } catch (error) {
    console.error('Eligibility error:', error)
    return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
  }
}
