import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

interface DbChartRow {
  id: string
  options: string | null
  created_at: string
  updated_at: string
}

/**
 * GET /api/charts/[id]
 * Get a single chart by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching chart:', error)
      return NextResponse.json(
        { error: 'Failed to fetch chart' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    const row = data as DbChartRow

    let parsedOptions: unknown
    try {
      parsedOptions = row.options ? JSON.parse(row.options) : null
    } catch {
      parsedOptions = null
    }

    return NextResponse.json({
      id: row.id,
      options: parsedOptions,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
  } catch (error) {
    console.error('Error fetching chart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/charts/[id]
 * Update a chart's options.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const options = await request.json()

    if (!options || typeof options !== 'object') {
      return NextResponse.json({ error: 'Invalid chart options' }, { status: 400 })
    }

    const normalized = {
      animation: true,
      ...options,
      responsive: options.responsive ?? true,
    }

    const serialized = JSON.stringify(normalized)

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .update({
        options: serialized,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error updating chart:', error)
      return NextResponse.json(
        { error: 'Failed to update chart' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating chart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/charts/[id]
 * Delete a chart.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error deleting chart:', error)
      return NextResponse.json(
        { error: 'Failed to delete chart' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
