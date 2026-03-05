import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

interface DbChartRow {
  id: string
  options: string | null
  created_at: string
  updated_at: string
}

interface ChartRecord {
  id: string
  options: unknown
  created_at: string
  updated_at: string
}

/**
 * POST /api/charts
 * Create a new chart.
 * Body: raw ECharts options object.
 */
export async function POST(request: NextRequest) {
  try {
    const options = await request.json()

    if (!options || typeof options !== 'object') {
      return NextResponse.json({ error: 'Invalid chart options' }, { status: 400 })
    }

    // Apply simple defaults
    const normalized = {
      animation: true,
      ...options,
      // ECharts is responsive by default; we just include a flag for clarity
      responsive: options.responsive ?? true,
    }

    const serialized = JSON.stringify(normalized)

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .insert({
        options: serialized,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating chart:', error)
      return NextResponse.json(
        { error: 'Failed to create chart' },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating chart:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/charts
 * List all charts.
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching charts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch charts' },
        { status: 500 }
      )
    }

    const rows: DbChartRow[] = (data || []) as DbChartRow[]

    const charts: ChartRecord[] = rows.map((row) => {
      let parsedOptions: unknown
      try {
        parsedOptions = row.options ? JSON.parse(row.options) : null
      } catch {
        parsedOptions = null
      }
      return {
        id: row.id,
        options: parsedOptions,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    })

    return NextResponse.json(charts)
  } catch (error) {
    console.error('Error fetching charts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
