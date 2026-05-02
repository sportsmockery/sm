import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { revalidatePath } from 'next/cache'
import type { HubSlug, TeamSlug, HubItemStatus } from '@/types/hub'

export const dynamic = 'force-dynamic'

// Whitelisted slug values — must mirror src/types/hub.ts. Inlined so the route
// can validate query parameters without dragging the (large) type module into
// the request path. If you add a new team or hub, update both places.
const VALID_TEAM_SLUGS: ReadonlySet<TeamSlug> = new Set([
  'chicago-bears',
  'chicago-bulls',
  'chicago-blackhawks',
  'chicago-cubs',
  'chicago-white-sox',
])
const VALID_HUB_SLUGS: ReadonlySet<HubSlug> = new Set([
  'trade-rumors',
  'draft-tracker',
  'cap-tracker',
  'depth-chart',
  'game-center',
])
const VALID_STATUSES: ReadonlySet<HubItemStatus> = new Set(['draft', 'published'])

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const rawTeam = params.get('team_slug') || 'chicago-bears'
    const rawHub = params.get('hub_slug')
    const rawStatus = params.get('status')

    // Validate team_slug — reject anything that isn't a known team. Returning
    // 261 unrelated rows for a typo'd team was actively misleading.
    if (!VALID_TEAM_SLUGS.has(rawTeam as TeamSlug)) {
      return NextResponse.json(
        { error: `Invalid team_slug "${rawTeam}". Must be one of: ${Array.from(VALID_TEAM_SLUGS).join(', ')}` },
        { status: 400 },
      )
    }
    const teamSlug = rawTeam as TeamSlug

    // hub_slug is optional but, if supplied, must be a known hub.
    let hubSlug: HubSlug | null = null
    if (rawHub) {
      if (!VALID_HUB_SLUGS.has(rawHub as HubSlug)) {
        return NextResponse.json(
          { error: `Invalid hub_slug "${rawHub}". Must be one of: ${Array.from(VALID_HUB_SLUGS).join(', ')}` },
          { status: 400 },
        )
      }
      hubSlug = rawHub as HubSlug
    }

    // status is optional. "all" is treated as no-filter so admin clients that
    // forward their UI tab name straight to the API don't accidentally narrow
    // to a non-existent enum value. Bug 2026-05-02: passing ?status=all
    // previously evaluated as .eq('status','all') and returned zero rows,
    // making the All tab silently empty for any client that did pass it.
    let status: HubItemStatus | null = null
    if (rawStatus && rawStatus !== 'all') {
      if (!VALID_STATUSES.has(rawStatus as HubItemStatus)) {
        return NextResponse.json(
          { error: `Invalid status "${rawStatus}". Must be one of: ${Array.from(VALID_STATUSES).join(', ')} or omit/all.` },
          { status: 400 },
        )
      }
      status = rawStatus as HubItemStatus
    }

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
