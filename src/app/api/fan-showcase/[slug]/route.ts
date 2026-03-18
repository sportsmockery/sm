import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { findSimilarCreators } from '@/lib/fan-showcase/ai-helpers'
import type { FanCreator, FanSubmission } from '@/types/fan-showcase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch submission with creator and assets
    const { data: submission, error } = await datalabAdmin
      .from('fan_submissions')
      .select('*, creator:fan_creators(*), assets:fan_submission_assets(*), tags:fan_submission_tags(*)')
      .eq('slug', slug)
      .in('status', ['approved', 'featured'])
      .maybeSingle()

    if (error) {
      console.error('Detail fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch submission.' }, { status: 500 })
    }

    if (!submission) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    }

    // Increment view count (fire-and-forget)
    datalabAdmin
      .from('fan_submissions')
      .update({ viewed_count: (submission.viewed_count || 0) + 1 })
      .eq('id', submission.id)
      .then()

    // More from this creator
    const { data: moreFromCreator } = await datalabAdmin
      .from('fan_submissions')
      .select('*, assets:fan_submission_assets(*)')
      .eq('creator_id', submission.creator_id)
      .in('status', ['approved', 'featured'])
      .neq('id', submission.id)
      .order('submitted_at', { ascending: false })
      .limit(4)

    // Similar creators
    const { data: allCreators } = await datalabAdmin
      .from('fan_creators')
      .select('*')

    const { data: allSubmissions } = await datalabAdmin
      .from('fan_submissions')
      .select('*')
      .in('status', ['approved', 'featured'])

    const similarCreators = findSimilarCreators(
      submission.creator as FanCreator,
      [submission as unknown as FanSubmission],
      (allCreators || []) as FanCreator[],
      (allSubmissions || []) as FanSubmission[],
      6
    )

    return NextResponse.json({
      submission,
      moreFromCreator: moreFromCreator || [],
      similarCreators: similarCreators.map(s => ({
        ...s.creator,
        similarity_score: s.score,
        similarity_reason: s.reason,
      })),
    })
  } catch (err) {
    console.error('Detail error:', err)
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
