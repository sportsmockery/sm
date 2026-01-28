// src/app/api/engagement/create-profile/route.ts
// Creates engagement profile for new users

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_engagement_profile')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ message: 'Profile exists' }, { status: 200 })
  }

  // Check for localStorage team preference in request body
  const body = await request.json().catch(() => ({}))
  const preferredTeam = body.preferredTeam

  // Create default profile
  const defaultTeamScores: Record<string, number> = {
    'bears': 50,
    'bulls': 30,
    'blackhawks': 30,
    'cubs': 30,
    'white-sox': 30
  }

  // Boost preferred team if provided
  if (preferredTeam && defaultTeamScores[preferredTeam] !== undefined) {
    defaultTeamScores[preferredTeam] = 80
  }

  const { error } = await supabase
    .from('user_engagement_profile')
    .insert({
      user_id: user.id,
      team_scores: defaultTeamScores,
      format_prefs: { article: 0.33, video: 0.33, analysis: 0.34 },
      author_reads: {},
      topic_views_today: {}
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Profile created' }, { status: 201 })
}
