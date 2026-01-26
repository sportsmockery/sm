import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { getCubsSchedule, getCubsRecord } from '@/lib/cubsData'

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    datalabConfigured: !!datalabAdmin,
  }

  // Test the actual function used by the page
  try {
    const schedule = await getCubsSchedule()
    results.getCubsScheduleResult = {
      count: schedule.length,
      sample: schedule.slice(0, 3).map(g => ({
        gameId: g.gameId,
        date: g.date,
        opponent: g.opponent,
        status: g.status,
        cubsScore: g.cubsScore,
      }))
    }
  } catch (e) {
    results.getCubsScheduleResult = { error: String(e) }
  }

  // Test raw query
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    // MLB season logic: if before April, use previous year
    const targetSeason = month < 4 ? year - 1 : year
    results.computedSeason = { year, month, targetSeason }

    const seasonStartDate = `${targetSeason}-03-18`

    const { data, error, count } = await datalabAdmin
      .from('cubs_games_master')
      .select('id, game_date, season, opponent, cubs_score, opponent_score, cubs_win', { count: 'exact' })
      .eq('season', targetSeason)
      .gte('game_date', seasonStartDate)
      .order('game_date', { ascending: false })
      .limit(5)

    if (error) {
      results.rawQueryResult = { error: error.message, details: error.details, hint: error.hint, code: error.code }
    } else {
      results.rawQueryResult = {
        totalCount: count,
        sample: data
      }
    }
  } catch (e) {
    results.rawQueryResult = { error: String(e) }
  }

  try {
    const record = await getCubsRecord()
    results.getCubsRecordResult = record
  } catch (e) {
    results.getCubsRecordResult = { error: String(e) }
  }

  if (!datalabAdmin) {
    return NextResponse.json({ ...results, error: 'datalabAdmin not configured' })
  }

  // Check available seasons
  try {
    const { data: seasons } = await datalabAdmin
      .from('cubs_games_master')
      .select('season')
      .order('season', { ascending: false })
      .limit(500)

    if (seasons) {
      const uniqueSeasons = [...new Set(seasons.map((s: any) => s.season))]
      results.availableSeasons = uniqueSeasons.slice(0, 10)
    }
  } catch (e) {
    results.availableSeasons = { error: String(e) }
  }

  return NextResponse.json(results)
}
