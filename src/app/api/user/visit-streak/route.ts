import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

async function getSession() {
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
  return session
}

/**
 * POST /api/user/visit-streak
 * Updates visit streak on homepage load and returns current streak + user name.
 * Streak logic:
 *  - If last_visit_date is today → no change, return current streak
 *  - If last_visit_date is yesterday → increment streak
 *  - Otherwise (null or older) → reset to 1
 */
export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ streak: 0, name: null }, { status: 401 })
    }

    const userId = session.user.id
    const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || null
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Get current preferences
    const { data: prefs } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('visit_streak, last_visit_date')
      .eq('user_id', userId)
      .single()

    let streak = 1
    const lastVisit = prefs?.last_visit_date

    if (lastVisit === today) {
      // Already visited today — return current streak without updating
      return NextResponse.json({
        streak: prefs?.visit_streak || 1,
        name: userName,
      })
    }

    if (lastVisit) {
      // Check if yesterday
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastVisit === yesterdayStr) {
        streak = (prefs?.visit_streak || 0) + 1
      }
      // else: gap > 1 day → reset to 1
    }

    // Upsert with updated streak
    await supabaseAdmin
      .from('sm_user_preferences')
      .upsert({
        user_id: userId,
        visit_streak: streak,
        last_visit_date: today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    return NextResponse.json({ streak, name: userName })
  } catch (error) {
    console.error('[visit-streak] Error:', error)
    return NextResponse.json({ streak: 0, name: null }, { status: 500 })
  }
}
