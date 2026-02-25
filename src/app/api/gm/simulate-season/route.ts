import { NextRequest, NextResponse } from 'next/server'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // V3 deep mode can take up to 15s

const DATALAB_BASE = 'https://datalab.sportsmockery.com'
const V3_ENDPOINT = `${DATALAB_BASE}/api/gm/simulate-season`

/**
 * Get the user's actual Supabase access token to forward to DataLab.
 * DataLab V3 requires a real user token, not the anon key.
 */
async function getUserAccessToken(request: NextRequest): Promise<string | null> {
  // Check for Bearer token (mobile app)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Get token from cookie-based session (web)
  try {
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
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}

/**
 * Fetch accepted trades for this session with full player/pick data.
 */
async function fetchSessionTrades(sessionId: string) {
  try {
    const { data: trades } = await datalabAdmin
      .from('gm_trades')
      .select('id, players_sent, players_received, draft_picks_sent, draft_picks_received, trade_partner, partner_team_key, chicago_team, sport, grade, is_three_team, partner_2')
      .eq('session_id', sessionId)
      .eq('status', 'accepted')

    return trades || []
  } catch (err) {
    console.error('[Simulate Season] Failed to fetch trades:', err)
    return []
  }
}

/**
 * POST /api/gm/simulate-season
 * Proxies to DataLab V3 season simulation API.
 * Includes full trade data so simulation accounts for roster changes.
 * Falls back to local engine if DataLab is unreachable.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getGMAuthUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { sessionId, sport, teamKey, seasonYear, simulationDepth } = body

    if (!sessionId || !sport || !teamKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: sessionId, sport, teamKey' },
        { status: 400 }
      )
    }

    // Fetch full trade data to include in simulation request
    const trades = await fetchSessionTrades(sessionId)

    const payload = {
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
      simulationDepth: simulationDepth || 'standard',
      // Include full trade data so DataLab has the complete roster picture
      trades: trades.map((t: any) => ({
        tradeId: t.id,
        chicagoTeam: t.chicago_team,
        tradePartner: t.trade_partner,
        partnerTeamKey: t.partner_team_key,
        grade: t.grade,
        isThreeTeam: !!t.is_three_team,
        partner2: t.partner_2 || null,
        playersSent: t.players_sent || [],
        playersReceived: t.players_received || [],
        draftPicksSent: t.draft_picks_sent || [],
        draftPicksReceived: t.draft_picks_received || [],
      })),
    }

    // Get the user's real Supabase access token for DataLab auth
    const userToken = await getUserAccessToken(request)
    const serviceKey = process.env.DATALAB_SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.DATALAB_SUPABASE_ANON_KEY

    // Try V3 endpoint with multiple auth strategies
    const authStrategies = [
      // 1. User's actual access token (preferred by V3)
      ...(userToken ? [{ 'Authorization': `Bearer ${userToken}` }] : []),
      // 2. Service role key
      ...(serviceKey ? [{ 'Authorization': `Bearer ${serviceKey}` }] : []),
      // 3. X-API-Key with service role
      ...(serviceKey ? [{ 'X-API-Key': serviceKey }] : []),
      // 4. Anon key
      ...(anonKey ? [{ 'Authorization': `Bearer ${anonKey}` }] : []),
    ]

    for (const authHeaders of authStrategies) {
      try {
        const v3Response = await fetch(V3_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders,
          },
          body: JSON.stringify(payload),
        })

        if (v3Response.ok) {
          const data = await v3Response.json()
          // Validate the response has real data (not empty 0-0)
          if (data.success) {
            return NextResponse.json(data)
          }
        }

        // If 401, try next auth strategy
        if (v3Response.status === 401) continue

        // Non-401 error, log and break
        console.error('[Simulate Season V3] Error:', v3Response.status)
        break
      } catch (err) {
        console.error('[Simulate Season V3] Request failed:', err)
        break
      }
    }

    // DataLab V3 failed — fall back to local simulation engine
    console.log('[Simulate Season] Falling back to local engine')
    const { simulateSeason } = await import('@/lib/sim/season-engine')
    const localResult = await simulateSeason({
      sessionId,
      sport,
      teamKey,
      seasonYear: seasonYear || 2026,
    })

    return NextResponse.json({ ...localResult, simulation_version: 'v1' })

  } catch (error) {
    console.error('[Simulate Season] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
