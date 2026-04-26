export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

// POST /api/bears/update-record - Update Bears season record in datalab
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

    const body = await request.json()
    const { regular_season_record, postseason_record } = body

    if (!regular_season_record) {
      return NextResponse.json({ error: 'regular_season_record is required' }, { status: 400 })
    }

    // bears_season_record is a Postgres VIEW (cannot be updated directly).
    // Write to the underlying bears_seasons table instead. Parse the
    // "11-6" / "11-6-1" formatted strings into wins/losses/ties.
    const parts = String(regular_season_record).split('-').map((s: string) => parseInt(s, 10))
    if (parts.some(Number.isNaN) || parts.length < 2 || parts.length > 3) {
      return NextResponse.json({ error: 'regular_season_record must be "W-L" or "W-L-T"' }, { status: 400 })
    }
    const [wins, losses, ties = 0] = parts
    const gamesPlayed = wins + losses + ties
    const winPct = gamesPlayed > 0 ? Number(((wins + 0.5 * ties) / gamesPlayed).toFixed(3)) : 0

    const updateRow: Record<string, unknown> = {
      wins,
      losses,
      ties,
      games_played: gamesPlayed,
      win_pct: winPct,
      updated_at: new Date().toISOString(),
    }
    if (postseason_record) updateRow.playoff_result = `Postseason (${postseason_record})`

    // Update the row for the current NFL season (not row id=1 — that was a bug).
    const now = new Date()
    const currentNflSeason = now.getUTCMonth() + 1 >= 9 ? now.getUTCFullYear() : now.getUTCFullYear() - 1

    const { data, error } = await datalabAdmin
      .from('bears_seasons')
      .update(updateRow)
      .eq('season', currentNflSeason)
      .select()

    if (error) {
      console.error('Failed to update bears_seasons:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      updated: data,
      message: `Record updated to ${regular_season_record}${postseason_record ? `, ${postseason_record} Playoffs` : ''}`,
    })
  } catch (error) {
    console.error('Update record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/bears/update-record - View current record data
export async function GET(request: NextRequest) {
  try {
    if (!datalabAdmin) {
      return NextResponse.json({ error: 'Datalab not configured' }, { status: 500 })
    }

    // Fetch current bears_season_record
    const { data, error } = await datalabAdmin
      .from('bears_season_record')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      current_data: data,
      espn_record: '11-6', // From ESPN API
      suggested_update: {
        regular_season_record: '11-6',
        postseason_record: '1-0',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
