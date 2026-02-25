import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { postId, postTitle, content, excerpt, team, username } = body

    if (!postTitle) {
      return NextResponse.json({ error: 'postTitle is required' }, { status: 400 })
    }

    const payload: Record<string, unknown> = {
      postId,
      postTitle,
      content,
      excerpt,
      team,
    }
    if (username) {
      payload.username = username
    }

    const res = await fetch('https://datalab.sportsmockery.com/api/scout/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      console.error('[scout/summary] DataLab error:', res.status, text)
      return NextResponse.json(
        { error: `DataLab returned ${res.status}` },
        { status: res.status },
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    console.error('[scout/summary] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
