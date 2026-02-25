import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'
import { computeTradeHash } from '@/lib/gm-trade-hash'
import { datalabAdmin } from '@/lib/supabase-datalab'

export const dynamic = 'force-dynamic'

const DATALAB_API = 'https://datalab.sportsmockery.com'

/**
 * POST /api/v2/gm/grade
 * V2 GM Trade Grading with deterministic validation
 * Feature flag: gm_deterministic_validation
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body = await request.json()

    // Get user session
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try {
                cookieStore.set(name, value, options)
              } catch {
                // Ignore - this happens in read-only contexts
              }
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id || null

    // ========== REPEAT TRADE CACHE CHECK ==========
    if (userId) {
      const {
        chicago_team, partner_team_key, players_sent, players_received,
        draft_picks_sent, draft_picks_received, session_id,
        trade_partner_1, trade_partner_2, players: threeTeamPlayers, draft_picks: threeTeamPicks,
      } = body

      const sport = { bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb' }[chicago_team as string]

      if (chicago_team && sport) {
        const tradeHash = computeTradeHash({
          chicago_team,
          sport,
          partner_team_key: partner_team_key || undefined,
          players_sent: Array.isArray(players_sent) ? players_sent : [],
          players_received: Array.isArray(players_received) ? players_received : [],
          draft_picks_sent: Array.isArray(draft_picks_sent) ? draft_picks_sent : [],
          draft_picks_received: Array.isArray(draft_picks_received) ? draft_picks_received : [],
          trade_partner_1,
          trade_partner_2,
          three_team_players: Array.isArray(threeTeamPlayers) ? threeTeamPlayers : undefined,
          three_team_picks: Array.isArray(threeTeamPicks) ? threeTeamPicks : undefined,
        })

        const { data: cachedTrade } = await datalabAdmin
          .from('gm_trades')
          .select('*')
          .eq('user_id', userId)
          .eq('trade_hash', tradeHash)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (cachedTrade) {
          const isThreeTeamTrade = !!(trade_partner_1 && trade_partner_2)
          const cachedAiVersion = `cached_${cachedTrade.ai_version || 'unknown'}`
          const newSharedCode = randomBytes(6).toString('hex')
          const userEmail = session?.user?.email || 'guest'

          // Create new trade record (appears in history normally)
          const { data: newTrade } = await datalabAdmin.from('gm_trades').insert({
            user_id: userId,
            user_email: userEmail,
            chicago_team,
            sport,
            trade_partner: cachedTrade.trade_partner,
            players_sent: cachedTrade.players_sent,
            players_received: cachedTrade.players_received,
            grade: cachedTrade.grade,
            grade_reasoning: cachedTrade.grade_reasoning,
            status: cachedTrade.status,
            is_dangerous: cachedTrade.is_dangerous,
            session_id: session_id || null,
            improvement_score: cachedTrade.improvement_score,
            trade_summary: cachedTrade.trade_summary,
            ai_version: cachedAiVersion,
            shared_code: newSharedCode,
            partner_team_key: cachedTrade.partner_team_key,
            partner_team_logo: cachedTrade.partner_team_logo,
            chicago_team_logo: cachedTrade.chicago_team_logo,
            draft_picks_sent: cachedTrade.draft_picks_sent,
            draft_picks_received: cachedTrade.draft_picks_received,
            talent_balance: cachedTrade.talent_balance,
            contract_value: cachedTrade.contract_value,
            team_fit: cachedTrade.team_fit,
            future_assets: cachedTrade.future_assets,
            cap_analysis: cachedTrade.cap_analysis,
            trade_hash: tradeHash,
            is_three_team: isThreeTeamTrade || false,
            ...(isThreeTeamTrade ? {
              trade_partner_2: cachedTrade.trade_partner_2,
              trade_partner_2_logo: cachedTrade.trade_partner_2_logo,
              three_team_players: cachedTrade.three_team_players,
              three_team_picks: cachedTrade.three_team_picks,
            } : {}),
          }).select().single()

          // Create trade items from original trade
          if (newTrade) {
            const { data: originalItems } = await datalabAdmin
              .from('gm_trade_items')
              .select('*')
              .eq('trade_id', cachedTrade.id)

            if (originalItems && originalItems.length > 0) {
              const newItems = originalItems.map((item: any) => {
                const { id, trade_id, created_at, ...rest } = item
                return { ...rest, trade_id: newTrade.id }
              })
              await datalabAdmin.from('gm_trade_items').insert(newItems)
            }
          }

          // Log to audit (with cached flag)
          try {
            await datalabAdmin.from('gm_audit_logs').insert({
              user_id: userId,
              trade_id: newTrade?.id || null,
              request_payload: body,
              response_payload: { grade: cachedTrade.grade, reasoning: cachedTrade.grade_reasoning, cached: true, original_trade_id: cachedTrade.id },
              model_name: 'cached',
              response_time_ms: Date.now() - startTime,
            })
          } catch {}

          // Update session counters (count normally)
          if (session_id) {
            const { data: sess } = await datalabAdmin.from('gm_sessions').select('*').eq('id', session_id).single()
            if (sess) {
              await datalabAdmin.from('gm_sessions').update({
                num_trades: (sess.num_trades || 0) + 1,
                num_approved: (sess.num_approved || 0) + (cachedTrade.status === 'accepted' ? 1 : 0),
                num_dangerous: (sess.num_dangerous || 0) + (cachedTrade.is_dangerous ? 1 : 0),
                num_failed: (sess.num_failed || 0) + (cachedTrade.status === 'rejected' ? 1 : 0),
                total_improvement: +(((sess.total_improvement || 0) + (cachedTrade.status === 'accepted' ? (cachedTrade.improvement_score || 0) : 0)).toFixed(2)),
                updated_at: new Date().toISOString(),
              }).eq('id', session_id)
            }
          }

          // SKIP leaderboard update — cached trade does not change GM score

          // Return response matching DataLab v2 response shape
          return NextResponse.json({
            grade: cachedTrade.grade,
            reasoning: cachedTrade.grade_reasoning,
            status: cachedTrade.status,
            is_dangerous: cachedTrade.is_dangerous,
            trade_id: newTrade?.id || null,
            shared_code: newSharedCode,
            trade_summary: cachedTrade.trade_summary,
            improvement_score: cachedTrade.improvement_score,
            breakdown: {
              talent_balance: cachedTrade.talent_balance,
              contract_value: cachedTrade.contract_value,
              team_fit: cachedTrade.team_fit,
              future_assets: cachedTrade.future_assets,
            },
            cap_analysis: cachedTrade.cap_analysis,
            ...(isThreeTeamTrade ? { is_three_team: true } : {}),
          })
        }
      }
    }
    // ========== END REPEAT TRADE CACHE CHECK ==========

    // No cache hit — proxy to Datalab v2 endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }

    const response = await fetch(`${DATALAB_API}/api/v2/gm/grade`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    // Pass through the response (including 503 with fallback_to_legacy)
    const data = await response.json()

    // If DataLab returned a successful grade, store trade_hash for future cache hits
    if (response.ok && data.trade_id && userId && body.chicago_team) {
      const sport = { bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb' }[body.chicago_team as string]
      if (sport) {
        const tradeHash = computeTradeHash({
          chicago_team: body.chicago_team,
          sport,
          partner_team_key: body.partner_team_key || undefined,
          players_sent: Array.isArray(body.players_sent) ? body.players_sent : [],
          players_received: Array.isArray(body.players_received) ? body.players_received : [],
          draft_picks_sent: Array.isArray(body.draft_picks_sent) ? body.draft_picks_sent : [],
          draft_picks_received: Array.isArray(body.draft_picks_received) ? body.draft_picks_received : [],
          trade_partner_1: body.trade_partner_1,
          trade_partner_2: body.trade_partner_2,
          three_team_players: Array.isArray(body.players) ? body.players : undefined,
          three_team_picks: Array.isArray(body.draft_picks) ? body.draft_picks : undefined,
        })
        // Update the trade record with the hash (best effort)
        await datalabAdmin.from('gm_trades').update({ trade_hash: tradeHash }).eq('id', data.trade_id).then(() => {})
      }
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v2/gm/grade] Error:', error)
    return NextResponse.json(
      { error: 'Failed to grade trade', fallback_to_legacy: true },
      { status: 503 }
    )
  }
}
