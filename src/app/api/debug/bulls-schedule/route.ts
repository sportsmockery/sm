import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    datalabConfigured: !!datalabAdmin,
  }

  if (!datalabAdmin) {
    return NextResponse.json({ ...results, error: 'datalabAdmin not configured' })
  }

  // Test 1: Check if we can connect at all
  try {
    const { data: test, error: testError } = await datalabAdmin
      .from('bulls_games_master')
      .select('count')
      .limit(1)

    results.connectionTest = testError ? { error: testError.message } : { success: true }
  } catch (e) {
    results.connectionTest = { error: String(e) }
  }

  // Test 2: Check available seasons
  try {
    const { data: seasons, error: seasonsError } = await datalabAdmin
      .from('bulls_games_master')
      .select('season')
      .order('season', { ascending: false })

    if (seasonsError) {
      results.availableSeasons = { error: seasonsError.message }
    } else {
      const uniqueSeasons = [...new Set(seasons?.map(s => s.season))]
      results.availableSeasons = uniqueSeasons.slice(0, 10)
    }
  } catch (e) {
    results.availableSeasons = { error: String(e) }
  }

  // Test 3: Count games per season
  try {
    const { data: countData, error: countError } = await datalabAdmin
      .from('bulls_games_master')
      .select('season')

    if (countError) {
      results.gamesPerSeason = { error: countError.message }
    } else {
      const countBySeason: Record<number, number> = {}
      countData?.forEach(g => {
        countBySeason[g.season] = (countBySeason[g.season] || 0) + 1
      })
      results.gamesPerSeason = countBySeason
    }
  } catch (e) {
    results.gamesPerSeason = { error: String(e) }
  }

  // Test 4: Try fetching games for season 2026
  try {
    const { data: games2026, error: games2026Error } = await datalabAdmin
      .from('bulls_games_master')
      .select('id, game_date, opponent, bulls_score, season')
      .eq('season', 2026)
      .order('game_date', { ascending: false })
      .limit(5)

    if (games2026Error) {
      results.season2026Sample = { error: games2026Error.message, details: games2026Error.details }
    } else {
      results.season2026Sample = {
        count: games2026?.length || 0,
        sample: games2026?.slice(0, 3)
      }
    }
  } catch (e) {
    results.season2026Sample = { error: String(e) }
  }

  // Test 5: Try fetching games for season 2025 (fallback)
  try {
    const { data: games2025, error: games2025Error } = await datalabAdmin
      .from('bulls_games_master')
      .select('id, game_date, opponent, bulls_score, season')
      .eq('season', 2025)
      .order('game_date', { ascending: false })
      .limit(5)

    if (games2025Error) {
      results.season2025Sample = { error: games2025Error.message }
    } else {
      results.season2025Sample = {
        count: games2025?.length || 0,
        sample: games2025?.slice(0, 3)
      }
    }
  } catch (e) {
    results.season2025Sample = { error: String(e) }
  }

  return NextResponse.json(results)
}
