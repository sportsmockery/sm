import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ drafts: [], total: 0 })
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(request.nextUrl.searchParams.get('limit') || '20'), 50)

    // Call datalab API to get draft history
    const params = new URLSearchParams({
      user_id: user.id,
      page: page.toString(),
      limit: limit.toString(),
    })

    const datalabRes = await fetch(`${process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'}/api/gm/draft/history?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DATALAB_API_KEY || ''}`,
      },
    })

    if (!datalabRes.ok) {
      // Return empty if datalab fails
      return NextResponse.json({ drafts: [], total: 0, page, limit })
    }

    const data = await datalabRes.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Draft history error:', error)
    return NextResponse.json({ drafts: [], total: 0 })
  }
}
