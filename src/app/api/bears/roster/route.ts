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

    let query = datalabAdmin
      .from('bears_players')
      .select('*')
      .order('position', { ascending: true })
      .order('jersey_number', { ascending: true })
      .limit(limit)

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
      query = query.ilike('full_name', `%${search}%`)
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
    const players = (data || []).map((player: any) => ({
      id: player.id,
      playerId: player.player_id,
      name: player.full_name,
      firstName: player.first_name,
      lastName: player.last_name,
      position: player.position,
      positionGroup: player.position_group,
      number: player.jersey_number,
      height: player.height,
      weight: player.weight,
      age: player.age,
      college: player.college,
      experience: player.experience,
      status: player.status,
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
