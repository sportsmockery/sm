import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Map sport field to league for prospect check
const SPORT_TO_LEAGUE: Record<string, string> = {
  nfl: 'NFL',
  nba: 'NBA',
  nhl: 'NHL',
  mlb: 'MLB',
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

    // Enhance eligibility based on prospect availability AND window status
    const enhancedTeams = (teams || []).map((team: Record<string, unknown>) => {
      // Use sport field (lowercase) to look up league
      const sport = (team.sport as string || '').toLowerCase()
      const league = SPORT_TO_LEAGUE[sport]
      const hasProspects = league ? prospectCounts[league] > 0 : false

      // Check window status - only 'open' allows drafting
      const windowStatus = team.mock_draft_window_status as string
      const windowOpen = windowStatus === 'open'

      // Team is only eligible if:
      // 1. Prospects exist for this sport AND
      // 2. Draft window is open (not closed/completed/not_yet_open)
      const isEligible = hasProspects && windowOpen

      return {
        ...team,
        eligible: isEligible,
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
