import { NextRequest, NextResponse } from 'next/server'

const DATALAB_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(`${DATALAB_URL}/api/scout/insight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ insight: null }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ insight: null }, { status: 500 })
  }
}
