import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { mock_id, prospect_id, pick_number } = body

    if (!mock_id || !prospect_id) {
      return NextResponse.json({ error: 'mock_id and prospect_id are required' }, { status: 400 })
    }

    // Call datalab API to submit the pick
    const datalabRes = await fetch(`${process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'}/api/gm/draft/pick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DATALAB_API_KEY || ''}`,
      },
      body: JSON.stringify({
        mock_id,
        user_id: user.id,
        prospect_id,
        pick_number,
      }),
    })

    if (!datalabRes.ok) {
      const errData = await datalabRes.json().catch(() => ({}))
      throw new Error(errData.error || `Datalab API error: ${datalabRes.status}`)
    }

    const data = await datalabRes.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Draft pick error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/pick'
      })
    } catch {}
    return NextResponse.json({ error: 'Failed to submit pick' }, { status: 500 })
  }
}
