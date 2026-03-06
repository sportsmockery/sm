import { NextResponse } from 'next/server'

const DATALAB_API_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function GET() {
  try {
    const response = await fetch(`${DATALAB_API_URL}/api/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
      },
      body: JSON.stringify({
        query: 'Give me a quick catch-up recap of what happened today across all Chicago sports teams (Bears, Bulls, Blackhawks, Cubs, White Sox). Include scores, injuries, trades, and any breaking news. Format as bullet points.',
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        items: [
          { id: '1', summary: 'Could not load recap right now. Try again in a moment.' },
        ],
      })
    }

    const data = await response.json()
    const text: string = data.response || ''

    // Parse bullet points from Scout response
    const lines = text.split('\n').filter((l: string) => l.trim().length > 0)
    const items = lines.map((line: string, i: number) => ({
      id: String(i + 1),
      summary: line.replace(/^[-•*]\s*/, '').trim(),
    }))

    return NextResponse.json({
      items: items.length > 0
        ? items
        : [{ id: '1', summary: text || 'No recap available right now.' }],
    })
  } catch {
    return NextResponse.json({
      items: [
        { id: '1', summary: 'Could not connect to Scout. Try again in a moment.' },
      ],
    })
  }
}
