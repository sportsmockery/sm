import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'

interface ChartOptions {
  series?: Array<{ type?: string; data?: unknown[] }>
  xAxis?: { data?: unknown[] }
  title?: { text?: string }
}

/**
 * POST /api/charts/similar
 * Find charts similar to the provided options.
 */
export async function POST(request: NextRequest) {
  try {
    const newOptions: ChartOptions = await request.json()

    const { data: charts, error } = await supabaseAdmin
      .from('sm_charts')
      .select('id, title, options')
      .not('options', 'is', null)
      .limit(100)

    if (error) {
      console.error('Error fetching charts for similarity:', error)
      return NextResponse.json([], { status: 200 })
    }

    const newType = newOptions.series?.[0]?.type
    const newDataLen = newOptions.series?.[0]?.data?.length ?? 0
    const newCategories = (newOptions.xAxis?.data ?? []) as string[]

    const similar = (charts || []).filter((chart) => {
      const opts = chart.options as ChartOptions | null
      if (!opts?.series?.[0]) return false

      const sameType = opts.series[0].type === newType
      const sameDataLen = (opts.series[0].data?.length ?? 0) === newDataLen
      const sameCategories =
        newCategories.length > 0 &&
        JSON.stringify((opts.xAxis?.data ?? []) as string[]) === JSON.stringify(newCategories)

      return sameType && (sameDataLen || sameCategories)
    })

    return NextResponse.json(
      similar.map((c) => ({ id: c.id, title: c.title }))
    )
  } catch (error) {
    console.error('Error checking similarity:', error)
    return NextResponse.json([], { status: 200 })
  }
}
