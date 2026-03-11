import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

const builtInTemplates = [
  {
    id: 'bears-weekly-points',
    title: 'Bears Weekly Points (Bar)',
    options: {
      title: { text: 'Bears Weekly Points' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Week 1', 'Week 2', 'Week 3', 'Week 4'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [21, 17, 31, 24], itemStyle: { color: '#bc0000' } }],
    },
    is_builtin: true,
  },
  {
    id: 'bulls-scoring-trend',
    title: 'Bulls Scoring Trend (Line)',
    options: {
      title: { text: 'Bulls Last 5 Games Points' },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['G1', 'G2', 'G3', 'G4', 'G5'] },
      yAxis: { type: 'value' },
      series: [{ type: 'line', data: [108, 115, 99, 122, 110], smooth: true, itemStyle: { color: '#00D4FF' } }],
    },
    is_builtin: true,
  },
  {
    id: 'win-loss-share',
    title: 'Season Record (Pie)',
    options: {
      title: { text: 'Season Record' },
      tooltip: { trigger: 'item' },
      series: [{
        name: 'Record',
        type: 'pie',
        radius: '60%',
        data: [{ value: 11, name: 'Wins' }, { value: 6, name: 'Losses' }],
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } },
      }],
    },
    is_builtin: true,
  },
  {
    id: 'player-radar',
    title: 'Player Comparison (Radar)',
    options: {
      title: { text: 'Player Comparison' },
      tooltip: {},
      radar: {
        indicator: [
          { name: 'Points', max: 40 },
          { name: 'Rebounds', max: 15 },
          { name: 'Assists', max: 15 },
          { name: 'Steals', max: 5 },
          { name: 'Blocks', max: 5 },
        ],
      },
      series: [{
        type: 'radar',
        data: [
          { value: [28, 8, 6, 2, 1], name: 'Player A' },
          { value: [22, 12, 4, 1, 3], name: 'Player B' },
        ],
      }],
    },
    is_builtin: true,
  },
]

/**
 * GET /api/templates
 * List built-in + user-promoted templates.
 */
export async function GET() {
  try {
    const { data: dbTemplates } = await supabaseAdmin
      .from('sm_charts')
      .select('id, title, options, created_at')
      .eq('is_template', true)
      .order('created_at', { ascending: false })

    const userTemplates = (dbTemplates || []).map((t) => ({
      ...t,
      is_builtin: false,
    }))

    return NextResponse.json([...builtInTemplates, ...userTemplates])
  } catch {
    return NextResponse.json(builtInTemplates)
  }
}

/**
 * PUT /api/templates
 * Promote a chart to template. Body: { chartId }
 */
export async function PUT(request: NextRequest) {
  try {
    const { chartId } = await request.json()

    if (!chartId) {
      return NextResponse.json({ error: 'chartId required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('sm_charts')
      .update({ is_template: true })
      .eq('id', chartId)
      .select('id')
      .maybeSingle()

    if (error || !data) {
      return NextResponse.json({ error: 'Chart not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error promoting to template:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
