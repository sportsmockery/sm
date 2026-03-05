import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * GET /api/charts
 * List all charts (with optional filtering)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('post_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabaseAdmin
      .from('sm_charts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (postId) {
      query = query.eq('post_id', postId)
    }

    const { data: charts, error, count } = await query

    if (error) {
      console.error('Error fetching charts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch charts', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    // Transform to ChartConfig format
    const transformed = charts?.map((chart) => ({
      id: chart.id,
      postId: chart.post_id,
      type: chart.chart_type,
      title: chart.title,
      size: chart.config?.size || 'medium',
      colors: chart.config?.colors || { scheme: 'team', team: 'bears' },
      data: chart.data || [],
      dataSource: chart.config?.source?.type || 'manual',
      createdAt: chart.created_at,
    }))

    return NextResponse.json({
      charts: transformed,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching charts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/charts
 * Create a new chart
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Support two formats:
    // 1) Existing ChartConfig-style payload (contains type/title/data)
    // 2) Raw ECharts options object (series, title, etc.)
    let payload = body

    if (!body.type || !body.title || !body.data) {
      // Likely an ECharts options object
      const isEChartsOptions = Array.isArray(body.series) || body.xAxis || body.yAxis

      if (!isEChartsOptions) {
        return NextResponse.json(
          { error: 'Missing required fields: type, title, data' },
          { status: 400 }
        )
      }

      const firstSeries = Array.isArray(body.series) && body.series.length > 0 ? body.series[0] : undefined
      const inferredType = firstSeries?.type || 'bar'
      const inferredTitle =
        (body.title && (typeof body.title === 'string' ? body.title : body.title.text)) || 'Custom Chart'
      const inferredData =
        firstSeries && Array.isArray(firstSeries.data)
          ? firstSeries.data.map((v: any, idx: number) => ({
              label: (body.xAxis && Array.isArray(body.xAxis.data) && body.xAxis.data[idx]) || String(idx + 1),
              value: v,
            }))
          : []

      payload = {
        type: inferredType,
        title: inferredTitle,
        data: inferredData,
        size: body.size || 'medium',
        colors: body.colors || { scheme: 'team', team: 'bears' },
        dataLabQuery: body.dataLabQuery,
        echartsOptions: body, // Store full ECharts options for retrieval if needed
      }
    }

    // Validate required fields after normalization
    if (!payload.type || !payload.title || !payload.data) {
      return NextResponse.json(
        { error: 'Missing required fields: type, title, data' },
        { status: 400 }
      )
    }

    const { data: chart, error } = await supabaseAdmin
      .from('sm_charts')
      .insert({
        post_id: payload.postId || null,
        chart_type: payload.type,
        title: payload.title,
        config: {
          size: payload.size || 'medium',
          colors: payload.colors || { scheme: 'team', team: 'bears' },
          source: payload.dataLabQuery
            ? { type: 'datalab', query: payload.dataLabQuery }
            : { type: 'manual' },
          echartsOptions: payload.echartsOptions,
        },
        data: payload.data,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating chart:', error)
      return NextResponse.json(
        { error: 'Failed to create chart', details: error.message, code: error.code },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: chart.id,
      shortcode: `[chart:${chart.id}]`,
      ...chart,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating chart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
