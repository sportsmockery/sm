import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

/**
 * GET /api/admin/player-search?q=Jordan+Love
 * Searches all DataLab player tables for headshot URLs.
 * Covers Chicago team rosters + opponent stats for all other NFL/NBA/NHL/MLB players.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) {
    return NextResponse.json({ players: [] })
  }

  if (!datalabAdmin) {
    return NextResponse.json({ error: 'DataLab not configured' }, { status: 500 })
  }

  const results: Array<{ name: string; team: string; position: string; headshot_url: string; espn_id: string }> = []
  const seen = new Set<string>()

  // 1. Search Chicago team player tables
  const teamTables = [
    { table: 'bears_players', team: 'Bears', sport: 'NFL' },
    { table: 'bulls_players', team: 'Bulls', sport: 'NBA' },
    { table: 'blackhawks_players', team: 'Blackhawks', sport: 'NHL' },
    { table: 'cubs_players', team: 'Cubs', sport: 'MLB' },
    { table: 'whitesox_players', team: 'White Sox', sport: 'MLB' },
  ]

  await Promise.all(teamTables.map(async ({ table, team }) => {
    try {
      const { data } = await datalabAdmin
        .from(table)
        .select('name, espn_id, headshot_url, position')
        .ilike('name', `%${q}%`)
        .limit(5)

      for (const p of data || []) {
        if (p.headshot_url && p.espn_id && !seen.has(p.espn_id)) {
          seen.add(p.espn_id)
          results.push({
            name: p.name,
            team,
            position: p.position || '',
            headshot_url: p.headshot_url,
            espn_id: String(p.espn_id),
          })
        }
      }
    } catch {
      // Skip failed table queries
    }
  }))

  // 2. Search opponent stats for non-Chicago players (covers every team we've played)
  const oppTables = [
    'bears_player_game_stats',
    'bulls_player_game_stats',
    'blackhawks_player_game_stats',
    'cubs_player_game_stats',
    'whitesox_player_game_stats',
  ]

  await Promise.all(oppTables.map(async (table) => {
    try {
      const { data } = await datalabAdmin
        .from(table)
        .select('opponent_player_name, player_id, opponent_player_headshot_url, opponent_player_position')
        .eq('is_opponent', true)
        .ilike('opponent_player_name', `%${q}%`)
        .limit(5)

      for (const p of data || []) {
        const espnId = String(Math.abs(Number(p.player_id)))
        if (p.opponent_player_headshot_url && !seen.has(espnId)) {
          seen.add(espnId)
          results.push({
            name: p.opponent_player_name,
            team: '',
            position: p.opponent_player_position || '',
            headshot_url: p.opponent_player_headshot_url,
            espn_id: espnId,
          })
        }
      }
    } catch {
      // Skip failed table queries
    }
  }))

  // Sort by relevance (exact match first, then starts-with, then contains)
  const lower = q.toLowerCase()
  results.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    if (aName === lower && bName !== lower) return -1
    if (bName === lower && aName !== lower) return 1
    if (aName.startsWith(lower) && !bName.startsWith(lower)) return -1
    if (bName.startsWith(lower) && !aName.startsWith(lower)) return 1
    return aName.localeCompare(bName)
  })

  return NextResponse.json({ players: results.slice(0, 15) })
}
