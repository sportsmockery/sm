import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const DATALAB_URL = 'https://datalab.sportsmockery.com'

async function getSessionWithToken() {
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

interface ValidateRequest {
  chicago_team: string
  partner_team_key: string
  players_sent: Array<{
    name: string
    position: string
    espn_id?: string | null
    cap_hit?: number | null
    age?: number | null
  }>
  players_received: Array<{
    name: string
    position: string
    espn_id?: string | null
    cap_hit?: number | null
    age?: number | null
  }>
  draft_picks_sent?: Array<{ year: number; round: number; condition?: string }>
  draft_picks_received?: Array<{ year: number; round: number; condition?: string }>
}

export interface ValidationResult {
  status: 'valid' | 'warning' | 'invalid'
  issues: Array<{
    severity: 'error' | 'warning' | 'info'
    code: string
    message: string
    player_name?: string
  }>
  cap_impact?: {
    chicago_delta: number
    partner_delta: number
    chicago_over_cap: boolean
    partner_over_cap: boolean
  }
  roster_impact?: {
    chicago_roster_size_after: number
    partner_roster_size_after: number
    position_conflicts: string[]
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionWithToken()
    if (!session?.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body: ValidateRequest = await request.json()

    // Basic client-side validation first
    const quickIssues: ValidationResult['issues'] = []

    // Check for empty trade
    if (body.players_sent.length === 0 && (!body.draft_picks_sent || body.draft_picks_sent.length === 0)) {
      quickIssues.push({
        severity: 'error',
        code: 'EMPTY_SENT',
        message: 'You must send at least one player or draft pick',
      })
    }

    if (body.players_received.length === 0 && (!body.draft_picks_received || body.draft_picks_received.length === 0)) {
      quickIssues.push({
        severity: 'error',
        code: 'EMPTY_RECEIVED',
        message: 'You must receive at least one player or draft pick',
      })
    }

    // Check for untouchable players (Chicago)
    const untouchablePlayers = ['Caleb Williams', 'Connor Bedard']
    for (const player of body.players_sent) {
      if (untouchablePlayers.some(u => player.name.toLowerCase().includes(u.toLowerCase()))) {
        quickIssues.push({
          severity: 'error',
          code: 'UNTOUCHABLE_PLAYER',
          message: `${player.name} is untouchable and cannot be traded`,
          player_name: player.name,
        })
      }
    }

    // If quick validation fails, return immediately
    if (quickIssues.some(i => i.severity === 'error')) {
      return NextResponse.json({
        status: 'invalid',
        issues: quickIssues,
      } as ValidationResult)
    }

    // Call Data Lab for comprehensive validation
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const res = await fetch(`${DATALAB_URL}/api/gm/validate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      // If Data Lab validation fails, return client-side validation only
      console.error('Data Lab validation error:', res.status)
      return NextResponse.json({
        status: quickIssues.length > 0 ? 'warning' : 'valid',
        issues: quickIssues,
      } as ValidationResult)
    }

    const datalabResult = await res.json()
    return NextResponse.json(datalabResult)
  } catch (error) {
    console.error('GM validate error:', error)
    // Return permissive response on error to not block users
    return NextResponse.json({
      status: 'valid',
      issues: [],
    } as ValidationResult)
  }
}
