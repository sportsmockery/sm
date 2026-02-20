import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const { id, status } = await request.json()
    if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 })
    if (!status || !['draft', 'published'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from('hub_items')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (data) revalidatePath(`/${data.team_slug}/${data.hub_slug}`)

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Hub status PATCH error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/hub/status PATCH' }) } catch {}
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}
