import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export interface TeamFitResult {
  player_name: string
  player_espn_id?: string
  target_team: string
  overall_fit: number // 0-100
  breakdown: {
    positional_need: number // 0-100: How much does the team need this position?
    age_fit: number // 0-100: Does player's age fit team's window?
    cap_fit: number // 0-100: Can the team afford this player?
    scheme_fit: number // 0-100: Does player fit team's system?
  }
  insights: {
    positional_need: string
    age_fit: string
    cap_fit: string
    scheme_fit: string
  }
  recommendation: string
  comparable_acquisitions?: Array<{
    player_name: string
    team: string
    fit_score: number
    outcome: 'success' | 'neutral' | 'failure'
  }>
}

export async function GET(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const playerEspnId = request.nextUrl.searchParams.get('player_espn_id')
    const playerName = request.nextUrl.searchParams.get('player_name')
    const targetTeam = request.nextUrl.searchParams.get('target_team')
    const sport = request.nextUrl.searchParams.get('sport')

    if (!targetTeam || !sport) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    if (!playerEspnId && !playerName) {
      return NextResponse.json({ error: 'Must provide player_espn_id or player_name' }, { status: 400 })
    }

    // Call Data Lab for comprehensive fit analysis
    const params = new URLSearchParams({
      target_team: targetTeam,
      sport,
    })
    if (playerEspnId) params.append('player_espn_id', playerEspnId)
    if (playerName) params.append('player_name', playerName)

    const res = await fetch(`${DATALAB_URL}/api/gm/fit?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
        'X-User-Id': user.id,
      },
    })

    if (!res.ok) {
      // Return a fallback fit analysis if Data Lab is unavailable
      console.error('Data Lab fit error:', res.status)
      return NextResponse.json({
        player_name: playerName || 'Player',
        player_espn_id: playerEspnId,
        target_team: targetTeam,
        overall_fit: 70,
        breakdown: {
          positional_need: 70,
          age_fit: 70,
          cap_fit: 70,
          scheme_fit: 70,
        },
        insights: {
          positional_need: 'Analysis unavailable',
          age_fit: 'Analysis unavailable',
          cap_fit: 'Analysis unavailable',
          scheme_fit: 'Analysis unavailable',
        },
        recommendation: 'Full analysis requires Data Lab connection.',
      } as TeamFitResult)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM fit error:', error)
    return NextResponse.json({ error: 'Failed to analyze team fit' }, { status: 500 })
  }
}
