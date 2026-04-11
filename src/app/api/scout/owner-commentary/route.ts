import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const res = await fetch(`${DATALAB_URL}/api/scout/owner-commentary?${searchParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch commentary' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Scout owner commentary proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch commentary' }, { status: 500 })
  }
}
