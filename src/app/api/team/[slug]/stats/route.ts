import { NextRequest, NextResponse } from 'next/server'

import { getBearsStats } from '@/lib/bearsData'
import { getBullsStats } from '@/lib/bullsData'
import { getBlackhawksStats } from '@/lib/blackhawksData'
import { getCubsStats } from '@/lib/cubsData'
import { getWhiteSoxStats } from '@/lib/whitesoxData'

export const dynamic = 'force-dynamic'

type StatsFetcher = (season?: number, gameType?: 'regular' | 'postseason') => Promise<any>

const SLUG_TO_FETCHER: Record<string, StatsFetcher> = {
  bears: getBearsStats,
  bulls: getBullsStats,
  blackhawks: getBlackhawksStats,
  cubs: getCubsStats,
  whitesox: getWhiteSoxStats,
}

/**
 * GET /api/team/[slug]/stats?season=2025&gameType=regular
 *
 * Returns the full team stats payload (record, averages, ranks, plus
 * sport-specific leaderboards) the web hub pages render. The exact
 * leaderboard categories vary by sport — Bears/NFL has passing/rushing/
 * receiving/defense/sacks/interceptions; Bulls/NBA has points/rebounds/
 * assists/steals/blocks; Blackhawks/NHL has goals/assists/points/sv%;
 * Cubs+WhiteSox/MLB has avg/hr/obp/rbi/ab.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const fetcher = SLUG_TO_FETCHER[slug.toLowerCase()]
  if (!fetcher) {
    return NextResponse.json({ error: 'Unknown team' }, { status: 404 })
  }

  const seasonParam = request.nextUrl.searchParams.get('season')
  const gameTypeParam = request.nextUrl.searchParams.get('gameType')
  const season = seasonParam ? parseInt(seasonParam, 10) : undefined
  const gameType =
    gameTypeParam === 'postseason' ? 'postseason' : 'regular'

  try {
    const stats = await fetcher(season, gameType)
    return NextResponse.json({ slug, ...stats })
  } catch (error) {
    console.error(`[/api/team/${slug}/stats] error:`, (error as Error).message)
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
