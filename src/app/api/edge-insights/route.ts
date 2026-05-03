import { NextRequest, NextResponse } from 'next/server'

const DATALAB_URL = process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get('article_id')
  if (!articleId) {
    return NextResponse.json({ insights: [] })
  }

  try {
    const res = await fetch(`${DATALAB_URL}/api/edge-insights?article_id=${articleId}`, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ insights: [] })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ insights: [] })
  }
}
