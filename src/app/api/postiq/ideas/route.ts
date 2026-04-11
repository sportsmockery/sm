import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const res = await fetch(`${DATALAB_URL}/api/postiq/ideas?${searchParams.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('PostIQ ideas proxy error:', error)
    return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const res = await fetch(`${DATALAB_URL}/api/postiq/ideas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to refresh ideas' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('PostIQ ideas proxy error:', error)
    return NextResponse.json({ error: 'Failed to refresh ideas' }, { status: 500 })
  }
}
