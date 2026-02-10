import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// Revalidate every hour
export const revalidate = 3600

// Position group and side mappings
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

// GET /api/bears/players - Returns all active Bears players from Datalab
export async function GET() {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({
        players: [],
        error: 'Datalab not configured',
      })
    }

    // Per SM_INTEGRATION_GUIDE.md: Filter by is_active = true
    const { data, error } = await datalabAdmin
      .from('bears_players')
      .select(`
        id,
        player_id,
        espn_id,
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
      .eq('is_active', true)
      .order('position_group')
      .order('name')

    if (error) {
      console.error('Bears players fetch error:', error)
      return NextResponse.json({
        players: [],
        error: 'Failed to fetch players',
      })
    }

    // Transform to match expected BearsPlayer interface
    const players = (data || []).map((p: any) => {
      const position = p.position || 'UNKNOWN'
      const side = POSITION_TO_SIDE[position] || 'ST'

      // Format height from inches to display format
      const heightDisplay = p.height_inches
        ? `${Math.floor(p.height_inches / 12)}'${p.height_inches % 12}"`
        : null

      // Generate slug from name
      const slug = (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

      return {
        playerId: String(p.espn_id || p.player_id || p.id),
        internalId: p.id,
        slug,
        fullName: p.name,
        firstName: p.first_name || (p.name || '').split(' ')[0] || '',
        lastName: p.last_name || (p.name || '').split(' ').slice(1).join(' ') || '',
        jerseyNumber: p.jersey_number,
        position,
        positionGroup: p.position_group || POSITION_TO_GROUP[position] || null,
        side,
        height: heightDisplay,
        weight: p.weight_lbs,
        age: p.age,
        experience: p.years_exp !== null && p.years_exp !== undefined
          ? (p.years_exp === 0 ? 'R' : `${p.years_exp} yr${p.years_exp !== 1 ? 's' : ''}`)
          : null,
        college: p.college,
        headshotUrl: p.headshot_url,
        primaryRole: p.status || null,
        status: p.status,
      }
    })

    return NextResponse.json({
      players,
      count: players.length,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Bears players API error:', error)
    return NextResponse.json({
      players: [],
      error: 'Internal server error',
    })
  }
}
