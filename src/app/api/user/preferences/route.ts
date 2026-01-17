import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { TeamSlug, UserPreferences } from '@/lib/types'
import { getDefaultPreferences } from '@/lib/users'

/**
 * GET /api/user/preferences
 * Get user preferences (requires user ID in header or cookie)
 */
export async function GET(request: NextRequest) {
  try {
    // Get user ID from header or cookie
    const userId = request.headers.get('x-user-id') ||
                   request.cookies.get('user_id')?.value

    if (!userId) {
      // Return default preferences for anonymous users
      const defaults = getDefaultPreferences()
      return NextResponse.json({
        isAuthenticated: false,
        preferences: {
          userId: 'anonymous',
          favoriteTeams: defaults.favoriteTeams,
          notificationPrefs: defaults.notificationPrefs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    }

    // Fetch user preferences from database
    const { data, error } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Preferences fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      )
    }

    if (!data) {
      // User exists but no preferences set - return defaults
      const defaults = getDefaultPreferences()
      return NextResponse.json({
        isAuthenticated: true,
        preferences: {
          userId,
          favoriteTeams: defaults.favoriteTeams,
          notificationPrefs: defaults.notificationPrefs,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({
      isAuthenticated: true,
      preferences: {
        userId: data.user_id,
        favoriteTeams: data.favorite_teams || ['bears'],
        notificationPrefs: data.notification_prefs || {},
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/preferences
 * Create or update user preferences
 *
 * Body:
 * - favoriteTeams: TeamSlug[] (required)
 * - notificationPrefs?: Record<string, boolean>
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from header or cookie
    const userId = request.headers.get('x-user-id') ||
                   request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { favoriteTeams, notificationPrefs } = body

    // Validate favoriteTeams
    if (!Array.isArray(favoriteTeams) || favoriteTeams.length === 0) {
      return NextResponse.json(
        { error: 'At least one favorite team is required' },
        { status: 400 }
      )
    }

    const validTeams: TeamSlug[] = ['bears', 'cubs', 'white-sox', 'bulls', 'blackhawks']
    const filteredTeams = favoriteTeams.filter((t: string) => validTeams.includes(t as TeamSlug))

    if (filteredTeams.length === 0) {
      return NextResponse.json(
        { error: 'No valid team slugs provided' },
        { status: 400 }
      )
    }

    // Ensure Bears is first if included (Bears-first design)
    const sortedTeams = filteredTeams.includes('bears')
      ? ['bears', ...filteredTeams.filter((t: string) => t !== 'bears')]
      : filteredTeams

    // Upsert preferences
    const { data, error } = await supabaseAdmin
      .from('sm_user_preferences')
      .upsert({
        user_id: userId,
        favorite_teams: sortedTeams,
        notification_prefs: notificationPrefs || {},
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Preferences upsert error:', error)
      return NextResponse.json(
        { error: 'Failed to save preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: {
        userId: data.user_id,
        favoriteTeams: data.favorite_teams,
        notificationPrefs: data.notification_prefs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/preferences
 * Partially update user preferences (add/remove teams, update notification prefs)
 *
 * Body:
 * - addTeam?: TeamSlug
 * - removeTeam?: TeamSlug
 * - notificationPrefs?: Record<string, boolean>
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') ||
                   request.cookies.get('user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { addTeam, removeTeam, notificationPrefs } = body

    // Get current preferences
    const { data: current } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single()

    let currentTeams: TeamSlug[] = current?.favorite_teams || ['bears']
    let currentNotifs = current?.notification_prefs || {}

    // Handle addTeam
    if (addTeam && !currentTeams.includes(addTeam)) {
      currentTeams = [...currentTeams, addTeam]
    }

    // Handle removeTeam (but keep at least Bears)
    if (removeTeam && currentTeams.length > 1) {
      currentTeams = currentTeams.filter(t => t !== removeTeam)
      if (currentTeams.length === 0) {
        currentTeams = ['bears']
      }
    }

    // Handle notificationPrefs merge
    if (notificationPrefs) {
      currentNotifs = { ...currentNotifs, ...notificationPrefs }
    }

    // Ensure Bears is first
    if (currentTeams.includes('bears')) {
      currentTeams = ['bears', ...currentTeams.filter(t => t !== 'bears')]
    }

    // Upsert
    const { data, error } = await supabaseAdmin
      .from('sm_user_preferences')
      .upsert({
        user_id: userId,
        favorite_teams: currentTeams,
        notification_prefs: currentNotifs,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Preferences patch error:', error)
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      preferences: {
        userId: data.user_id,
        favoriteTeams: data.favorite_teams,
        notificationPrefs: data.notification_prefs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error('Preferences API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
