import { NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: Request) {
  // Verify cron secret if configured
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await datalabAdmin.rpc('refresh_homepage_cache')

    if (error) {
      console.error('[refresh-homepage] RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      refreshed_at: new Date().toISOString(),
      result: data,
    })
  } catch (err) {
    console.error('[refresh-homepage] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
