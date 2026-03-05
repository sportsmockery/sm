import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { applyTheme, ThemeMode } from '@/lib/echarts-themes'

/**
 * GET /api/charts/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .select('id, title, options, is_template, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching chart:', error)
      return NextResponse.json({ error: 'Failed to fetch chart' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: data.id,
      title: data.title,
      options: data.options,
      is_template: data.is_template,
      created_at: data.created_at,
      updated_at: data.updated_at,
    })
  } catch (error) {
    console.error('Error fetching chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PUT /api/charts/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const updates: Record<string, unknown> = { options: normalized }
    if (title !== undefined) updates.title = title
    if (is_template !== undefined) updates.is_template = is_template

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .update(updates)
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) {
      console.error('Error updating chart:', error)
      return NextResponse.json({ error: 'Failed to update chart' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/charts/[id]
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
      return NextResponse.json({ error: 'Failed to delete chart' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chart:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
