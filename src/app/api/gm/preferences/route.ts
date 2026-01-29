import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export interface GMPreferences {
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  favorite_team: string | null
  team_phase: 'rebuilding' | 'contending' | 'win_now' | 'auto'
  preferred_trade_style: 'balanced' | 'star_hunting' | 'depth_building' | 'draft_focused'
  cap_flexibility_priority: 'low' | 'medium' | 'high'
  age_preference: 'young' | 'prime' | 'veteran' | 'any'
}

const DEFAULT_PREFERENCES: GMPreferences = {
  risk_tolerance: 'moderate',
  favorite_team: null,
  team_phase: 'auto',
  preferred_trade_style: 'balanced',
  cap_flexibility_priority: 'medium',
  age_preference: 'any',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/preferences?user_id=${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local storage
    }

    // Fallback to local database
    const { data: prefs } = await datalabAdmin
      .from('gm_user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (prefs) {
      return NextResponse.json({
        preferences: {
          risk_tolerance: prefs.risk_tolerance || DEFAULT_PREFERENCES.risk_tolerance,
          favorite_team: prefs.favorite_team || DEFAULT_PREFERENCES.favorite_team,
          team_phase: prefs.team_phase || DEFAULT_PREFERENCES.team_phase,
          preferred_trade_style: prefs.preferred_trade_style || DEFAULT_PREFERENCES.preferred_trade_style,
          cap_flexibility_priority: prefs.cap_flexibility_priority || DEFAULT_PREFERENCES.cap_flexibility_priority,
          age_preference: prefs.age_preference || DEFAULT_PREFERENCES.age_preference,
        } as GMPreferences,
      })
    }

    return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
  } catch (error) {
    console.error('GM preferences GET error:', error)
    return NextResponse.json({ preferences: DEFAULT_PREFERENCES })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const preferences: Partial<GMPreferences> = body.preferences || {}

    // Validate preferences
    const validRiskTolerance = ['conservative', 'moderate', 'aggressive']
    const validTeamPhase = ['rebuilding', 'contending', 'win_now', 'auto']
    const validTradeStyle = ['balanced', 'star_hunting', 'depth_building', 'draft_focused']
    const validCapPriority = ['low', 'medium', 'high']
    const validAgePref = ['young', 'prime', 'veteran', 'any']

    if (preferences.risk_tolerance && !validRiskTolerance.includes(preferences.risk_tolerance)) {
      return NextResponse.json({ error: 'Invalid risk_tolerance' }, { status: 400 })
    }
    if (preferences.team_phase && !validTeamPhase.includes(preferences.team_phase)) {
      return NextResponse.json({ error: 'Invalid team_phase' }, { status: 400 })
    }
    if (preferences.preferred_trade_style && !validTradeStyle.includes(preferences.preferred_trade_style)) {
      return NextResponse.json({ error: 'Invalid preferred_trade_style' }, { status: 400 })
    }
    if (preferences.cap_flexibility_priority && !validCapPriority.includes(preferences.cap_flexibility_priority)) {
      return NextResponse.json({ error: 'Invalid cap_flexibility_priority' }, { status: 400 })
    }
    if (preferences.age_preference && !validAgePref.includes(preferences.age_preference)) {
      return NextResponse.json({ error: 'Invalid age_preference' }, { status: 400 })
    }

    // Try Data Lab first
    try {
      const res = await fetch(`${DATALAB_URL}/api/gm/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'sportsmockery.com',
          'X-User-Id': user.id,
        },
        body: JSON.stringify({ user_id: user.id, preferences }),
      })

      if (res.ok) {
        const data = await res.json()
        return NextResponse.json(data)
      }
    } catch {
      // Fall through to local storage
    }

    // Fallback to local database upsert
    const { error } = await datalabAdmin
      .from('gm_user_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

    if (error) {
      console.error('GM preferences upsert error:', error)
      // Even if save fails, return success to not block the user
    }

    return NextResponse.json({ success: true, preferences })
  } catch (error) {
    console.error('GM preferences POST error:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
}
