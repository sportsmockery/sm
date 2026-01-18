import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// ESPN headshot URL pattern
const ESPN_HEADSHOT_BASE = 'https://a.espncdn.com/i/headshots/nfl/players/full'

// Bears 2025 roster with ESPN player IDs (extracted from sportsmockery.com/chicago-bears-roster)
const BEARS_ROSTER_ESPN_IDS: { espnId: string; name: string; position?: string; number?: string }[] = [
  // Offense (27)
  { espnId: '3915416', name: 'DJ Moore' },
  { espnId: '4259545', name: "D'Andre Swift" },
  { espnId: '4685278', name: 'Luther Burden III', number: '10' },
  { espnId: '15168', name: 'Case Keenum', number: '11' },
  { espnId: '4039050', name: 'Devin Duvernay', number: '12' },
  { espnId: '3917914', name: 'Olamide Zaccheaus', number: '14' },
  { espnId: '4431299', name: 'Rome Odunze', number: '15' },
  { espnId: '4434153', name: 'Tyson Bagent', number: '17' },
  { espnId: '4431611', name: 'Caleb Williams', number: '18' },
  { espnId: '5160110', name: 'Jahdae Walker', number: '20' },
  { espnId: '4037457', name: 'Travis Homer', number: '21' },
  { espnId: '4608686', name: 'Kyle Monangai', number: '25' },
  { espnId: '4242553', name: 'Drew Dalman', number: '52' },
  { espnId: '4426358', name: 'Darnell Wright', number: '58' },
  { espnId: '2577773', name: 'Joe Thuney', number: '62' },
  { espnId: '4361787', name: 'Trey Hill', number: '63' },
  { espnId: '4695895', name: 'Luke Newman', number: '65' },
  { espnId: '3929631', name: 'Ryan Bates', number: '71' },
  { espnId: '3930040', name: 'Jonah Jackson', number: '73' },
  { espnId: '4360319', name: 'Jordan McFadden', number: '74' },
  { espnId: '4432595', name: 'Ozzy Trapilo', number: '75' },
  { espnId: '5125873', name: 'Theo Benedet', number: '79' },
  { espnId: '3052897', name: 'Durham Smythe', number: '81' },
  { espnId: '4685183', name: 'JP Richardson', number: '83' },
  { espnId: '4723086', name: 'Colston Loveland', number: '84' },
  { espnId: '4258595', name: 'Cole Kmet', number: '85' },
  { espnId: '4916349', name: 'Nikola Kalinic', number: '86' },
  // Defense (27)
  { espnId: '4243253', name: 'Jaylon Johnson' },
  { espnId: '4570044', name: 'Jaquan Brisker' },
  { espnId: '4242402', name: 'Elijah Hicks', number: '22' },
  { espnId: '4036169', name: 'Nick McCloud', number: '24' },
  { espnId: '4570470', name: 'Nahshon Wright', number: '26' },
  { espnId: '4426374', name: 'Tyrique Stevenson', number: '29' },
  { espnId: '2574056', name: 'Kevin Byard III', number: '31' },
  { espnId: '4047655', name: 'Jaylon Jones', number: '33' },
  { espnId: '4034953', name: 'C.J. Gardner-Johnson', number: '35' },
  { espnId: '4331768', name: 'Jonathan Owens', number: '36' },
  { espnId: '4917592', name: 'Dallis Flowers', number: '37' },
  { espnId: '4240459', name: 'Josh Blackwell', number: '39' },
  { espnId: '4430822', name: 'Noah Sewell', number: '44' },
  { espnId: '4038432', name: 'Amen Ogbongbemiga', number: '45' },
  { espnId: '4429970', name: 'Ruben Hyppolite II', number: '47' },
  { espnId: '4241007', name: "D'Marco Jackson", number: '48' },
  { espnId: '3929950', name: 'Tremaine Edmunds', number: '49' },
  { espnId: '2576492', name: 'Grady Jarrett', number: '50' },
  { espnId: '3121544', name: 'T.J. Edwards', number: '53' },
  { espnId: '4244300', name: 'Dominique Robinson', number: '90' },
  { espnId: '4034530', name: 'Chris Williams', number: '91' },
  { espnId: '4365629', name: 'Daniel Hardy', number: '92' },
  { espnId: '4243333', name: 'Joe Tryon-Shoyinka', number: '93' },
  { espnId: '4683553', name: 'Austin Booker', number: '94' },
  { espnId: '3051775', name: 'Andrew Billings', number: '97' },
  { espnId: '3134690', name: 'Montez Sweat', number: '98' },
  { espnId: '4429014', name: 'Gervon Dexter Sr.', number: '99' },
  // Special Teams (3)
  { espnId: '17427', name: 'Cairo Santos' },
  { espnId: '4686889', name: 'Tory Taylor', number: '19' },
  { espnId: '2980138', name: 'Scott Daly', number: '46' },
]

