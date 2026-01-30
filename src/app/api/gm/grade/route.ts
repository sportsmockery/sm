import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'


function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}

const MODEL_NAME = 'claude-sonnet-4-20250514'

const GM_SYSTEM_PROMPT = `You are "GM", a brutally honest sports trade evaluator and general manager for SM Data Lab, a Chicago sports analytics platform. You grade proposed trades on a scale of 0-100.

## Grading Criteria (weighted)
1. **Realism (30%)**: Would the other GM actually accept? This is the MOST IMPORTANT factor. If the other team would laugh and hang up, the grade CANNOT exceed 25 regardless of how good it looks for Chicago. A trade that is unrealistic is a BAD trade — it wastes time and shows poor evaluation skills.
2. **Value Balance (25%)**: Comparable talent, production, and contract value on both sides. Lopsided trades in EITHER direction score low.
3. **Team Needs (15%)**: Does this fill a real gap for the Chicago team? Trading from depth = good. Acquiring at a stacked position = bad.
4. **Player Caliber (10%)**: Stats, awards, trajectory, usage, advanced metrics.
5. **Contract/Cap (15%)**: Salary cap implications. NFL ~$255M, NBA ~$141M (luxury tax ~$171M), NHL ~$88M, MLB has no cap but CBT at ~$241M. Include specific dollar amounts in cap_analysis.
6. **Age/Future (5%)**: Under 27 = ascending value. Over 32 = declining. Rookie deals = premium.

## CRITICAL: Realism Gate
Before grading, ask: "Would the other GM accept this trade?" If the answer is clearly NO because the package is vastly insufficient, the grade MUST be capped:
- Other team would NEVER accept (massive value gap): Grade 0-20
- Other team would probably decline (notable value gap): Grade 15-35
- Plausible but unlikely: Grade 25-50
- Reasonable — both sides can justify it: Grade 40-75
- Both sides clearly benefit: Grade 60-85
- Franchise-altering, realistic blockbuster: Grade 80-95

Do NOT give a high grade just because acquiring the player would be great for Chicago. The trade must be REALISTIC. Getting Mike Trout for a backup catcher would be amazing for Chicago but deserves a grade of 5, not 80.

## Grading Scale
- 90-100: Elite, franchise-altering (extremely rare — maybe 1 in 50 trades)
- 70-89: Good, accepted but flagged "dangerous" if 70-90 (risky upside)
- 50-69: Decent but flawed, or mediocre value — REJECTED
- 30-49: Bad — giving up too much OR not enough to get the deal done
- 15-29: Very bad — unrealistic or clearly one-sided
- 0-14: Catastrophic — untouchable player traded, absurd proposal, or laughable value gap
Most trades should land between 25-65. Grades 70+ require BOTH sides to plausibly agree AND the Chicago team to meaningfully improve.

## Sport-Specific Rules

### NFL (Bears)
- Position value: QB > Edge > LT > CB > WR > IDL > LB > RB (RBs are nearly worthless in trade value)
- Trading a 1st for an RB = grade 15-30. Trading franchise QB = grade 0-10.
- Bears are CONTENDING with young core. Caleb Williams is UNTOUCHABLE (grade 0 if sent).
- Division trades (Packers/Vikings/Lions) cost a 5-10 point penalty.
- Draft pick value: 1st overall ~3000, late 1st ~800-1200, 2nd ~400-700, 3rd+ minimal.

### NBA (Bulls)
- Position value: Two-way wing > Lead creator > Stretch big > 3&D > Traditional center
- Salary matching is MANDATORY for over-the-cap teams (125% + $100K rule).
- Rookie-scale deals are the most valuable contracts. Supermax = hardest to trade.
- Bulls are TRANSITIONAL — grade depends on whether the move is clearly buying or selling.
- Can't trade consecutive future 1sts (Stepien Rule). No-trade clauses exist.

### NHL (Blackhawks)
- Position value: #1 Center > Top-pair D > Elite winger > Starting goalie > depth
- Retained salary (up to 50%) is a major trade mechanic.
- Blackhawks are REBUILDING around Connor Bedard. Bedard is UNTOUCHABLE (grade 0 if sent).
- Selling veterans for picks/prospects = good. Acquiring expensive vets = bad.
- Rental trades at deadline are common — UFAs have less value than controlled players.

### MLB (Cubs & White Sox)
- Position value: Ace SP > SS/CF/C > Elite hitter > Setup/Closer > Corner positions > DH
- Prospect packages are the PRIMARY trade currency. MLB prospects matter more than any other sport.
- Years of team control dramatically affect value — 3 years of control >> rental.
- Cubs (92-70) are CONTENDING — should be buying. Trading top prospects for proven talent = acceptable.
- White Sox (60-102) are REBUILDING — should be selling everything for future assets.

## Untouchable Players
- Bears: Caleb Williams (franchise QB on rookie deal) → grade 0 if traded
- Blackhawks: Connor Bedard (generational talent, rebuild centerpiece) → grade 0 if traded
- White Sox: Nobody (everyone is tradeable in a rebuild)

## Edge Cases
- Unknown player names: Still grade based on position and trade structure. Note unfamiliarity in reasoning.
- Absurd trades (mascots, wrong sport): Grade 0 with humor.
- Draft-pick-only trades: Grade on value chart equivalence.

## Response Format
You MUST respond with valid JSON only, no other text:
{
  "grade": <number 0-100>,
  "reasoning": "<2-4 sentence explanation>",
  "trade_summary": "<One-line summary of the trade>",
  "improvement_score": <number -10 to 10, how much this improves the Chicago team>,
  "breakdown": {
    "talent_balance": <0.0-1.0>,
    "contract_value": <0.0-1.0>,
    "team_fit": <0.0-1.0>,
    "future_assets": <0.0-1.0>
  },
  "cap_analysis": "<1-2 sentences about salary cap impact with specific dollar amounts when available>"
}

Reasoning should: name specific players, mention team phase (rebuild/contend), note cap/salary if relevant, reference comparable real trades when possible, and always frame from Chicago's perspective. Be a seasoned GM, not a robot.

Do not wrap in markdown code blocks. Just raw JSON.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Auth is optional - guests can grade trades but won't have history saved
    const user = await getGMAuthUser(request)
    const userId = user?.id || 'guest'
    const isGuest = !user
    const displayName = user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous'

    // Rate limiting: max 10 trades per minute (only for logged-in users)
    if (!isGuest) {
      const oneMinAgo = new Date(Date.now() - 60000).toISOString()
      const { count: recentCount } = await datalabAdmin
        .from('gm_trades')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', oneMinAgo)
      if ((recentCount || 0) >= 10) {
        return NextResponse.json({ error: 'Rate limited. Max 10 trades per minute.' }, { status: 429 })
      }
    }

    const body = await request.json()
    const { chicago_team, trade_partner, players_sent, players_received, draft_picks_sent, draft_picks_received, session_id, partner_team_key } = body

    if (!chicago_team || !TEAM_SPORT_MAP[chicago_team]) {
      return NextResponse.json({ error: 'Invalid chicago_team' }, { status: 400 })
    }
    if (!trade_partner || typeof trade_partner !== 'string') {
      return NextResponse.json({ error: 'trade_partner required' }, { status: 400 })
    }
    // Validate that at least one asset is being sent and received (players OR draft picks)
    const hasSentAssets = (Array.isArray(players_sent) && players_sent.length > 0) ||
                          (Array.isArray(draft_picks_sent) && draft_picks_sent.length > 0)
    const hasReceivedAssets = (Array.isArray(players_received) && players_received.length > 0) ||
                              (Array.isArray(draft_picks_received) && draft_picks_received.length > 0)

    if (!hasSentAssets) {
      return NextResponse.json({ error: 'Must send at least one player or draft pick' }, { status: 400 })
    }
    if (!hasReceivedAssets) {
      return NextResponse.json({ error: 'Must receive at least one player or draft pick' }, { status: 400 })
    }

    // Ensure arrays are initialized (empty arrays, not undefined)
    const safePlayers_sent = Array.isArray(players_sent) ? players_sent : []
    const safePlayers_received = Array.isArray(players_received) ? players_received : []
    const safeDraft_picks_sent = Array.isArray(draft_picks_sent) ? draft_picks_sent : []
    const safeDraft_picks_received = Array.isArray(draft_picks_received) ? draft_picks_received : []

    const sport = TEAM_SPORT_MAP[chicago_team]
    const teamDisplayNames: Record<string, string> = {
      bears: 'Chicago Bears', bulls: 'Chicago Bulls', blackhawks: 'Chicago Blackhawks',
      cubs: 'Chicago Cubs', whitesox: 'Chicago White Sox',
    }

    // Fetch salary cap data for both teams
    const capTable = `gm_${sport}_salary_cap`
    let chicagoCapData: any = null
    let partnerCapData: any = null
    try {
      const { data: cc } = await datalabAdmin
        .from(capTable)
        .select('total_cap, cap_used, cap_available, dead_money')
        .eq('team_key', chicago_team)
        .order('season', { ascending: false })
        .limit(1)
        .single()
      chicagoCapData = cc
    } catch {}
    if (partner_team_key) {
      try {
        const { data: pc } = await datalabAdmin
          .from(capTable)
          .select('total_cap, cap_used, cap_available, dead_money')
          .eq('team_key', partner_team_key)
          .order('season', { ascending: false })
          .limit(1)
          .single()
        partnerCapData = pc
      } catch {}
    }

    const formatMoney = (v: number) => `$${(v / 1_000_000).toFixed(1)}M`

    // Look up player value tiers for both sides
    const allPlayerNames = [
      ...safePlayers_sent.map((p: any) => p.name || p.full_name),
      ...safePlayers_received.map((p: any) => p.name || p.full_name),
    ].filter(Boolean)

    let tierMap: Record<string, { tier: number, tier_label: string, trade_value_score: number, is_untouchable: boolean }> = {}
    try {
      const { data: tiers } = await datalabAdmin
        .from('gm_player_value_tiers')
        .select('player_name, tier, tier_label, trade_value_score, is_untouchable')
        .in('player_name', allPlayerNames)
        .eq('league', sport)
      if (tiers) {
        for (const t of tiers) {
          tierMap[t.player_name] = { tier: t.tier, tier_label: t.tier_label, trade_value_score: t.trade_value_score, is_untouchable: t.is_untouchable }
        }
      }
    } catch {
      // Table may not exist yet — continue without tiers
    }

    // Look up few-shot grading examples
    let examplesBlock = ''
    try {
      const { data: examples } = await datalabAdmin
        .from('gm_grading_examples')
        .select('trade_description, correct_grade, reasoning, category')
        .eq('sport', sport)
        .limit(5)
      if (examples && examples.length > 0) {
        examplesBlock = `\n\nReference Grades (use as calibration):\n${examples.map(
          (ex: any) => `- ${ex.category}: "${ex.trade_description}" → Grade ${ex.correct_grade} (${ex.reasoning})`
        ).join('\n')}`
      }
    } catch {
      // Table may not exist yet — continue without examples
    }

    const sentDesc = safePlayers_sent.map((p: any) => {
      const playerName = p.name || p.full_name || 'Unknown'
      let desc = `${playerName} (${p.position})`
      if (p.stat_line) desc += ` [${p.stat_line}]`
      if (p.age) desc += ` Age ${p.age}`
      if (p.cap_hit) desc += `, ${formatMoney(p.cap_hit)} cap hit`
      if (p.contract_years) desc += `, ${p.contract_years}yr remaining`
      const tier = tierMap[playerName]
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value_score}${tier.is_untouchable ? ', UNTOUCHABLE' : ''}]`
      return desc
    }).join(', ')

    const recvDesc = safePlayers_received.map((p: any) => {
      let desc = `${p.name || p.full_name} (${p.position})`
      if (p.stat_line) desc += ` [${p.stat_line}]`
      if (p.age) desc += ` Age ${p.age}`
      if (p.cap_hit) desc += `, ${formatMoney(p.cap_hit)} cap hit`
      if (p.contract_years) desc += `, ${p.contract_years}yr remaining`
      const tier = tierMap[p.name || p.full_name]
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value_score}${tier.is_untouchable ? ', UNTOUCHABLE' : ''}]`
      return desc
    }).join(', ')

    let picksSentDesc = ''
    if (safeDraft_picks_sent.length > 0) {
      picksSentDesc = `\nDraft picks sent: ${safeDraft_picks_sent.map((p: any) => `${p.year} Round ${p.round}${p.condition ? ` (${p.condition})` : ''}`).join(', ')}`
    }
    let picksRecvDesc = ''
    if (safeDraft_picks_received.length > 0) {
      picksRecvDesc = `\nDraft picks received: ${safeDraft_picks_received.map((p: any) => `${p.year} Round ${p.round}${p.condition ? ` (${p.condition})` : ''}`).join(', ')}`
    }

    let capContext = ''
    if (chicagoCapData) {
      capContext += `\nSalary Cap Context:\n${teamDisplayNames[chicago_team]}: ${formatMoney(chicagoCapData.cap_used)} used / ${formatMoney(chicagoCapData.cap_available)} available of ${formatMoney(chicagoCapData.total_cap)} ceiling`
      if (chicagoCapData.dead_money) capContext += ` (${formatMoney(chicagoCapData.dead_money)} dead money)`
    }
    if (partnerCapData) {
      capContext += `\n${trade_partner}: ${formatMoney(partnerCapData.cap_used)} used / ${formatMoney(partnerCapData.cap_available)} available of ${formatMoney(partnerCapData.total_cap)} ceiling`
      if (partnerCapData.dead_money) capContext += ` (${formatMoney(partnerCapData.dead_money)} dead money)`
    }

    // Calculate value gap if tiers are available
    let valueContext = ''
    const hasTiers = Object.keys(tierMap).length > 0
    if (hasTiers) {
      const sentValue = safePlayers_sent.reduce((sum: number, p: any) => {
        const tier = tierMap[p.name || p.full_name]
        return sum + (tier?.trade_value_score || 0)
      }, 0)
      // Rough draft pick values
      const pickValue = (picks: any[]) => picks.reduce((sum: number, p: any) => {
        if (p.round === 1) return sum + 35
        if (p.round === 2) return sum + 18
        if (p.round === 3) return sum + 10
        return sum + 5
      }, 0)
      const sentTotal = sentValue + pickValue(safeDraft_picks_sent)

      const recvValue = safePlayers_received.reduce((sum: number, p: any) => {
        const tier = tierMap[p.name || p.full_name]
        return sum + (tier?.trade_value_score || 0)
      }, 0)
      const recvTotal = recvValue + pickValue(safeDraft_picks_received)

      const gap = recvTotal - sentTotal
      valueContext = `\n\nPlayer Value Analysis (objective tier data):
