import { NextRequest, NextResponse } from 'next/server'
import { getTeamSeasonOverview, getTeamKeyPlayers, getTeamTrends } from '@/lib/team-sidebar-data'
import { fetchTeamRecord } from '@/lib/team-config'
import { datalabAdmin } from '@/lib/supabase-datalab'

const VALID_TEAMS = ['bears', 'bulls', 'cubs', 'blackhawks', 'whitesox'] as const

export async function GET(request: NextRequest) {
  const teamKey = request.nextUrl.searchParams.get('team')
  const debug = request.nextUrl.searchParams.get('debug') === '1'

  if (!teamKey || !VALID_TEAMS.includes(teamKey as any)) {
    return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
  }

  try {
    const [season, players, trends] = await Promise.all([
      getTeamSeasonOverview(teamKey as any),
      getTeamKeyPlayers(teamKey as any),
      getTeamTrends(teamKey as any),
    ])

    // Optional diagnostics: ?debug=1 surfaces the raw fetchTeamRecord result
    // and key env-var presence so we can identify why a deploy is returning
    // 0-0 records without redeploying with console.log.
    let debugInfo: any = undefined
    if (debug) {
      let rawRecord: any = null
      let recordError: string | null = null
      try {
        rawRecord = await fetchTeamRecord(teamKey)
      } catch (e: any) {
        recordError = e?.message || String(e)
      }

      // Direct probe — bypass fetchTeamRecord entirely so we can see the
      // raw supabase-js response (data, error, status) for the very query
      // that's silently returning null.
      const directProbeResults: Record<string, unknown> = {}
      try {
        const bearsProbe: any = await datalabAdmin
          .from('bears_season_record')
          .select('*')
          .eq('season', 2025)
          .single()
        directProbeResults.bears_season_record_2025 = {
          data: bearsProbe.data,
          error: bearsProbe.error,
          status: bearsProbe.status,
          statusText: bearsProbe.statusText,
        }
      } catch (e: any) {
        directProbeResults.bears_season_record_2025 = { thrown: e?.message || String(e) }
      }
      try {
        const bullsProbe: any = await datalabAdmin
          .from('bulls_seasons')
          .select('*')
          .eq('season', 2026)
          .single()
        directProbeResults.bulls_seasons_2026 = {
          data: bullsProbe.data ? { wins: bullsProbe.data.wins, losses: bullsProbe.data.losses } : null,
          error: bullsProbe.error,
          status: bullsProbe.status,
        }
      } catch (e: any) {
        directProbeResults.bulls_seasons_2026 = { thrown: e?.message || String(e) }
      }

      debugInfo = {
        rawRecord,
        recordError,
        directProbe: directProbeResults,
        env: {
          hasDatalabUrl: !!process.env.DATALAB_SUPABASE_URL,
          hasDatalabAnon: !!process.env.DATALAB_SUPABASE_ANON_KEY,
          hasDatalabService: !!process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY,
          datalabUrlPrefix: (process.env.DATALAB_SUPABASE_URL || '').slice(0, 40),
        },
      }
    }

    const body: any = { season, players, trends }
    if (debug) body._debug = debugInfo
    return NextResponse.json(body, {
      headers: { 'Cache-Control': debug ? 'no-store' : 'public, s-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    console.error('Team sidebar API error:', error)
    return NextResponse.json({ error: 'Failed to fetch team data' }, { status: 500 })
  }
}
