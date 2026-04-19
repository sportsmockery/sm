import { NextRequest, NextResponse } from 'next/server'
import { getTeamSeasonOverview, getTeamKeyPlayers, getTeamTrends } from '@/lib/team-sidebar-data'

const VALID_TEAMS = ['bears', 'bulls', 'cubs', 'blackhawks', 'whitesox'] as const

// Hard timeout to prevent serverless function from hanging indefinitely
const ROUTE_TIMEOUT_MS = 20_000

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ])
}

export async function GET(request: NextRequest) {
  const teamKey = request.nextUrl.searchParams.get('team')

  if (!teamKey || !VALID_TEAMS.includes(teamKey as any)) {
    return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
  }

  try {
    const fallbackSeason = {
      teamSlug: `chicago-${teamKey === 'whitesox' ? 'white-sox' : teamKey}`,
      teamName: teamKey,
      season: new Date().getFullYear(),
      record: { wins: 0, losses: 0, ties: 0 },
      standing: '',
      nextGame: null,
      lastGame: null,
    }

    const [season, players, trends] = await Promise.all([
      withTimeout(getTeamSeasonOverview(teamKey as any), ROUTE_TIMEOUT_MS, fallbackSeason),
      withTimeout(getTeamKeyPlayers(teamKey as any), ROUTE_TIMEOUT_MS, []),
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
