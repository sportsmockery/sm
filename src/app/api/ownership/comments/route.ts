import { NextRequest, NextResponse } from 'next/server'
import { datalabAdmin } from '@/lib/supabase-datalab'

const VALID_TEAMS = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox']

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get('team')

  if (!team || !VALID_TEAMS.includes(team)) {
    return NextResponse.json({ comments: [] })
  }

  try {
    const { data } = await datalabAdmin
      .from('ownership_fan_comments')
      .select('id, author, type, text, created_at, likes')
      .eq('team_slug', team)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ comments: data || [] })
  } catch {
    return NextResponse.json({ comments: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { team_slug, author, type, text } = body

    if (!team_slug || !VALID_TEAMS.includes(team_slug)) {
      return NextResponse.json({ error: 'Invalid team' }, { status: 400 })
    }
    if (!text || text.trim().length < 3) {
      return NextResponse.json({ error: 'Comment too short' }, { status: 400 })
    }
    if (!['best', 'worst'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const { data, error } = await datalabAdmin
      .from('ownership_fan_comments')
      .insert({
        team_slug,
        author: (author || 'Anonymous Fan').slice(0, 50),
        type,
        text: text.trim().slice(0, 500),
        status: 'pending',
        likes: 0,
      })
      .select('id')
      .single()

    if (error) {
      // Table might not exist yet — fail gracefully
      console.error('Fan comment insert error:', error)
      return NextResponse.json({ error: 'Failed to submit' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data.id })
  } catch (err) {
    console.error('Fan comment API error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
