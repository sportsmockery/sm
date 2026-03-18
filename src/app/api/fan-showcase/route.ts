import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import type { Team, ContentType } from '@/types/fan-showcase'
import { TEAMS, CONTENT_TYPES } from '@/types/fan-showcase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const team = searchParams.get('team') as Team | 'all' | null
    const type = searchParams.get('type') as ContentType | 'all' | null
    const sort = searchParams.get('sort') || 'latest'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
    const offset = (page - 1) * limit

    // Build query for approved/featured submissions
    let query = datalabAdmin
      .from('fan_submissions')
      .select(
        '*, creator:fan_creators(*), assets:fan_submission_assets(*), tags:fan_submission_tags(*)',
        { count: 'exact' }
      )
      .in('status', ['approved', 'featured'])

    if (team && team !== 'all' && TEAMS.includes(team as Team)) {
      query = query.eq('team', team)
    }
    if (type && type !== 'all' && CONTENT_TYPES.includes(type as ContentType)) {
      query = query.eq('type', type)
    }

    // Sort
    if (sort === 'featured') {
      query = query.order('featured_at', { ascending: false, nullsFirst: false })
    } else if (sort === 'most_viewed') {
      query = query.order('viewed_count', { ascending: false })
    } else {
      query = query.order('submitted_at', { ascending: false })
    }

    const { data: submissions, count, error } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('Showcase fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch showcase.' }, { status: 500 })
    }

    // Featured content for hero carousel
    const { data: featured } = await datalabAdmin
      .from('fan_submissions')
      .select('*, creator:fan_creators(*), assets:fan_submission_assets(*)')
      .eq('status', 'featured')
      .order('featured_at', { ascending: false })
      .limit(8)

    // Featured slots for sections
    const { data: featuredSlots } = await datalabAdmin
      .from('fan_featured_slots')
      .select('*, submission:fan_submissions(*, creator:fan_creators(*), assets:fan_submission_assets(*))')
      .eq('active', true)
      .order('created_at', { ascending: false })

    // Creator discovery
    const { data: creators } = await datalabAdmin
      .from('fan_creators')
      .select('*')
      .limit(12)

    // Filter creators that have approved/featured work
    const creatorIds = creators?.map(c => c.id) || []
    let creatorsWithWork: string[] = []
    if (creatorIds.length > 0) {
      const { data: creatorSubs } = await datalabAdmin
        .from('fan_submissions')
        .select('creator_id')
        .in('creator_id', creatorIds)
        .in('status', ['approved', 'featured'])

      creatorsWithWork = [...new Set(creatorSubs?.map(s => s.creator_id) || [])]
    }

    return NextResponse.json({
      submissions: submissions || [],
      featured: featured || [],
      featuredSlots: featuredSlots || [],
      creators: (creators || []).map(c => ({
        ...c,
        has_approved_work: creatorsWithWork.includes(c.id),
      })),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (err) {
    console.error('Showcase error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
