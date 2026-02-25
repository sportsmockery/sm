// src/app/api/engagement/profile/route.ts
// GET — returns the user's engagement profile + hasSufficientData flag

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try { cookieStore.set(name, value, options) } catch {}
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ profile: null, hasSufficientData: false }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch engagement profile
    const { data: profile } = await supabaseAdmin
      .from('user_engagement_profile')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ profile: null, hasSufficientData: false })
    }

    // Sufficient data: profile >= 7 days old AND >= 10 interactions
    let hasSufficientData = false
    const createdAt = profile.created_at ? new Date(profile.created_at) : null
    if (createdAt) {
      const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceCreation >= 7) {
        // Count interactions
        const { count } = await supabaseAdmin
          .from('user_interactions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)

        hasSufficientData = (count || 0) >= 10
      }
    }

    return NextResponse.json({ profile, hasSufficientData })
  } catch (error) {
    console.error('[engagement/profile] Error:', error)
    return NextResponse.json({ profile: null, hasSufficientData: false }, { status: 500 })
  }
}
