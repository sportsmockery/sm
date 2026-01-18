import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const ESPN_ROSTER_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/3/roster'

interface ESPNPlayer {
  id: string
  fullName: string
  firstName: string
  lastName: string
  jersey: string
  position: {
    abbreviation: string
    name: string
  }
  headshot?: {
    href: string
  }
  height: number // in inches
  weight: number
  birthDate?: string
  college?: {
    name: string
  }
  status?: {
    type: string
  }
}

interface ESPNRosterResponse {
  athletes: {
    position: string
    items: ESPNPlayer[]
  }[]
}

// POST /api/bears/sync-roster - Sync Bears roster from ESPN to datalab
// Protected endpoint - requires admin secret
export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('authorization')
    const expectedSecret = process.env.CRON_SECRET || process.env.ADMIN_SECRET

    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!datalabAdmin) {
      return NextResponse.json({ error: 'Datalab not configured' }, { status: 500 })
    }

    // Fetch roster from ESPN
    console.log('[Roster Sync] Fetching roster from ESPN...')
    const response = await fetch(ESPN_ROSTER_URL)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch ESPN roster' }, { status: 502 })
    }

    const espnData: ESPNRosterResponse = await response.json()

    // Flatten all players from position groups
    const espnPlayers: ESPNPlayer[] = []
    for (const group of espnData.athletes || []) {
      for (const player of group.items || []) {
        espnPlayers.push(player)
      }
    }

    console.log(`[Roster Sync] Found ${espnPlayers.length} players on ESPN roster`)

    let updated = 0
    let inserted = 0
    let skipped = 0
    const errors: string[] = []

    for (const player of espnPlayers) {
      try {
        const playerData = {
          espn_id: player.id,
          name: player.fullName,
          first_name: player.firstName,
          last_name: player.lastName,
          jersey_number: player.jersey ? parseInt(player.jersey) : null,
          position: player.position?.abbreviation || 'UNK',
          headshot_url: player.headshot?.href || null,
          height_inches: player.height || null,
          weight_lbs: player.weight || null,
          birth_date: player.birthDate || null,
          college: player.college?.name || null,
          is_active: true,
          updated_at: new Date().toISOString(),
        }

        // Check if player exists by ESPN ID
        const { data: existing } = await datalabAdmin
          .from('bears_players')
          .select('id')
          .eq('espn_id', player.id)
          .single()

        if (existing) {
          // Update existing player
          const { error } = await datalabAdmin
            .from('bears_players')
            .update(playerData)
            .eq('espn_id', player.id)

          if (error) {
            errors.push(`Update ${player.fullName}: ${error.message}`)
          } else {
            updated++
          }
        } else {
          // Insert new player
          const { error } = await datalabAdmin
            .from('bears_players')
            .insert(playerData)

          if (error) {
            errors.push(`Insert ${player.fullName}: ${error.message}`)
          } else {
            inserted++
          }
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        errors.push(`${player.fullName}: ${errorMsg}`)
        skipped++
      }
    }

    // Mark players not on ESPN roster as inactive
    const espnIds = espnPlayers.map(p => p.id)
    const { error: deactivateError, count: deactivatedCount } = await datalabAdmin
      .from('bears_players')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .not('espn_id', 'in', `(${espnIds.join(',')})`)
      .eq('is_active', true)

    if (deactivateError) {
      errors.push(`Deactivate old players: ${deactivateError.message}`)
    }

    console.log(`[Roster Sync] Complete: ${updated} updated, ${inserted} inserted, ${deactivatedCount || 0} deactivated`)

    return NextResponse.json({
      success: errors.length === 0,
      espnPlayerCount: espnPlayers.length,
      updated,
      inserted,
      deactivated: deactivatedCount || 0,
      skipped,
      errors: errors.slice(0, 10), // Limit errors in response
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Roster sync error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/bears/sync-roster - Preview what would be synced (dry run)
export async function GET() {
  try {
    // Fetch roster from ESPN
    const response = await fetch(ESPN_ROSTER_URL)
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch ESPN roster' }, { status: 502 })
    }

    const espnData: ESPNRosterResponse = await response.json()

    // Flatten and extract key info
    const players = []
    for (const group of espnData.athletes || []) {
      for (const player of group.items || []) {
        players.push({
          espnId: player.id,
          name: player.fullName,
          position: player.position?.abbreviation,
          number: player.jersey,
          college: player.college?.name,
        })
      }
    }

    return NextResponse.json({
      source: 'ESPN',
      playerCount: players.length,
      sample: players.slice(0, 10),
      message: 'This is a preview. POST to this endpoint to sync.',
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to preview roster' }, { status: 500 })
  }
}
