import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy that adds the DATALAB_API_KEY auth header before
// forwarding chart-generation requests to DataLab. Keeps the key server-only
// — exposing it via NEXT_PUBLIC_* would bake it into the browser bundle and
// defeat the gate. Used by the Add Chart modal in AdvancedPostEditor.
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const datalabKey = process.env.DATALAB_API_KEY
    if (!datalabKey) {
      return NextResponse.json(
        { error: 'DATALAB_API_KEY not configured on SM Edge' },
        { status: 500 },
      )
    }

    const upstream = await fetch('https://datalab.sportsmockery.com/api/postiq/generate-chart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${datalabKey}`,
      },
      body: JSON.stringify(body),
    })

    const data = await upstream.json().catch(() => ({}))
    return NextResponse.json(data, { status: upstream.status })
  } catch (err) {
    console.error('[datalab-chart proxy]', err)
    return NextResponse.json(
      { error: 'Failed to reach DataLab chart service' },
      { status: 502 },
    )
  }
}
