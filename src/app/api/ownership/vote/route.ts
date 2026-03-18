import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const VALID_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { grade_id, team_slug, user_id, fingerprint, vote, comment } = body

    if (!grade_id || !team_slug || !vote) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!VALID_TEAMS.includes(team_slug)) {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
    }

    if (!['agree', 'disagree'].includes(vote)) {
      return NextResponse.json({ error: 'Invalid vote' }, { status: 400 })
    }

    if (!user_id && !fingerprint) {
      return NextResponse.json({ error: 'Must provide user_id or fingerprint' }, { status: 400 })
    }

    const voteRow: any = {
      grade_id,
      team_slug,
      vote,
      comment: comment?.slice(0, 500) || null,
    }

    if (user_id) voteRow.user_id = user_id
    if (fingerprint) voteRow.fingerprint = fingerprint

    const { data, error } = await datalabAdmin
      .from('ownership_votes')
      .upsert(voteRow, {
        onConflict: user_id ? 'grade_id,user_id' : 'grade_id,fingerprint',
      })
      .select()
      .single()

    if (error) {
      console.error('Vote error:', error)
      return NextResponse.json({ error: 'Failed to submit vote', detail: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, vote: data })
  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