// POST /api/bears/sync-headshots - Update player headshot URLs
// This syncs the ESPN headshot URLs to the bears_players table
export async function POST(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json(
        { error: 'Datalab database not configured' },
        { status: 503 }
      )
    }

    const results: {
      updated: string[]
      skipped: string[]
      errors: string[]
    } = {
      updated: [],
      skipped: [],
      errors: [],
    }

    // Get all current players from the database
    // Note: Table uses 'name' column and 'espn_id' for ESPN player ID
    const { data: existingPlayers, error: fetchError } = await datalabAdmin
      .from('bears_players')
      .select('id, espn_id, name, headshot_url')

    if (fetchError) {
      console.error('Error fetching players:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch existing players' },
        { status: 500 }
      )
    }

    // Create a map for quick lookup by espn_id and name
    const playerByEspnId = new Map<string, any>()
    const playerByName = new Map<string, any>()

    for (const player of existingPlayers || []) {
      if (player.espn_id) {
        playerByEspnId.set(String(player.espn_id), player)
      }
      if (player.name) {
        playerByName.set(player.name.toLowerCase(), player)
      }
    }

    // Update each player with their ESPN headshot URL
    for (const rosterPlayer of BEARS_ROSTER_ESPN_IDS) {
      const headshotUrl = `${ESPN_HEADSHOT_BASE}/${rosterPlayer.espnId}.png`

      // Try to find by ESPN ID first, then by name
      let existingPlayer = playerByEspnId.get(rosterPlayer.espnId)
      if (!existingPlayer) {
        existingPlayer = playerByName.get(rosterPlayer.name.toLowerCase())
      }

      if (existingPlayer) {
        // Update the player's headshot URL and ESPN ID
        const { error: updateError } = await datalabAdmin
          .from('bears_players')
          .update({
            headshot_url: headshotUrl,
            espn_id: rosterPlayer.espnId,
          })
          .eq('id', existingPlayer.id)

        if (updateError) {
          results.errors.push(`${rosterPlayer.name}: ${updateError.message}`)
        } else {
          results.updated.push(rosterPlayer.name)
        }
      } else {
        results.skipped.push(`${rosterPlayer.name} (not in database)`)
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalRoster: BEARS_ROSTER_ESPN_IDS.length,
        updated: results.updated.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      results,
    })
  } catch (error) {
    console.error('Sync headshots error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/bears/sync-headshots - Show sync status and roster data
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/bears/sync-headshots',
    method: 'POST to sync headshots',
    rosterCount: BEARS_ROSTER_ESPN_IDS.length,
    headshotUrlPattern: `${ESPN_HEADSHOT_BASE}/{espn_player_id}.png`,
    source: 'https://www.sportsmockery.com/chicago-bears-roster',
    roster: BEARS_ROSTER_ESPN_IDS.map(p => ({
      name: p.name,
      espnId: p.espnId,
      number: p.number || null,
      headshotUrl: `${ESPN_HEADSHOT_BASE}/${p.espnId}.png`,
    })),
  })
}
