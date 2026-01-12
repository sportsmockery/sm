import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/charts/[id]
 * Fetch a single chart by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: chart, error } = await supabase
      .from('sm_charts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !chart) {
      return NextResponse.json(
        { error: 'Chart not found' },
        { status: 404 }
      )
    }

    // Transform database record to ChartConfig format
    const config = {
      type: chart.chart_type,
      title: chart.title,
      size: chart.config?.size || 'medium',
      colors: chart.config?.colors || { scheme: 'team', team: 'bears' },
      data: chart.data || [],
      dataSource: chart.config?.source?.type || 'manual',
      dataLabQuery: chart.config?.source?.query,
    }

    return NextResponse.json(config)
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
 * Update a chart
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: chart, error } = await supabase
      .from('sm_charts')
      .update({
        chart_type: body.type,
        title: body.title,
        config: {
          size: body.size,
          colors: body.colors,
          source: body.dataLabQuery ? { type: 'datalab', query: body.dataLabQuery } : { type: 'manual' },
        },
        data: body.data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating chart:', error)
      return NextResponse.json(
        { error: 'Failed to update chart' },
        { status: 500 }
      )
    }

    return NextResponse.json(chart)
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
 * Delete a chart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('sm_charts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting chart:', error)
      return NextResponse.json(
        { error: 'Failed to delete chart' },
        { status: 500 }
      )
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
