import { NextRequest, NextResponse } from 'next/server'
import { getTeamSeasonOverview, getTeamKeyPlayers, getTeamTrends } from '@/lib/team-sidebar-data'

const VALID_TEAMS = ['bears', 'bulls', 'cubs', 'blackhawks', 'whitesox'] as const

export async function GET(request: NextRequest) {
  const teamKey = request.nextUrl.searchParams.get('team')

  if (!teamKey || !VALID_TEAMS.includes(teamKey as any)) {
    return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
  }

  try {
    const [season, players, trends] = await Promise.all([
      getTeamSeasonOverview(teamKey as any),
      getTeamKeyPlayers(teamKey as any),
      getTeamTrends(teamKey as any),
    ])

    return NextResponse.json({ season, players, trends }, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    console.error('Team sidebar API error:', error)
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 })
  }
}
