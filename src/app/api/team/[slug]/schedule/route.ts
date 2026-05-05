import { NextRequest, NextResponse } from 'next/server'

import { getBearsSchedule } from '@/lib/bearsData'
import { getBullsSchedule } from '@/lib/bullsData'
import { getBlackhawksSchedule } from '@/lib/blackhawksData'
import { getCubsSchedule } from '@/lib/cubsData'
import { getWhiteSoxSchedule } from '@/lib/whitesoxData'

export const dynamic = 'force-dynamic'

type ScheduleFetcher = (season?: number) => Promise<any[]>

const SLUG_TO_FETCHER: Record<string, ScheduleFetcher> = {
  bears: getBearsSchedule,
  bulls: getBullsSchedule,
  blackhawks: getBlackhawksSchedule,
  cubs: getCubsSchedule,
  whitesox: getWhiteSoxSchedule,
}

/**
 * GET /api/team/[slug]/schedule?season=2025
 *
 * Returns the full schedule the web hub pages already render — each game
 * carries date/time, opponent + logo, home/away, score, result, week,
 * gameType (preseason/regular/postseason), and articleSlug for recap links.
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
  const season = seasonParam ? parseInt(seasonParam, 10) : undefined

  try {
    const games = await fetcher(season)
    return NextResponse.json({
      slug,
      season: season ?? null,
      total: games.length,
      games,
    })
  } catch (error) {
    console.error(`[/api/team/${slug}/schedule] error:`, (error as Error).message)
    return NextResponse.json({ error: 'Failed to load schedule' }, { status: 500 })
  }
}
