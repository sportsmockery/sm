import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { revalidatePath } from 'next/cache'
import type { HubSlug, TeamSlug, HubItemStatus } from '@/types/hub'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const teamSlug = (params.get('team_slug') || 'chicago-bears') as TeamSlug
    const hubSlug = params.get('hub_slug') as HubSlug | null
    const status = params.get('status') as HubItemStatus | null

    let query = datalabAdmin
      .from('hub_items')
      .select('*')
      .eq('team_slug', teamSlug)
      .order('featured', { ascending: false })
      .order('timestamp', { ascending: false })

    if (hubSlug) query = query.eq('hub_slug', hubSlug)
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ items: data || [] })
  } catch (error) {
    console.error('Hub items GET error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/hub GET' }) } catch {}
    return NextResponse.json({ error: 'Failed to fetch hub items' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const { team_slug, hub_slug, status, headline, timestamp, source_name, source_url, summary, what_it_means, featured, hub_meta } = body

    if (!headline || !summary || !what_it_means || !hub_slug) {
      return NextResponse.json({ error: 'Missing required fields: headline, summary, what_it_means, hub_slug' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from('hub_items')
      .insert({
        team_slug: team_slug || 'chicago-bears',
        hub_slug,
        status: status || 'draft',
        headline,
        timestamp: timestamp || new Date().toISOString(),
        source_name: source_name || null,
        source_url: source_url || null,
        summary,
        what_it_means,
        featured: featured || false,
        author_id: user.id,
        author_name: user.email?.split('@')[0] || 'Admin',
        hub_meta: hub_meta || {},
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/${team_slug || 'chicago-bears'}/${hub_slug}`)

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Hub items POST error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/hub POST' }) } catch {}
    return NextResponse.json({ error: 'Failed to create hub item' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 })

    // Set updated_at
    updates.updated_at = new Date().toISOString()

    const { data, error } = await datalabAdmin
      .from('hub_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (data?.hub_slug) {
      revalidatePath(`/${data.team_slug}/${data.hub_slug}`)
    }

    return NextResponse.json({ item: data })
  } catch (error) {
    console.error('Hub items PUT error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/hub PUT' }) } catch {}
    return NextResponse.json({ error: 'Failed to update hub item' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing item id' }, { status: 400 })

    // Get the item first so we can revalidate the right path
    const { data: item } = await datalabAdmin.from('hub_items').select('team_slug, hub_slug').eq('id', id).single()

    const { error } = await datalabAdmin.from('hub_items').delete().eq('id', id)
    if (error) throw error

    if (item) {
      revalidatePath(`/${item.team_slug}/${item.hub_slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hub items DELETE error:', error)
    try { await datalabAdmin.from('gm_errors').insert({ source: 'backend', error_type: 'api', error_message: String(error), route: '/api/hub DELETE' }) } catch {}
    return NextResponse.json({ error: 'Failed to delete hub item' }, { status: 500 })
  }
}
