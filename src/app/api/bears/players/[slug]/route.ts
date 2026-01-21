import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Revalidate every hour
export const revalidate = 3600

// Position mappings
const POSITION_TO_GROUP: Record<string, string> = {
  QB: 'QB',
  RB: 'RB', FB: 'RB',
  WR: 'WR',
  TE: 'TE',
  OT: 'OL', OG: 'OL', C: 'OL', T: 'OL', G: 'OL', OL: 'OL',
  DE: 'DL', DT: 'DL', NT: 'DL', DL: 'DL',
  LB: 'LB', ILB: 'LB', OLB: 'LB', MLB: 'LB',
  CB: 'CB',
  S: 'S', FS: 'S', SS: 'S', DB: 'S',
  K: 'ST', P: 'ST', LS: 'ST',
}

const POSITION_TO_SIDE: Record<string, string> = {
  QB: 'OFF', RB: 'OFF', FB: 'OFF', WR: 'OFF', TE: 'OFF',
  OT: 'OFF', OG: 'OFF', C: 'OFF', T: 'OFF', G: 'OFF', OL: 'OFF',
  DE: 'DEF', DT: 'DEF', NT: 'DEF', DL: 'DEF',
  LB: 'DEF', ILB: 'DEF', OLB: 'DEF', MLB: 'DEF',
  CB: 'DEF', S: 'DEF', FS: 'DEF', SS: 'DEF', DB: 'DEF',
  K: 'ST', P: 'ST', LS: 'ST',
}

// GET /api/bears/players/[slug] - Returns player profile with 2025 season stats
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!datalabAdmin) {
      return NextResponse.json({
        player: null,
        error: 'Datalab not configured',
      })
    }

    // Find player by name matching the slug
    const playerName = slug.replace(/-/g, ' ')

    const { data: playerData, error: playerError } = await datalabAdmin
      .from('bears_players')
      .select(`
        id,
        player_id,
        name,
        first_name,
        last_name,
        position,
        position_group,
        jersey_number,
        height_inches,
        weight_lbs,
        age,
        college,
        years_exp,
        status,
        is_active,
        headshot_url
      `)
      .ilike('name', `%${playerName}%`)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (playerError || !playerData) {
      return NextResponse.json({
        player: null,
        error: 'Player not found',
      })
    }

    // Transform player data
    const position = playerData.position || 'UNKNOWN'
    const side = POSITION_TO_SIDE[position] || 'ST'
    const heightDisplay = playerData.height_inches
      ? `${Math.floor(playerData.height_inches / 12)}'${playerData.height_inches % 12}"`
      : null

    const player = {
      playerId: String(playerData.player_id || playerData.id),
      slug,
      fullName: playerData.name,
      firstName: playerData.first_name || (playerData.name || '').split(' ')[0] || '',
      lastName: playerData.last_name || (playerData.name || '').split(' ').slice(1).join(' ') || '',
      jerseyNumber: playerData.jersey_number,
      position,
      positionGroup: playerData.position_group || POSITION_TO_GROUP[position] || null,
      side,
      height: heightDisplay,
      weight: playerData.weight_lbs,
      age: playerData.age,
      experience: playerData.years_exp !== null && playerData.years_exp !== undefined
        ? (playerData.years_exp === 0 ? 'R' : `${playerData.years_exp} yr${playerData.years_exp !== 1 ? 's' : ''}`)
        : null,
      college: playerData.college,
      headshotUrl: playerData.headshot_url,
      primaryRole: playerData.status || null,
      status: playerData.status,
    }

    // Get player's game stats for 2025 season and aggregate
    // Use internal ID (playerData.id) since that's what game stats reference
    // Column names match datalab schema: pass_*, rush_*, rec_*, etc.
    const { data: gameStats } = await datalabAdmin
      .from('bears_player_game_stats')
      .select(`
        pass_cmp,
        pass_att,
        pass_yds,
        pass_td,
        pass_int,
        sacks,
        rush_att,
        rush_yds,
        rush_td,
        rec_tgt,
        rec,
        rec_yds,
        rec_td,
        fumbles,
        tackles,
        interceptions
      `)
      .eq('player_id', playerData.id)  // Use internal ID, not ESPN ID
      .eq('season', 2025)

    // Aggregate stats
    let currentSeason = null
    if (gameStats && gameStats.length > 0) {
      const totals = gameStats.reduce((acc: any, game: any) => {
        acc.gamesPlayed = (acc.gamesPlayed || 0) + 1
        acc.passAttempts = (acc.passAttempts || 0) + (game.pass_att || 0)
        acc.passCompletions = (acc.passCompletions || 0) + (game.pass_cmp || 0)
        acc.passYards = (acc.passYards || 0) + (game.pass_yds || 0)
        acc.passTD = (acc.passTD || 0) + (game.pass_td || 0)
        acc.passINT = (acc.passINT || 0) + (game.pass_int || 0)
        acc.rushAttempts = (acc.rushAttempts || 0) + (game.rush_att || 0)
        acc.rushYards = (acc.rushYards || 0) + (game.rush_yds || 0)
        acc.rushTD = (acc.rushTD || 0) + (game.rush_td || 0)
        acc.receptions = (acc.receptions || 0) + (game.rec || 0)
        acc.recYards = (acc.recYards || 0) + (game.rec_yds || 0)
        acc.recTD = (acc.recTD || 0) + (game.rec_td || 0)
        acc.tackles = (acc.tackles || 0) + (game.tackles || 0)
        acc.sacks = (acc.sacks || 0) + (parseFloat(game.sacks) || 0)
        acc.passesDefended = (acc.passesDefended || 0) + 0 // Not in datalab schema
        acc.fumbles = (acc.fumbles || 0) + (game.fumbles || 0)
        return acc
      }, {})

      currentSeason = {
        gamesPlayed: totals.gamesPlayed || 0,
        passYards: totals.passYards || null,
        passTD: totals.passTD || null,
        passINT: totals.passINT || null,
        completionPct: totals.passAttempts > 0
          ? Math.round((totals.passCompletions / totals.passAttempts) * 1000) / 10
          : null,
        rushYards: totals.rushYards || null,
        rushTD: totals.rushTD || null,
        yardsPerCarry: totals.rushAttempts > 0
          ? Math.round((totals.rushYards / totals.rushAttempts) * 10) / 10
          : null,
        receptions: totals.receptions || null,
        recYards: totals.recYards || null,
        recTD: totals.recTD || null,
        tackles: totals.tackles || null,
        sacks: totals.sacks || null,
        interceptions: null,
        passesDefended: totals.passesDefended || null,
        forcedFumbles: null,
        snaps: null,
      }
    }

    return NextResponse.json({
      player,
      currentSeason,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bears player profile API error:', error)
    return NextResponse.json({
      player: null,
      error: 'Internal server error',
    })
  }
}
