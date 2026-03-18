import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import type { SubmissionStatus, Team, ContentType } from '@/types/fan-showcase'
import { SUBMISSION_STATUSES, TEAMS, CONTENT_TYPES } from '@/types/fan-showcase'

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ('error' in auth && auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as SubmissionStatus | 'all' | null
    const team = searchParams.get('team') as Team | 'all' | null
    const type = searchParams.get('type') as ContentType | 'all' | null
    const search = searchParams.get('search')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)))
    const offset = (page - 1) * limit

    let query = supabaseAdmin
      .from('fan_submissions')
      .select(
        '*, creator:fan_creators(*), assets:fan_submission_assets(*)',
        { count: 'exact' }
      )

    if (status && status !== 'all' && SUBMISSION_STATUSES.includes(status as SubmissionStatus)) {
      query = query.eq('status', status)
    }
    if (team && team !== 'all' && TEAMS.includes(team as Team)) {
      query = query.eq('team', team)
    }
    if (type && type !== 'all' && CONTENT_TYPES.includes(type as ContentType)) {
      query = query.eq('type', type)
    }
    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data: submissions, count, error } = await query
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Admin showcase fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch submissions.' }, { status: 500 })
    }

    // Status counts
    const statusCounts: Record<string, number> = { all: 0 }
    for (const s of SUBMISSION_STATUSES) {
      const { count: c } = await supabaseAdmin
        .from('fan_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
      statusCounts[s] = c || 0
      statusCounts.all += c || 0
    }

    return NextResponse.json({
      submissions: submissions || [],
      statusCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (err) {
    console.error('Admin showcase error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
