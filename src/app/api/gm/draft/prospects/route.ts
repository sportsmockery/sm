import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const sport = request.nextUrl.searchParams.get('sport')
    const year = request.nextUrl.searchParams.get('year')
    const search = request.nextUrl.searchParams.get('search')
    const position = request.nextUrl.searchParams.get('position')

    if (!sport) {
      return NextResponse.json({ error: 'sport is required' }, { status: 400 })
    }

    // Call datalab API to get prospects
    const params = new URLSearchParams({ sport })
    if (year) params.set('year', year)
    if (search) params.set('search', search)
    if (position) params.set('position', position)

    const datalabRes = await fetch(`${process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'}/api/gm/draft/prospects?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DATALAB_API_KEY || ''}`,
      },
    })

    if (!datalabRes.ok) {
      const errData = await datalabRes.json().catch(() => ({}))
      throw new Error(errData.error || `Datalab API error: ${datalabRes.status}`)
    }

    const data = await datalabRes.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Draft prospects error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/prospects'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to fetch prospects' }, { status: 500 })
  }
}
