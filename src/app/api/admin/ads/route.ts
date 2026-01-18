import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

/**
 * Ad Placements API
 *
 * GET /api/admin/ads - List all ad placements
 * POST /api/admin/ads - Create new ad placement
 * PUT /api/admin/ads - Update ad placement
 * DELETE /api/admin/ads?id=X - Delete ad placement
 *
 * Ad placement types:
 * - AFTER_FEATURED_IMAGE: Below featured image on single posts
 * - IN_CONTENT_PARAGRAPH_X: After paragraph X in article content
 * - HOMEPAGE_HERO: In hero region of homepage
 * - HOMEPAGE_FEATURED: Between featured posts
 * - HOMEPAGE_LATEST: In latest stream
 * - SIDEBAR: Sidebar widget area
 * - FOOTER: Footer area
 */

export interface AdPlacement {
  id: number
  name: string
  placement_type: string
  html_code: string
  css_code?: string
  is_active: boolean
  priority: number
  conditions?: {
    categories?: string[]
    exclude_categories?: string[]
    min_paragraph?: number
    max_posts_per_page?: number
    device_type?: 'all' | 'mobile' | 'desktop'
  }
  created_at: string
  updated_at: string
}

// GET - List all ad placements
export async function GET() {
  try {
    const { data: ads, error } = await supabaseAdmin
      .from('sm_ad_placements')
      .select('*')
      .order('priority', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        return NextResponse.json({ ads: [], needsSetup: true })
      }
      throw error
    }

    return NextResponse.json({ ads: ads || [] })
  } catch (error) {
    console.error('Get ads error:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST - Create new ad placement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { name, placement_type, html_code, css_code, is_active, priority, conditions } = body

    if (!name || !placement_type || !html_code) {
      return NextResponse.json(
        { error: 'Missing required fields: name, placement_type, html_code' },
        { status: 400 }
      )
    }

    const { data: ad, error } = await supabaseAdmin
      .from('sm_ad_placements')
      .insert({
        name,
        placement_type,
        html_code,
        css_code: css_code || null,
        is_active: is_active ?? true,
        priority: priority ?? 10,
        conditions: conditions || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Create ad error:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}

// PUT - Update ad placement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing ad ID' }, { status: 400 })
    }

    const { data: ad, error } = await supabaseAdmin
      .from('sm_ad_placements')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Update ad error:', error)
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }
}

// DELETE - Delete ad placement
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Missing ad ID' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('sm_ad_placements')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete ad error:', error)
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}
