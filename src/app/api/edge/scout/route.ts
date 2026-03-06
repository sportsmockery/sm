import { NextRequest, NextResponse } from 'next/server'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Prompt is required and must be at least 3 characters' },
        { status: 400 }
      )
    }

    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({
        query: prompt.trim(),
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        answer: "Scout had trouble answering. Try again in a bit.",
      })
    }

    const data = await response.json()

    return NextResponse.json({
      answer: data.response || '',
      source: data.source,
      sessionId: data.sessionId,
    })
  } catch {
    return NextResponse.json({
      answer: "Scout had trouble connecting. Try again in a moment.",
    })
  }
}
