import { NextRequest, NextResponse } from 'next/server'

import { getBearsRosterGrouped } from '@/lib/bearsData'
import { getBullsRosterGrouped } from '@/lib/bullsData'
import { getBlackhawksRosterGrouped } from '@/lib/blackhawksData'
import { getCubsRosterGrouped } from '@/lib/cubsData'
import { getWhiteSoxRosterGrouped } from '@/lib/whitesoxData'

export const dynamic = 'force-dynamic'

const SLUG_TO_FETCHER: Record<string, () => Promise<Record<string, any[]>>> = {
  bears: getBearsRosterGrouped,
  bulls: getBullsRosterGrouped,
  blackhawks: getBlackhawksRosterGrouped,
  cubs: getCubsRosterGrouped,
  whitesox: getWhiteSoxRosterGrouped,
}

/**
 * GET /api/team/[slug]/roster
 *
 * Returns the same position-grouped roster the web hub pages render. Each
 * group is an array of the team's player record (BearsPlayer / BullsPlayer /
 * etc.) — mobile reads `fullName`, `jerseyNumber`, `position`, `headshotUrl`,
 * `height`, `weight`, `age`, `college`, `experience`, `status`, `side`.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const fetcher = SLUG_TO_FETCHER[slug.toLowerCase()]
  if (!fetcher) {
    return NextResponse.json({ error: 'Unknown team' }, { status: 404 })
  }

  try {
    const groups = await fetcher()
    const players = Object.values(groups).flat()
    const positionGroups = Object.entries(groups)
      .filter(([, list]) => list.length > 0)
      .map(([key, list]) => ({ group: key, players: list }))

    return NextResponse.json({
      slug,
      total: players.length,
      players,
      positionGroups,
    })
  } catch (error) {
    console.error(`[/api/team/${slug}/roster] error:`, (error as Error).message)
    return NextResponse.json({ error: 'Failed to load roster' }, { status: 500 })
  }
}
