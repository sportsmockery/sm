import { NextRequest, NextResponse } from 'next/server'
import { brokerHeadlines, brokerPulse, brokerBriefing, brokerTeasers } from '@/lib/dataBroker'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type')

  if (!type) {
    return NextResponse.json({ error: 'Missing ?type= parameter' }, { status: 400 })
  }

  const timeout = setTimeout(() => {}, 3000)

  try {
    switch (type) {
      case 'headlines': {
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 12
        const result = await brokerHeadlines(limit)
        clearTimeout(timeout)
        return NextResponse.json(result)
      }
      case 'pulse': {
        const key = req.nextUrl.searchParams.get('key') || 'global'
        const result = await brokerPulse(key)
        clearTimeout(timeout)
        return NextResponse.json(result)
      }
      case 'briefing': {
        const result = await brokerBriefing()
        clearTimeout(timeout)
        return NextResponse.json(result)
      }
      case 'teasers': {
        const result = await brokerTeasers()
        clearTimeout(timeout)
        return NextResponse.json(result)
      }
      default:
        clearTimeout(timeout)
        return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 })
    }
  } catch (error) {
    clearTimeout(timeout)
    console.error('[Broker API]', error)
    return NextResponse.json(
      { data: null, source: 'unavailable', fetchedAt: new Date().toISOString() },
      { status: 200 }
    )
  }
}
