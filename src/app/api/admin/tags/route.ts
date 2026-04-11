import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * GET /api/admin/tags?q=search&limit=10
 * Search tags by name (for autocomplete)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    let query = supabaseAdmin
      .from('sm_tags')
      .select('id, name, slug')
      .order('name')
      .limit(limit)

    if (q.trim()) {
      query = query.ilike('name', `%${q.trim()}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tags:', error)
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }

    return NextResponse.json({ tags: data || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json()
    const { name, slug } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    // Check for existing tag with same slug
    const { data: existing } = await supabaseAdmin
      .from('sm_tags')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()

    if (existing) {
      // Return existing tag instead of error (idempotent)
      return NextResponse.json(existing)
    }

    const { data, error } = await supabaseAdmin
      .from('sm_tags')
      .insert({ name, slug })
      .select('id, name, slug')
      .single()

    if (error) {
      console.error('Error creating tag:', error)
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/admin/tags:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
