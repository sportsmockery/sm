import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

// Chicago team keys by sport
const CHICAGO_TEAMS: Record<string, { key: string; name: string; sport: string }> = {
  bears: { key: 'chi', name: 'Chicago Bears', sport: 'nfl' },
  bulls: { key: 'chi', name: 'Chicago Bulls', sport: 'nba' },
  blackhawks: { key: 'chi', name: 'Chicago Blackhawks', sport: 'nhl' },
  cubs: { key: 'chc', name: 'Chicago Cubs', sport: 'mlb' },
  whitesox: { key: 'chw', name: 'Chicago White Sox', sport: 'mlb' },
}

// Offseason windows (approximate)
// These determine when Mock Draft is available for each sport
function isInOffseason(sport: string): boolean {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-12
  const day = now.getDate()

  switch (sport) {
    case 'nfl':
      // NFL Draft: Late April. Offseason: Mid-Jan through August
      // Most teams eliminated by wild card weekend (mid-Jan)
      // Super Bowl is early Feb, but draft prep starts when team is eliminated
      return (month === 1 && day >= 15) || (month >= 2 && month <= 8)
    case 'nba':
      // NBA Draft: June. Offseason: June-October
      return month >= 6 && month <= 10
    case 'nhl':
      // NHL Draft: July. Offseason: June-September
      return month >= 6 && month <= 9
    case 'mlb':
      // MLB Draft: July. Offseason: October-March
      return month >= 10 || month <= 3
    default:
      return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to use Mock Draft', code: 'AUTH_REQUIRED' }, { status: 401 })
    }

    const body = await request.json()
    const { chicago_team, draft_year } = body

    if (!chicago_team || !CHICAGO_TEAMS[chicago_team]) {
      return NextResponse.json({ error: 'Invalid Chicago team' }, { status: 400 })
    }

    const teamInfo = CHICAGO_TEAMS[chicago_team]

    // Check if team is in offseason
    if (!isInOffseason(teamInfo.sport)) {
      return NextResponse.json({
        error: `Mock Draft is only available during the ${teamInfo.sport.toUpperCase()} offseason`,
        code: 'NOT_OFFSEASON',
        sport: teamInfo.sport,
      }, { status: 400 })
    }

    // Call datalab API to start the draft
    // Datalab expects chicago_team as lowercase full name (e.g., 'chicago bears')
    const datalabChicagoTeam = teamInfo.name.toLowerCase()
    const datalabRes = await fetch(`${process.env.DATALAB_API_URL || 'https://datalab.sportsmockery.com'}/api/gm/draft/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DATALAB_API_KEY || ''}`,
      },
      body: JSON.stringify({
        user_id: user.id,
        user_email: user.email,
        chicago_team: datalabChicagoTeam,
        team_key: teamInfo.key,
        sport: teamInfo.sport,
        draft_year: draft_year || new Date().getFullYear(),
      }),
    })

    if (!datalabRes.ok) {
      const errData = await datalabRes.json().catch(() => ({}))
      const errorMsg = errData.error || errData.message || `Datalab API error: ${datalabRes.status}`
      console.error('Draft start datalab error:', {
        status: datalabRes.status,
        errorMsg,
        errData,
        sentPayload: {
          chicago_team: datalabChicagoTeam,
          team_key: teamInfo.key,
          sport: teamInfo.sport,
          draft_year: draft_year || new Date().getFullYear(),
        }
      })
      try {
        await datalabAdmin.from('gm_errors').insert({
          source: 'backend',
          error_type: 'api',
          error_message: errorMsg,
          route: '/api/gm/draft/start',
          metadata: {
            chicago_team: datalabChicagoTeam,
            original_team: chicago_team,
            sport: teamInfo.sport,
            status: datalabRes.status,
            errData,
            draft_year: draft_year || new Date().getFullYear(),
          }
        })
      } catch {}
      // Include more detail in the response
      const details = errData.details || errData.validation_errors || null
      return NextResponse.json({
        error: errorMsg,
        code: errData.code,
        details,
      }, { status: datalabRes.status })
    }

    const data = await datalabRes.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Draft start error:', error)
    try {
      await datalabAdmin.from('gm_errors').insert({
        source: 'backend',
        error_type: 'api',
        error_message: String(error),
        route: '/api/gm/draft/start'
      })
    } catch {}
    return NextResponse.json({ error: String(error) || 'Failed to start draft' }, { status: 500 })
  }
}
