import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

export type ScenarioType =
  | 'player_improvement'
  | 'player_decline'
  | 'injury_impact'
  | 'add_pick'
  | 'remove_player'
  | 'age_progression'

export interface ScenarioRequest {
  trade_id: string
  original_grade: number
  scenario_type: ScenarioType
  parameters: {
    // player_improvement / player_decline
    improvement_pct?: number // -50 to +50
    player_name?: string

    // injury_impact
    injured_player?: string
    injury_severity?: 'minor' | 'major' | 'season_ending'

    // add_pick
    pick_year?: number
    pick_round?: number
    pick_side?: 'sent' | 'received'

    // remove_player
    removed_player?: string
    removed_side?: 'sent' | 'received'

    // age_progression
    years_forward?: number // 1, 2, or 3
  }
}

export interface ScenarioResult {
  scenario_type: ScenarioType
  description: string
  original_grade: number
  adjusted_grade: number
  grade_delta: number
  reasoning: string
  breakdown_changes?: {
    talent_balance_delta: number
    contract_value_delta: number
    team_fit_delta: number
    future_assets_delta: number
  }
  probability?: number // For injury scenarios
}

export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ScenarioRequest = await request.json()

    if (!body.trade_id || !body.scenario_type || body.original_grade === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate scenario type
    const validTypes: ScenarioType[] = [
      'player_improvement',
      'player_decline',
      'injury_impact',
      'add_pick',
      'remove_player',
      'age_progression',
    ]
    if (!validTypes.includes(body.scenario_type)) {
      return NextResponse.json({ error: 'Invalid scenario type' }, { status: 400 })
    }

    // Call Data Lab for scenario analysis
    const res = await fetch(`${DATALAB_URL}/api/gm/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'sportsmockery.com',
        'X-User-Id': user.id,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // Return a simulated scenario result if Data Lab is unavailable
      console.error('Data Lab scenarios error:', res.status)
      const simulated = simulateScenario(body)
      return NextResponse.json(simulated)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM scenarios error:', error)
    return NextResponse.json({ error: 'Failed to analyze scenario' }, { status: 500 })
  }
}

// Fallback simulation when Data Lab is unavailable
function simulateScenario(req: ScenarioRequest): ScenarioResult {
  const { scenario_type, original_grade, parameters } = req
  let delta = 0
  let description = ''
  let reasoning = ''

  switch (scenario_type) {
    case 'player_improvement':
      const improvePct = parameters.improvement_pct || 10
      delta = Math.round(improvePct / 3)
      description = `${parameters.player_name || 'Player'} improves by ${improvePct}%`
      reasoning = `If ${parameters.player_name || 'the player'} improves performance by ${improvePct}%, the trade value increases. This scenario assumes development matching the projected improvement.`
      break

    case 'player_decline':
      const declinePct = parameters.improvement_pct || -10
      delta = Math.round(declinePct / 3)
      description = `${parameters.player_name || 'Player'} declines by ${Math.abs(declinePct)}%`
      reasoning = `Performance decline of ${Math.abs(declinePct)}% would negatively impact the trade value. Consider the player's injury history and age when evaluating this risk.`
      break

    case 'injury_impact':
      const severityImpact = {
        minor: -3,
        major: -8,
        season_ending: -15,
      }
      delta = severityImpact[parameters.injury_severity || 'minor']
      description = `${parameters.injured_player || 'Player'} suffers ${parameters.injury_severity || 'minor'} injury`
      reasoning = `A ${parameters.injury_severity || 'minor'} injury would significantly impact the trade value. Factor in the team's depth at this position when evaluating risk.`
      break

    case 'add_pick':
      const roundValue = [0, 12, 8, 5, 3, 2, 1, 1]
      const pickValue = roundValue[parameters.pick_round || 1] || 1
      delta = parameters.pick_side === 'received' ? pickValue : -pickValue
      description = `Add ${parameters.pick_year || 2026} Round ${parameters.pick_round || 1} pick to ${parameters.pick_side === 'received' ? 'receiving' : 'sending'} side`
      reasoning = `Adding a ${parameters.pick_year || 2026} Round ${parameters.pick_round || 1} pick ${parameters.pick_side === 'received' ? 'improves' : 'decreases'} the trade value by ${Math.abs(delta)} points.`
      break

    case 'remove_player':
      delta = parameters.removed_side === 'sent' ? 5 : -5
      description = `Remove ${parameters.removed_player || 'player'} from ${parameters.removed_side === 'sent' ? 'sending' : 'receiving'} side`
      reasoning = `Removing ${parameters.removed_player || 'the player'} from the ${parameters.removed_side === 'sent' ? 'sending' : 'receiving'} side ${parameters.removed_side === 'sent' ? 'improves' : 'decreases'} the trade balance.`
      break

    case 'age_progression':
      const yearsForward = parameters.years_forward || 1
      delta = -yearsForward * 2
      description = `Project trade ${yearsForward} year${yearsForward > 1 ? 's' : ''} forward`
      reasoning = `After ${yearsForward} year${yearsForward > 1 ? 's' : ''}, player aging and contract situations change the trade's long-term value. Younger players and draft picks gain relative value.`
      break
  }

  const adjustedGrade = Math.max(0, Math.min(100, original_grade + delta))

  return {
    scenario_type,
    description,
    original_grade,
    adjusted_grade: adjustedGrade,
    grade_delta: delta,
    reasoning,
    breakdown_changes: {
      talent_balance_delta: delta * 0.3,
      contract_value_delta: delta * 0.2,
      team_fit_delta: delta * 0.25,
      future_assets_delta: delta * 0.25,
    },
  }
}
