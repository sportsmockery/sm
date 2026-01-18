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

    // Update the bears_season_record table
    const { data, error } = await datalabAdmin
      .from('bears_season_record')
      .update({
        regular_season_record,
        postseason_record: postseason_record || '0-0',
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1) // Assuming single row for current season
      .select()

    if (error) {
      console.error('Failed to update bears_season_record:', error)
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
