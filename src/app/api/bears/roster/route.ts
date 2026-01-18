import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin, BearsPlayer } from '@/lib/supabase-datalab'

// GET /api/bears/roster - Fetch Bears player roster
// Query params:
//   position: Filter by position (QB, RB, WR, TE, OL, DL, LB, DB, K, P, LS)
//   position_group: Filter by position group (offense, defense, special_teams)
//   status: Filter by status (active, injured, practice_squad, etc.)
//   search: Search by player name
//   limit: Number of results (default 100, max 200)

export async function GET(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json(
        { error: 'Datalab database not configured' },
        { status: 503 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const position = searchParams.get('position')
    const positionGroup = searchParams.get('position_group')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 200)

    // Default to active players only (from ESPN roster)
    const includeInactive = searchParams.get('include_inactive') === 'true'

    let query = datalabAdmin
      .from('bears_players')
      .select('*')
      .order('position', { ascending: true })
      .order('jersey_number', { ascending: true })
      .limit(limit)

    // Only show active players by default
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    if (position) {
      query = query.eq('position', position.toUpperCase())
    }

    if (positionGroup) {
      query = query.eq('position_group', positionGroup.toLowerCase())
    }

    if (status) {
      query = query.eq('status', status.toLowerCase())
    }

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Bears roster fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch roster' },
        { status: 500 }
      )
    }

    // Transform to cleaner response format
    // Note: Column names in datalab differ from TypeScript interface
    const players = (data || []).map((player: any) => ({
      id: player.id,
      espnId: player.espn_id,
      name: player.name,
      firstName: player.first_name,
      lastName: player.last_name,
      position: player.position,
      number: player.jersey_number,
      heightInches: player.height_inches,
      weightLbs: player.weight_lbs,
      birthDate: player.birth_date,
      college: player.college,
      isActive: player.is_active,
      headshot: player.headshot_url,
    }))

    // Group by position for easier rendering
    const byPosition: Record<string, typeof players> = {}
    players.forEach((player) => {
      if (!byPosition[player.position]) {
        byPosition[player.position] = []
      }
      byPosition[player.position].push(player)
    })

    return NextResponse.json({
      players,
      byPosition,
      meta: {
        total: players.length,
        positions: Object.keys(byPosition),
      },
    })
  } catch (error) {
    console.error('Bears roster API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