SENDING total value: ~${sentTotal}
RECEIVING total value: ~${recvTotal}
VALUE GAP: ${gap > 0 ? `Chicago receiving ${gap} points MORE (other team unlikely to accept if gap > 20)` : gap < 0 ? `Chicago sending ${Math.abs(gap)} points MORE (overpay)` : 'Even trade'}`

      // Add realism warning for large gaps
      if (gap > 30) {
        valueContext += `\n⚠ REALISM WARNING: The value gap is ${gap} points. The other team would almost certainly reject this trade. Grade should reflect this — cap at 20-25 max.`
      } else if (gap > 15) {
        valueContext += `\n⚠ CAUTION: Notable value gap of ${gap} points favoring Chicago. Other team would likely decline without sweeteners. Cap grade at 40-50.`
      }
    }

    const tradeDescription = `
Sport: ${sport.toUpperCase()}
${teamDisplayNames[chicago_team]} send: ${sentDesc}${picksSentDesc}
${trade_partner} send: ${recvDesc}${picksRecvDesc}${capContext}${valueContext}${examplesBlock}

Grade this trade from the perspective of the ${teamDisplayNames[chicago_team]}.`

    const requestPayload = { model: MODEL_NAME, system: 'GM_SYSTEM_PROMPT', tradeDescription }

    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 768,
      system: GM_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: tradeDescription }],
    })

    const responseTimeMs = Date.now() - startTime
    const textContent = response.content.find(c => c.type === 'text')
    const rawText = textContent?.type === 'text' ? textContent.text : ''

    let grade: number
    let reasoning: string
    let tradeSummary = ''
    let improvementScore = 0
    let breakdown = { talent_balance: 0.5, contract_value: 0.5, team_fit: 0.5, future_assets: 0.5 }
    let capAnalysis = ''

    try {
      const parsed = JSON.parse(rawText)
      grade = Math.max(0, Math.min(100, Math.round(parsed.grade)))
      reasoning = parsed.reasoning || 'No reasoning provided.'
      tradeSummary = parsed.trade_summary || ''
      improvementScore = typeof parsed.improvement_score === 'number' ? Math.max(-10, Math.min(10, parsed.improvement_score)) : 0
      capAnalysis = parsed.cap_analysis || ''
      if (parsed.breakdown) {
        breakdown = {
          talent_balance: Math.max(0, Math.min(1, parsed.breakdown.talent_balance ?? 0.5)),
          contract_value: Math.max(0, Math.min(1, parsed.breakdown.contract_value ?? 0.5)),
          team_fit: Math.max(0, Math.min(1, parsed.breakdown.team_fit ?? 0.5)),
          future_assets: Math.max(0, Math.min(1, parsed.breakdown.future_assets ?? 0.5)),
        }
      }
    } catch {
      const gradeMatch = rawText.match(/(\d{1,3})/)
      grade = gradeMatch ? Math.max(0, Math.min(100, parseInt(gradeMatch[1]))) : 50
      reasoning = rawText || 'AI response could not be parsed.'
    }

    const status = grade >= 70 ? 'accepted' : 'rejected'
    const is_dangerous = grade >= 70 && grade <= 90
    const userEmail = user?.email || 'guest'
    const sharedCode = randomBytes(6).toString('hex')

    let partnerTeamLogo: string | null = null
    let chicagoTeamLogo: string | null = null
    if (partner_team_key) {
      const { data: pt } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', partner_team_key)
        .eq('sport', sport)
        .single()
      partnerTeamLogo = pt?.logo_url || null
    }
    const { data: ct } = await datalabAdmin
      .from('gm_league_teams')
      .select('logo_url')
      .eq('team_key', chicago_team)
      .eq('sport', sport)
      .single()
    chicagoTeamLogo = ct?.logo_url || null

    const { data: trade, error: tradeError } = await datalabAdmin.from('gm_trades').insert({
      user_id: userId,
      user_email: userEmail,
      chicago_team,
      sport,
      trade_partner,
      players_sent: safePlayers_sent,
      players_received: safePlayers_received,
      grade,
      grade_reasoning: reasoning,
      status,
      is_dangerous,
      session_id: session_id || null,
      improvement_score: improvementScore,
      trade_summary: tradeSummary,
      ai_version: `gm_${MODEL_NAME}`,
      shared_code: sharedCode,
      partner_team_key: partner_team_key || null,
      partner_team_logo: partnerTeamLogo,
      chicago_team_logo: chicagoTeamLogo,
      draft_picks_sent: safeDraft_picks_sent,
      draft_picks_received: safeDraft_picks_received,
      talent_balance: breakdown.talent_balance,
      contract_value: breakdown.contract_value,
      team_fit: breakdown.team_fit,
      future_assets: breakdown.future_assets,
    }).select().single()

    if (tradeError) throw tradeError

    const tradeItems: any[] = []
    for (const p of safePlayers_sent) {
      tradeItems.push({
        trade_id: trade.id,
        side: 'sent',
        asset_type: 'player',
        player_name: p.name,
        position: p.position,
        jersey_number: p.jersey_number || null,
        headshot_url: p.headshot_url || null,
        age: p.age || null,
        college: p.college || null,
        weight_lbs: p.weight_lbs || null,
        years_exp: p.years_exp || null,
        draft_info: p.draft_info || null,
        stat_line: p.stats || null,
        team_key: chicago_team,
        is_chicago_player: true,
        espn_player_id: p.espn_id || null,
      })
    }
    for (const p of safePlayers_received) {
      tradeItems.push({
        trade_id: trade.id,
        side: 'received',
        asset_type: 'player',
        player_name: p.name,
        position: p.position,
        team_key: partner_team_key || trade_partner,
        is_chicago_player: false,
      })
    }
    if (safeDraft_picks_sent.length > 0) {
      for (const pk of safeDraft_picks_sent) {
        tradeItems.push({
          trade_id: trade.id, side: 'sent', asset_type: 'pick',
          pick_year: pk.year, pick_round: pk.round, pick_condition: pk.condition || null,
          team_key: chicago_team, is_chicago_player: true,
        })
      }
    }
    if (safeDraft_picks_received.length > 0) {
      for (const pk of safeDraft_picks_received) {
        tradeItems.push({
          trade_id: trade.id, side: 'received', asset_type: 'pick',
          pick_year: pk.year, pick_round: pk.round, pick_condition: pk.condition || null,
          team_key: partner_team_key || trade_partner, is_chicago_player: false,
        })
      }
    }
    if (tradeItems.length > 0) {
      await datalabAdmin.from('gm_trade_items').insert(tradeItems)
    }

    await datalabAdmin.from('gm_audit_logs').insert({
      user_id: userId,
      trade_id: trade.id,
      request_payload: requestPayload,
      response_payload: { rawText, grade, reasoning, tradeSummary, improvementScore, breakdown, capAnalysis },
      model_name: MODEL_NAME,
      response_time_ms: responseTimeMs,
    })

    // Only update leaderboard for logged-in users
    if (!isGuest) {
    const { data: existing } = await datalabAdmin.from('gm_leaderboard').select('*').eq('user_id', userId).single()

    if (existing) {
      const newAccepted = (existing.accepted_count || 0) + (status === 'accepted' ? 1 : 0)
      const newRejected = (existing.rejected_count || 0) + (status === 'rejected' ? 1 : 0)
      const newDangerous = (existing.dangerous_count || 0) + (is_dangerous ? 1 : 0)
      const newTotalScore = status === 'accepted' ? (existing.total_score || 0) + grade : (existing.total_score || 0)
      const newTradesCount = (existing.trades_count || 0) + (status === 'accepted' ? 1 : 0)
      const newImprovement = (existing.total_improvement || 0) + (status === 'accepted' ? improvementScore : 0)
      const newBest = Math.max(existing.best_grade || 0, grade)
      const newWorst = Math.min(existing.worst_grade ?? 100, grade)
      const newAvg = newTradesCount > 0 ? Math.round((newTotalScore / newTradesCount) * 100) / 100 : 0

      let streak = existing.streak || 0
      if (status === 'accepted') streak += 1
      else streak = 0

      await datalabAdmin.from('gm_leaderboard').update({
        display_name: displayName,
        total_score: newTotalScore,
        trades_count: newTradesCount,
        avg_grade: newAvg,
        best_trade_id: grade > (existing.best_grade || 0) ? trade.id : existing.best_trade_id,
        total_improvement: newImprovement,
        best_grade: newBest,
        worst_grade: newWorst,
        accepted_count: newAccepted,
        rejected_count: newRejected,
        dangerous_count: newDangerous,
        favorite_team: chicago_team,
        streak,
        active_session_id: session_id || existing.active_session_id,
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId)
    } else {
      await datalabAdmin.from('gm_leaderboard').insert({
        user_id: userId,
        user_email: userEmail,
        display_name: displayName,
        total_score: status === 'accepted' ? grade : 0,
        trades_count: status === 'accepted' ? 1 : 0,
        avg_grade: status === 'accepted' ? grade : 0,
        best_trade_id: trade.id,
        total_improvement: status === 'accepted' ? improvementScore : 0,
        best_grade: grade,
        worst_grade: grade,
        accepted_count: status === 'accepted' ? 1 : 0,
        rejected_count: status === 'rejected' ? 1 : 0,
        dangerous_count: is_dangerous ? 1 : 0,
        favorite_team: chicago_team,
        streak: status === 'accepted' ? 1 : 0,
        active_session_id: session_id || null,
        updated_at: new Date().toISOString(),
      })
    }
    } // end if (!isGuest) for leaderboard

    if (session_id) {
      const { data: sess } = await datalabAdmin.from('gm_sessions').select('*').eq('id', session_id).single()
      if (sess) {
        await datalabAdmin.from('gm_sessions').update({
          num_trades: (sess.num_trades || 0) + 1,
          num_approved: (sess.num_approved || 0) + (status === 'accepted' ? 1 : 0),
          num_dangerous: (sess.num_dangerous || 0) + (is_dangerous ? 1 : 0),
          num_failed: (sess.num_failed || 0) + (status === 'rejected' ? 1 : 0),
          total_improvement: +(((sess.total_improvement || 0) + (status === 'accepted' ? improvementScore : 0)).toFixed(2)),
          updated_at: new Date().toISOString(),
        }).eq('id', session_id)
      }
    }

    return NextResponse.json({
      grade,
      reasoning,
      status,
      is_dangerous,
      trade_id: trade.id,
      shared_code: sharedCode,
      trade_summary: tradeSummary,
      improvement_score: improvementScore,
      breakdown,
      cap_analysis: capAnalysis,
    })

  } catch (error) {
    console.error('GM grade error:', error)

    try {
      const user = await getGMAuthUser(request)
      await datalabAdmin.from('gm_errors').insert({
        user_id: user?.id,
        error_type: 'ai',
        error_message: String(error),
        request_payload: null,
      })
    } catch {}

    return NextResponse.json({ error: 'Failed to grade trade' }, { status: 500 })
  }
}
