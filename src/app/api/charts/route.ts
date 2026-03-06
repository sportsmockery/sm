import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { applyTheme, ThemeMode } from '@/lib/echarts-themes'

interface DbChartRow {
  id: string
  title: string | null
  options: unknown
  is_template: boolean
  created_at: string
  updated_at: string
}

/**
 * POST /api/charts
 * Create a new chart.
 * Body: { options, title?, mode?, is_template? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, mode, is_template } = body
    const rawOptions = body.options || body

    if (!rawOptions || typeof rawOptions !== 'object') {
      return NextResponse.json({ error: 'Invalid chart options' }, { status: 400 })
    }

    const themed = applyTheme(rawOptions, (mode as ThemeMode) || 'dark')
    const normalized = {
      animation: true,
      animationDuration: 1000,
      ...themed,
    }

    const titleText = title || (normalized as Record<string, unknown>).title
      ? ((normalized as Record<string, unknown>).title as Record<string, string>)?.text
      : undefined

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .insert({
        title: titleText || title || 'Untitled Chart',
        options: normalized,
        is_template: is_template || false,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating chart:', error)
      return NextResponse.json({ error: 'Failed to create chart' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (error) {
    console.error('Error creating chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/charts
 * List all charts. Optional ?search= query param.
 */
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')

    let query = supabaseAdmin
      .from('sm_charts')
      .select('id, title, options, is_template, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching charts:', error)
      return NextResponse.json({ error: 'Failed to fetch charts' }, { status: 500 })
    }

    const charts = (data || []).map((row: DbChartRow) => ({
      id: row.id,
      title: row.title,
      options: row.options,
      is_template: row.is_template,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }))

    return NextResponse.json(charts)
  } catch (error) {
    console.error('Error fetching charts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
