import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export async function GET() {
  try {
    // Fetch eligibility from new datalab endpoint
    const res = await fetch(`${DATALAB_URL}/api/gm/draft/teams`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('Datalab eligibility fetch error:', res.status)
      return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
    }

    const data = await res.json()

    // Map team_key to our frontend keys and pass through all fields
    const teams = (data.teams || []).map((team: Record<string, unknown>) => ({
      ...team,
      // Ensure consistent keys for frontend
      team_key: team.team_key,
      team_name: team.team_name,
      sport: team.sport,
      draft_position: team.draft_position,
      season_status: team.season_status,
      eligible: team.eligible,
      reason: team.reason,
      logo_url: team.logo_url,
    }))

    return NextResponse.json({
      teams,
      draft_year: data.draft_year,
      count: data.count,
    })
  } catch (error) {
    console.error('Eligibility error:', error)
    return NextResponse.json({ error: 'Failed to fetch eligibility' }, { status: 500 })
  }
}
