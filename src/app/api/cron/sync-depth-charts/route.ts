import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const DEPTH_CHART_PATHS = [
  '/chicago-bears/depth-chart',
  '/chicago-bulls/depth-chart',
  '/chicago-blackhawks/depth-chart',
  '/chicago-cubs/depth-chart',
  '/chicago-white-sox/depth-chart',
]

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { path: string; status: string }[] = []

  for (const path of DEPTH_CHART_PATHS) {
    try {
      revalidatePath(path)
      results.push({ path, status: 'revalidated' })
    } catch (err) {
      results.push({ path, status: `error: ${err instanceof Error ? err.message : String(err)}` })
    }
  }

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    results,
  })
}
