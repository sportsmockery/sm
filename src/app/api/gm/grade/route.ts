import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getGMAuthUser } from '@/lib/gm-auth'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'

// Version marker for debugging
const API_VERSION = 'v3.0.0-ai-authority'

// Supabase Edge Function URL for deterministic grading
const EDGE_FUNCTION_URL = 'https://siwoqfzzcxmngnseyzpv.supabase.co/functions/v1/grade-trade'

function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
}

// Call the Supabase Edge Function to get deterministic grade
async function getDeterministicGrade(payload: {
  chicago_team: string
  sport: string
  players_sent: any[]
  players_received: any[]
  draft_picks_sent?: any[]
  draft_picks_received?: any[]
}): Promise<{ grade: number; breakdown: any; debug?: any } | null> {
  try {
    // Edge Function is on DATALAB project, use DATALAB anon key
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DATALAB_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      console.error('Edge function error:', response.status, await response.text())
      return null
    }

    const result = await response.json()
    if (result.grade !== undefined) {
      return {
        grade: result.grade,
        breakdown: result.breakdown,
        debug: result.debug,
      }
    }
    return null
  } catch (error) {
    console.error('Edge function call failed:', error)
    return null
  }
}

const TEAM_SPORT_MAP: Record<string, string> = {
  bears: 'nfl', bulls: 'nba', blackhawks: 'nhl', cubs: 'mlb', whitesox: 'mlb',
}

// Fetch data freshness for a team
async function getDataFreshness(teamKey: string, sport: string): Promise<{
  roster_updated_at: string
  stats_updated_at: string
  contracts_updated_at: string
  age_hours: number
  is_stale: boolean
  warning?: string
} | null> {
  try {
    // Try to fetch from gm_data_freshness table if it exists
    const { data: freshness } = await datalabAdmin
      .from('gm_data_freshness')
      .select('*')
      .eq('team_key', teamKey)
      .eq('sport', sport)
      .single()

    if (freshness) {
      return {
        roster_updated_at: freshness.roster_updated_at,
        stats_updated_at: freshness.stats_updated_at,
        contracts_updated_at: freshness.contracts_updated_at || freshness.stats_updated_at,
        age_hours: freshness.age_hours || 0,
        is_stale: freshness.is_stale || false,
        warning: freshness.warning || undefined,
      }
    }

    // Fallback: calculate from team-specific tables
    const now = new Date()
    const playerTable = `${teamKey}_players`

    // Get most recent player update
    const { data: recentPlayer } = await datalabAdmin
      .from(playerTable)
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const rosterUpdatedAt = recentPlayer?.updated_at || now.toISOString()
    const ageHours = (now.getTime() - new Date(rosterUpdatedAt).getTime()) / (1000 * 60 * 60)
    const isStale = ageHours > 24

    return {
      roster_updated_at: rosterUpdatedAt,
      stats_updated_at: rosterUpdatedAt,
      contracts_updated_at: rosterUpdatedAt,
      age_hours: Math.round(ageHours * 10) / 10,
      is_stale: isStale,
      warning: isStale ? 'Data may be outdated. Roster information could be up to 24+ hours old.' : undefined,
    }
  } catch (e) {
    console.error('Failed to fetch data freshness:', e)
    return null
  }
}

// ============================================================================
// TEAM CONTEXT - Competitive window, needs, cap situation
// ============================================================================

interface TeamContext {
  team_key: string
  sport: string
  team_phase: string  // rebuilding, retooling, competing, contending, championship_window
  positional_needs: string[]
  salary_cap_situation: string
  notes?: string
}

async function getTeamContext(teamKey: string, sport: string): Promise<TeamContext | null> {
  try {
    const { data, error } = await datalabAdmin
      .from('gm_team_context')
      .select('team_key, sport, team_phase, positional_needs, salary_cap_situation, notes')
      .eq('team_key', teamKey)
      .eq('sport', sport)
      .single()

    if (error || !data) {
      console.log(`No team context found for ${teamKey}/${sport}`)
      return null
    }

    return {
      team_key: data.team_key,
      sport: data.sport,
      team_phase: data.team_phase,
      positional_needs: Array.isArray(data.positional_needs) ? data.positional_needs : [],
      salary_cap_situation: data.salary_cap_situation || '',
      notes: data.notes || undefined,
    }
  } catch (e) {
    console.error('Failed to fetch team context:', e)
    return null
  }
}

function formatTeamContextForPrompt(context: TeamContext | null, teamName: string): string {
  if (!context) {
    return `${teamName}: No context data available`
  }

  const phaseDescriptions: Record<string, string> = {
    'rebuilding': 'Full REBUILD mode - prioritizing young talent and draft picks over win-now moves',
    'retooling': 'RETOOLING - making targeted changes while maintaining competitive core',
    'competing': 'COMPETING for playoffs - willing to make moves to solidify roster',
    'contending': 'CONTENDING for championship - aggressive buyer mentality',
    'championship_window': 'ALL-IN championship window - willing to sacrifice future for present',
  }

  const lines = [
    `## ${teamName} Team Context`,
    `- Competitive Phase: ${phaseDescriptions[context.team_phase] || context.team_phase}`,
    `- Cap Situation: ${context.salary_cap_situation}`,
    `- Positions of Need: ${context.positional_needs.length > 0 ? context.positional_needs.join(', ') : 'None identified'}`,
  ]

  if (context.notes) {
    lines.push(`- Key Notes: ${context.notes}`)
  }

  return lines.join('\n')
}

// ============================================================================
// SIMILAR TRADE LOOKUP FOR CALIBRATION
// ============================================================================

interface SimilarTrade {
  id: string
  trade_summary: string
  grade: number
  status: string
  positions_sent: string[]
  positions_received: string[]
  picks_sent: number
  picks_received: number
  created_at: string
  similarity_score: number
}

/**
 * Find structurally similar trades from history for calibration.
 * Similarity is based on:
 * - Same sport (required)
 * - Similar player count on each side
 * - Similar position types involved
 * - Similar draft pick involvement
 */
async function findSimilarTrades(
  sport: string,
  chicagoTeam: string,
  playersSent: any[],
  playersReceived: any[],
  picksSent: any[],
  picksReceived: any[],
  limit: number = 3
): Promise<SimilarTrade[]> {
  try {
    // Extract positions from current trade
    const sentPositions = playersSent.map(p => p.position).filter(Boolean)
    const recvPositions = playersReceived.map(p => p.position).filter(Boolean)
    const sentPlayerCount = playersSent.length
    const recvPlayerCount = playersReceived.length
    const sentPickCount = picksSent.length
    const recvPickCount = picksReceived.length

    // Determine trade structure type
    const tradeType =
      sentPlayerCount > 0 && recvPlayerCount > 0 && sentPickCount === 0 && recvPickCount === 0 ? 'player_for_player' :
      sentPlayerCount > 0 && recvPickCount > 0 && recvPlayerCount === 0 ? 'player_for_picks' :
      sentPickCount > 0 && recvPlayerCount > 0 && sentPlayerCount === 0 ? 'picks_for_player' :
      'mixed'

    // Query recent trades from same sport
    const { data: trades, error } = await datalabAdmin
      .from('gm_trades')
      .select(`
        id, grade, status, trade_summary, created_at,
        players_sent, players_received, draft_picks_sent, draft_picks_received
      `)
      .eq('chicago_team', chicagoTeam)
      .not('grade', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200) // Get recent trades to search through

    if (error || !trades) {
      console.error('Failed to fetch similar trades:', error)
      return []
    }

    // Score each trade for similarity
    const scoredTrades = trades.map(trade => {
      const tradeSentPlayers = Array.isArray(trade.players_sent) ? trade.players_sent : []
      const tradeRecvPlayers = Array.isArray(trade.players_received) ? trade.players_received : []
      const tradeSentPicks = Array.isArray(trade.draft_picks_sent) ? trade.draft_picks_sent : []
      const tradeRecvPicks = Array.isArray(trade.draft_picks_received) ? trade.draft_picks_received : []

      const tradeSentPositions = tradeSentPlayers.map((p: any) => p.position).filter(Boolean)
      const tradeRecvPositions = tradeRecvPlayers.map((p: any) => p.position).filter(Boolean)

      let score = 0

      // Player count similarity (up to 30 points)
      const sentDiff = Math.abs(tradeSentPlayers.length - sentPlayerCount)
      const recvDiff = Math.abs(tradeRecvPlayers.length - recvPlayerCount)
      score += Math.max(0, 15 - sentDiff * 5)
      score += Math.max(0, 15 - recvDiff * 5)

      // Pick count similarity (up to 20 points)
      const sentPickDiff = Math.abs(tradeSentPicks.length - sentPickCount)
      const recvPickDiff = Math.abs(tradeRecvPicks.length - recvPickCount)
      score += Math.max(0, 10 - sentPickDiff * 3)
      score += Math.max(0, 10 - recvPickDiff * 3)

      // Position overlap (up to 30 points)
      const sentPosOverlap = sentPositions.filter(p => tradeSentPositions.includes(p)).length
      const recvPosOverlap = recvPositions.filter(p => tradeRecvPositions.includes(p)).length
      score += sentPosOverlap * 10
      score += recvPosOverlap * 10

      // Trade type match bonus (20 points)
      const thisTradeType =
        tradeSentPlayers.length > 0 && tradeRecvPlayers.length > 0 && tradeSentPicks.length === 0 && tradeRecvPicks.length === 0 ? 'player_for_player' :
        tradeSentPlayers.length > 0 && tradeRecvPicks.length > 0 && tradeRecvPlayers.length === 0 ? 'player_for_picks' :
        tradeSentPicks.length > 0 && tradeRecvPlayers.length > 0 && tradeSentPlayers.length === 0 ? 'picks_for_player' :
        'mixed'

      if (thisTradeType === tradeType) {
        score += 20
      }

      return {
        id: trade.id,
        trade_summary: trade.trade_summary || 'No summary',
        grade: trade.grade,
        status: trade.status,
        positions_sent: tradeSentPositions,
        positions_received: tradeRecvPositions,
        picks_sent: tradeSentPicks.length,
        picks_received: tradeRecvPicks.length,
        created_at: trade.created_at,
        similarity_score: score,
      }
    })

    // Sort by similarity and return top matches
    return scoredTrades
      .filter(t => t.similarity_score > 20) // Minimum threshold
      .sort((a, b) => b.similarity_score - a.similarity_score)
      .slice(0, limit)
  } catch (e) {
    console.error('Error finding similar trades:', e)
    return []
  }
}

function formatSimilarTradesForPrompt(similarTrades: SimilarTrade[]): string {
  if (similarTrades.length === 0) {
    return 'No structurally similar trades found in recent history.'
  }

  const avgGrade = Math.round(similarTrades.reduce((sum, t) => sum + t.grade, 0) / similarTrades.length)
  const grades = similarTrades.map(t => t.grade)
  const minGrade = Math.min(...grades)
  const maxGrade = Math.max(...grades)

  let block = `## HISTORICAL CALIBRATION (${similarTrades.length} similar trades found)
**Consensus grade range:** ${minGrade}-${maxGrade} (avg: ${avgGrade})
**CRITICAL:** If your grade differs by >15 points from this range, you MUST explain why.

Similar trades from history:`

  for (const trade of similarTrades) {
    block += `
- Grade ${trade.grade} (${trade.status}): ${trade.trade_summary.substring(0, 100)}${trade.trade_summary.length > 100 ? '...' : ''}
  Structure: ${trade.positions_sent.length > 0 ? trade.positions_sent.join('/') : 'picks'} → ${trade.positions_received.length > 0 ? trade.positions_received.join('/') : 'picks'}
  Similarity: ${trade.similarity_score}%`
  }

  return block
}

// ============================================================================
// REAL HISTORICAL TRADE COMPARISONS (for citation accuracy)
// ============================================================================

interface HistoricalTradeReference {
  headline_player: string
  trade_date: string
  team_a: string
  team_b: string
  consensus_grade: number
  winner: string
  trade_type: string
  value_tier: string
}

/**
 * Fetch verified historical trades for a sport to provide context.
 * These are real trades with known consensus grades.
 */
async function getHistoricalTradeReferences(
  sport: string,
  positionFocus?: string,
  limit: number = 5
): Promise<HistoricalTradeReference[]> {
  try {
    let query = datalabAdmin
      .from('gm_historical_trades')
      .select('headline_player, trade_date, team_a, team_b, consensus_grade, winner, trade_type, value_tier')
      .eq('sport', sport)
      .eq('verified', true)
      .not('consensus_grade', 'is', null)
      .order('trade_date', { ascending: false })

    if (positionFocus) {
      query = query.eq('position_focus', positionFocus)
    }

    const { data, error } = await query.limit(limit)

    if (error || !data) {
      console.error('Failed to fetch historical trades:', error)
      return []
    }

    return data.map(t => ({
      headline_player: t.headline_player,
      trade_date: t.trade_date,
      team_a: t.team_a,
      team_b: t.team_b,
      consensus_grade: t.consensus_grade,
      winner: t.winner,
      trade_type: t.trade_type,
      value_tier: t.value_tier,
    }))
  } catch (e) {
    console.error('Error fetching historical trades:', e)
    return []
  }
}

function formatHistoricalReferencesForPrompt(trades: HistoricalTradeReference[]): string {
  if (trades.length === 0) {
    return ''
  }

  let block = `\n## REAL TRADE REFERENCES (use these consensus grades when citing):`

  for (const t of trades) {
    const winnerText = t.winner === 'team_a' ? t.team_a : t.winner === 'team_b' ? t.team_b : 'neither'
    block += `
- **${t.headline_player}** (${t.trade_date}): ${t.team_a} ↔ ${t.team_b}
  Consensus: ${t.consensus_grade} | Winner: ${winnerText} | Type: ${t.trade_type} | Value: ${t.value_tier}`
  }

  block += `
**When citing any of these trades, your analysis MUST match the consensus grade above.**`

  return block
}

const MODEL_NAME = 'claude-opus-4-5-20251101'

// ============================================================================
// CONFIDENCE-BASED AUTHORITY ROUTING
// ============================================================================

interface DataConfidenceResult {
  confidence: number
  adjustmentRange: number
  sentSideAnalysis: {
    hasTierData: boolean
    hasSalaryData: boolean
    hasStatsData: boolean
    playerCount: number
    playersWithTiers: number
  }
  receivedSideAnalysis: {
    hasTierData: boolean
    hasSalaryData: boolean
    hasStatsData: boolean
    playerCount: number
    playersWithTiers: number
  }
  confidenceReason: string
}

/**
 * Calculate data confidence based on available tier, salary, and performance data.
 *
 * Confidence levels:
 * - 0.9: Both sides have tier data + salary + performance stats
 * - 0.7: One side missing salary OR stats
 * - 0.5: One side missing tier data entirely
 * - 0.3: Major gaps on both sides
 *
 * AI adjustment range = Math.round((1 - confidence) * 60)
 */
function calculateDataConfidence(
  playersSent: any[],
  playersReceived: any[],
  tierMap: Record<string, { tier: number; tier_label: string; trade_value: number }>
): DataConfidenceResult {
  // Analyze sent side
  const sentCount = playersSent.length
  const sentWithTiers = playersSent.filter(p => {
    const name = p.name || p.full_name
    return name && tierMap[name]
  }).length
  const sentWithSalary = playersSent.filter(p => p.cap_hit || p.salary || p.base_salary).length
  const sentWithStats = playersSent.filter(p => p.stat_line || p.stats || p.performance_stats).length

  const sentHasTiers = sentCount === 0 || (sentWithTiers / sentCount) >= 0.5
  const sentHasSalary = sentCount === 0 || (sentWithSalary / sentCount) >= 0.5
  const sentHasStats = sentCount === 0 || (sentWithStats / sentCount) >= 0.3

  // Analyze received side
  const recvCount = playersReceived.length
  const recvWithTiers = playersReceived.filter(p => {
    const name = p.name || p.full_name
    return name && tierMap[name]
  }).length
  const recvWithSalary = playersReceived.filter(p => p.cap_hit || p.salary || p.base_salary).length
  const recvWithStats = playersReceived.filter(p => p.stat_line || p.stats || p.performance_stats).length

  const recvHasTiers = recvCount === 0 || (recvWithTiers / recvCount) >= 0.5
  const recvHasSalary = recvCount === 0 || (recvWithSalary / recvCount) >= 0.5
  const recvHasStats = recvCount === 0 || (recvWithStats / recvCount) >= 0.3

  // Calculate confidence level
  let confidence: number
  let confidenceReason: string

  const sentComplete = sentHasTiers && sentHasSalary && sentHasStats
  const recvComplete = recvHasTiers && recvHasSalary && recvHasStats
  const sentHasBasics = sentHasTiers && (sentHasSalary || sentHasStats)
  const recvHasBasics = recvHasTiers && (recvHasSalary || recvHasStats)

  if (sentComplete && recvComplete) {
    confidence = 0.9
    confidenceReason = 'Full data on both sides (tiers + salary + stats)'
  } else if ((sentComplete && recvHasBasics) || (recvComplete && sentHasBasics)) {
    confidence = 0.7
    confidenceReason = 'One side missing salary OR stats'
  } else if (!sentHasTiers || !recvHasTiers) {
    if (!sentHasTiers && !recvHasTiers) {
      confidence = 0.3
      confidenceReason = 'Both sides missing tier data - major gaps'
    } else {
      confidence = 0.5
      confidenceReason = 'One side missing tier data entirely'
    }
  } else if (!sentHasBasics && !recvHasBasics) {
    confidence = 0.3
    confidenceReason = 'Major data gaps on both sides'
  } else {
    confidence = 0.5
    confidenceReason = 'Partial data available'
  }

  // AI adjustment range = (1 - confidence) * 60
  const adjustmentRange = Math.round((1 - confidence) * 60)

  return {
    confidence,
    adjustmentRange,
    sentSideAnalysis: {
      hasTierData: sentHasTiers,
      hasSalaryData: sentHasSalary,
      hasStatsData: sentHasStats,
      playerCount: sentCount,
      playersWithTiers: sentWithTiers,
    },
    receivedSideAnalysis: {
      hasTierData: recvHasTiers,
      hasSalaryData: recvHasSalary,
      hasStatsData: recvHasStats,
      playerCount: recvCount,
      playersWithTiers: recvWithTiers,
    },
    confidenceReason,
  }
}

// ============================================================================
// CAP RELIEF VALUE CALCULATION (Instruction 1)
// ============================================================================

interface CapReliefResult {
  bonus: number
  explanation: string
  savingsInMillions: number
}

function calculateCapReliefBonus(
  playersSent: any[],
  playersReceived: any[],
  chicagoContext: TeamContext | null
): CapReliefResult {
  const sentSalary = playersSent.reduce((sum, p) => sum + (p.cap_hit || p.salary || p.base_salary || 0), 0)
  const receivedSalary = playersReceived.reduce((sum, p) => sum + (p.cap_hit || p.salary || p.base_salary || 0), 0)
  const capSavings = sentSalary - receivedSalary

  if (capSavings <= 0) {
    return { bonus: 0, explanation: 'No cap savings in this trade.', savingsInMillions: 0 }
  }

  let bonus = 0
  const savingsInMillions = capSavings / 1_000_000

  if (savingsInMillions >= 5) {
    bonus = Math.min(Math.round(savingsInMillions), 15)

    // Boost if team is contending (needs cap space to fill holes)
    if (chicagoContext?.team_phase === 'contending' || chicagoContext?.team_phase === 'championship_window') {
      bonus = Math.round(bonus * 1.25)
    }

    // Boost if the position being sent is NOT a position of need
    const sentPositions = playersSent.map(p => p.position)
    const needs = chicagoContext?.positional_needs || []
    const sendingSurplus = sentPositions.length > 0 && sentPositions.every(pos => !needs.includes(pos))
    if (sendingSurplus) {
      bonus = Math.round(bonus * 1.15)
    }

    bonus = Math.min(bonus, 18) // hard cap at 18
  }

  return {
    bonus,
    explanation: `Chicago saves $${savingsInMillions.toFixed(1)}M in cap space. Cap relief bonus: +${bonus} points.`,
    savingsInMillions,
  }
}

const GM_SYSTEM_PROMPT = `You are GM, the FINAL AUTHORITY on trade grades. You receive a deterministic_baseline calculated from raw player trade values. This baseline is advisory context — YOU decide the final grade.

## YOUR AUTHORITY AS GM

You MUST evaluate these contextual factors that the formula cannot capture:

1. **Team competitive window** (rebuilding, contending, transitioning)
   - Rebuilding teams SHOULD trade veterans for picks/prospects — this is GOOD, not bad
   - Contending teams may overpay for win-now talent — this can be justified
   - A trade that looks "bad" on paper may be strategically correct for the team's phase

2. **Positional need** (does the receiving team need this position?)
   - Trading from depth to address weakness = smart roster management
   - Acquiring a position you desperately need is worth a premium

3. **Contract context** (is the team shedding salary to address other weaknesses?)
   - Salary dumps are a VALID reason to trade good players
   - Teams often trade talent to create cap flexibility for free agency
   - Never assume salary moves are bad — they enable other moves

4. **Draft pick value varies by sport:**
   - NFL/NBA 1sts are worth FAR more than NHL/MLB 1sts
   - An NFL 1st from a bad team can be worth a star player alone
   - NHL/MLB picks outside round 1 have minimal value

5. **MLB prospect value:**
   - Top-100 prospects have significant standalone value
   - A top-10 prospect can anchor a deal for an All-Star
   - Pre-arb control (6 years) is extremely valuable

6. **CRITICAL — Simulator Limitations:**
   - The user's simulator does not allow salary cuts or cap moves
   - NEVER penalize a trade solely because it creates cap issues
   - Assume the team will make corresponding roster moves
   - Focus on talent exchange, not cap arithmetic

## DETERMINISTIC BASELINE (TASK 1 - CRITICAL)
The deterministic baseline is a mathematical estimate only. It is passed to you as ONE INPUT alongside player data, team context, similar trades, and historical references. You produce the FINAL grade based on all context provided. Your grade IS the grade returned to the user — not the deterministic grade.

If the deterministic baseline feels wrong given context, override it with full reasoning.

## ANTI-CLUSTERING RULES (TASK 3 - CRITICAL)
Your grades must show natural variance like a real analyst panel. NEVER output the same grade for consecutive trades. If you notice yourself defaulting to round numbers (25, 35, 50, 70, 75), add ±1-4 points of intentional variance. A 73 and a 76 are both reasonable for similar trades. Track this internally — no two grades in a session should be identical unless the trades are nearly identical.

## GRADING ANCHORS — Reference Points (not constraints)

- **Equal value trade (within 10% difference):** Grade **70-78**. Both teams fill a need.
- **Chicago gains 10-25% more value:** Grade **78-88**. Good deal for Chicago.
- **Chicago gains 25%+ more value:** Grade **88-95**. Great deal for Chicago.
- **Chicago loses 10-25% value:** Grade **55-68**. Overpay, but may be justified.
- **Chicago loses 25%+ value:** Grade **30-50**. Bad deal unless extraordinary circumstances.

**CONTEXT RULES:**
- A **lateral move between similar players is NOT a bad trade**. Teams make lateral trades for chemistry, scheme fit, timeline, or locker room reasons. Grade these **70-75**.
- Do **NOT** penalize a trade just because Chicago doesn't clearly "win." Fair trades are normal.
- Division rival trades may warrant a small penalty (-3 to -5), but not -15.

## Grading Criteria (weighted)
1. **Value Balance (30%)**: Comparable talent, production, and contract value on both sides.
2. **Realism (25%)**: Would the other GM accept? Both sides must have a reason to agree.
3. **Team Needs (15%)**: Does this fill a real gap for the Chicago team? Trading from depth = good.
4. **Player Caliber (10%)**: Stats, awards, trajectory, usage, advanced metrics.
5. **Contract/Cap (15%)**: Salary cap implications. NFL ~$301.2M, NBA ~$154.6M, NHL ~$95.5M, MLB CBT ~$244M.
6. **Age/Future (5%)**: Under 27 = ascending. Over 32 = declining. Rookie deals = premium.

## Grading Scale
- 90-100: Elite, franchise-altering (extremely rare)
- 78-89: Good to great for Chicago — clear win
- 70-77: Fair trade, both sides benefit — ACCEPTED
- 55-69: Close but flawed — minor value loss or concerns — REJECTED
- 30-54: Bad — significant value loss
- 0-29: Catastrophic — untouchable traded or absurd value gap

## Sport-Specific Rules

### NFL (Bears)
- Position value: QB > Edge > LT > CB > WR > IDL > LB > RB (RBs are nearly worthless in trade value)
- Trading a 1st for an RB = grade 15-30. Trading franchise QB = grade 0-10.
- Bears are CONTENDING (12-7 in 2025) with championship window OPEN. Caleb Williams is UNTOUCHABLE (grade 0 if sent).
- 2026 moves: Joe Thuney (4th), Jonah Jackson (6th) - OL upgraded. TOP NEED: EDGE pass rush.
- DJ Moore is a TRADE CANDIDATE ($28M cap hit, only 682 yards in 2025).
- Division trades (Packers/Vikings/Lions) cost a 5-10 point penalty.
- Draft pick value: 1st overall ~3000, late 1st ~800-1200, 2nd ~400-700, 3rd+ minimal.

### NBA (Bulls)
- Position value: Two-way wing > Lead creator > Stretch big > 3&D > Traditional center
- Salary matching is MANDATORY for over-the-cap teams (125% + $100K rule).
- Rookie-scale deals are the most valuable contracts. Supermax = hardest to trade.
- Bulls are in FULL REBUILD after 7+ trades at Feb 2026 deadline. Traded Vucevic, Coby White, Dosunmu, Lonzo Ball.
- New young core: Jaden Ivey, Anfernee Simons, Rob Dillingham, Isaac Okoro, Collin Sexton.
- Have 7 1st-round picks over 6 drafts + 14+ 2nd-rounders. Grade as REBUILD team: young players + picks = GOOD, expensive vets = BAD.
- Can't trade consecutive future 1sts (Stepien Rule). No-trade clauses exist.
- 2nd apron teams have severe aggregation restrictions.

### NHL (Blackhawks)
- Position value: #1 Center > Top-pair D > Elite winger > Starting goalie > depth
- Retained salary (up to 50%) is a major trade mechanic. **Blackhawks may have 0 retention slots available** (Jones, Rantanen, McCabe deals used them). If trade requires retention and no slots: grade 0 with explanation.
- Blackhawks are REBUILDING around Connor Bedard. Bedard is UNTOUCHABLE (grade 0 if sent).
- Likely SELLERS at March 6 deadline. Pending UFAs to trade: Connor Murphy, Ilya Mikheyev, Jason Dickinson, Matt Grzelcyk, Nick Foligno.
- 2026 dual deadline: Feb 4 freeze + March 6 deadline. NTC/NMC checking required.
- Selling veterans for picks/prospects = good. Acquiring expensive vets = bad.
- Rental trades at deadline are common — UFAs have less value than controlled players.

**NHL PROSPECT TIERS (Blackhawks):**
- **Elite/Untouchable prospects** (grade 15-30 if traded without superstar return): Frank Nazar, Kevin Korchinski, Artyom Levshunov
- **High-end prospects** (grade penalty if traded for depth): Oliver Moore, Nick Lardis
- **Very good prospects**: tradeable for significant returns
- Prospect tier names: Elite → High-End → Very Good → Good → Average → Below Average → Organizational
- NHL prospects have ETA (expected arrival year) and contract status (ELC = Entry-Level Contract)
- Always consider prospect tier when evaluating trades — Elite prospects are worth more than mid-round picks

### MLB (Cubs & White Sox)
- Position value: Ace SP > SS/CF/C > Elite hitter > Setup/Closer > Corner positions > DH
- Prospect packages are the PRIMARY trade currency. MLB prospects matter more than any other sport.
- Years of team control dramatically affect value — 3 years of control >> rental.
- Service time impact on value: pre-arb years = most valuable. Option years must be factored.
- Qualifying offer opportunity cost: QO-attached free agents require draft pick compensation.
- Cubs (92-70) are CONTENDING — aggressive buyer. TOP NEEDS: SP (rotation depth), RP. Trading top prospects for proven talent = acceptable.
- White Sox (60-102) are in HISTORIC REBUILD — selling everything. Luis Robert Jr. is #1 trade chip ($20M option 2027). Any return of future assets is acceptable.
- **Salary Retention**: Sending team can retain 0-50% of a player's salary. Factor this into contract value — a $30M player with 50% retained is effectively a $15M acquisition. Retention makes expensive players more tradeable and increases realistic value.
- **Cash Considerations**: CBA limits direct cash to $100,000 max. Minor value in modern trades, typically a sweetener.
- When retention is included, note the NET salary impact for Chicago in cap_analysis.

## CHICAGO TEAM STRATEGY KNOWLEDGE (CRITICAL — APPLY TO EVERY TRADE)

**BEARS:** Caleb Williams is untouchable. 2025 playoffs proved the offensive core works.
DJ Moore ($20M+) is expendable — Luther Burden III and Rome Odunze can replace his production for a fraction of the cost. D'Andre Swift is tradeable. Montez Sweat has value.
PRIORITY: Any trade that sends a WR/RB and returns a DE, S, LT, or CB + cap relief is a SMART move. Grade it favorably.
The Bears do NOT need more receivers. They desperately need pass rush and secondary help.

**BULLS:** Full rebuild as of Feb 2026 deadline. Traded Vucevic, Coby White, Dosunmu, Terry, Huerter, Phillips for youth + 9 second-round picks. Building around Giddey, Buzelis, Simons, Ivey, Dillingham.
PRIORITY: ANY trade sending a remaining veteran for picks or young players aligns with front office strategy. Grade 72+ unless the return is genuinely terrible. Buzelis and the young core are the only untouchables.

**BLACKHAWKS:** Deep rebuild, youngest team in NHL. Bedard and Levshunov are untouchable. Everyone else is a trade chip.
PRIORITY: Trading veterans for picks and prospects is the CORRECT strategy. A veteran rental for a 2nd-round pick = smart asset management, not a bad trade. Grade 72+.

**CUBS:** Competitive window is NOW. One game from NLCS in 2025. Surplus in OF (Alcantara out of options). Need SP and RP badly.
PRIORITY: Trading surplus OF prospects for starting pitching is exactly what a contender should do. Grade favorably.

**WHITE SOX:** Total teardown rebuild. Historic 2024 losses. Everyone is available except top prospects (Hagen Smith, Billy Carlson, Tanner McDougal).
PRIORITY: Any trade accumulating prospects or draft picks for veterans = on-strategy. Grade 72+ unless return is genuinely bad.

**GENERAL RULE:** Users of this simulator are Chicago fans. When a trade is borderline (could go 65-75), lean toward acceptance. Chicago fans want to explore possibilities, not get rejected on every attempt. A 71 acceptance is better for the product than a 68 rejection for a reasonable trade.

## Untouchable Players
- Bears: Caleb Williams (franchise QB on rookie deal) → grade 0 if traded
- Blackhawks: Connor Bedard (generational talent, rebuild centerpiece) → grade 0 if traded
- White Sox: Nobody (everyone is tradeable in a rebuild)

## Near-Untouchable Prospects (grade 15-30 if traded without elite return)
- **Blackhawks NHL prospects**: Frank Nazar (C), Kevin Korchinski (D), Artyom Levshunov (D)
- **Cubs MLB prospects**: Matt Shaw (3B), Cade Horton (RHP), Moises Ballesteros (C)
- Trading these requires getting a significant established player or multiple high picks in return

## Edge Cases
- Unknown player names: Still grade based on position and trade structure. Note unfamiliarity in reasoning.
- Absurd trades (mascots, wrong sport): Grade 0 with humor.
- Draft-pick-only trades: Grade on value chart equivalence.

## SUGGESTED COUNTER-TRADE RULES (CRITICAL)
When suggesting an alternative trade after rejection (grade < 70):

1. **Your suggested trade MUST grade 72+ under your own evaluation.** Before outputting it, mentally grade it. If it wouldn't pass, adjust until it would.

2. **The suggested trade MUST involve the same Chicago players the user originally selected.** Do NOT suggest a completely different trade. The user chose specific players for a reason — help them make THAT trade work.

3. **Adjustments should be realistic:**
   - Add a pick to sweeten the deal
   - Request a different/better player in return
   - Suggest salary retention if MLB
   - Remove a player Chicago is sending if it's too much value

4. **Never suggest trades that are ALSO unrealistic.** If the user's trade would be rejected by the other GM, don't suggest an even MORE lopsided counter.

## HISTORICAL TRADE CITATION RULES (CRITICAL)
When citing a historical trade as a comparison in your reasoning or historical_context:

1. **Your analysis MUST match the known consensus.** The gm_historical_trades table contains consensus grades for real trades. Check it before citing any trade.

2. **Do NOT contradict well-known trade narratives:**
   - Mookie Betts trade = MASSIVE steal for Dodgers (consensus: one-sided)
   - Herschel Walker trade = Historic fleece for Dallas (consensus: lopsided)
   - James Harden to Brooklyn = Overpay by Nets (consensus: bad for Nets)

3. **If a trade was widely panned, say so.** If it was praised, say so. Do NOT describe a known bad trade as "fair" or a known steal as "risky."

4. **Include consensus grade when known:** "The Mookie Betts trade (consensus: 85 for LAD) shows that..."

5. **When no clear consensus exists, say so:** "This trade's value is debated, with grades ranging from 60-80 depending on perspective."

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
  "cap_analysis": "<1-2 sentences about salary cap impact with specific dollar amounts when available>",
  "historical_context": {
    "similar_trades": [
      {
        "date": "<month year>",
        "description": "<brief trade description>",
        "teams": ["<team1>", "<team2>"],
        "outcome": "<worked | failed | neutral>",
        "similarity_score": <0-100>,
        "key_difference": "<what makes it different from this trade>"
      }
    ],
    "success_rate": <0-100, % of similar trades that worked>,
    "key_patterns": ["<pattern 1>", "<pattern 2>"],
    "why_this_fails_historically": "<only for rejected trades, explain historical failure pattern>",
    "what_works_instead": "<only for rejected trades, suggest what historically works>"
  },
  "suggested_trade": <only if grade < 70, suggest improvements> {
    "description": "<what to change>",
    "chicago_sends": [{"type": "player|pick", "name": "<name>", "position": "<pos>", "year": <year>, "round": <round>}],
    "chicago_receives": [{"type": "player|pick", "name": "<name>", "position": "<pos>", "year": <year>, "round": <round>}],
    "why_this_works": "<reasoning>",
    "likelihood": "<very likely | likely | possible | unlikely>",
    "estimated_grade_improvement": <number 5-30>
  }
}

IMPORTANT: Always include historical_context with 2-3 similar real trades from history. For rejected trades (grade < 70), also include suggested_trade with specific improvements.

Reasoning should: name specific players, mention team phase (rebuild/contend), note cap/salary if relevant, reference comparable real trades when possible, and always frame from Chicago's perspective. Be a seasoned GM, not a robot.

Do not wrap in markdown code blocks. Just raw JSON.`

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Check for test API key (for automated testing)
    const testApiKey = request.headers.get('x-test-api-key')
    const isTestRequest = testApiKey === process.env.GM_TEST_API_KEY && !!process.env.GM_TEST_API_KEY

    // Auth is optional - guests can grade trades but won't have history saved
    const user = isTestRequest ? null : await getGMAuthUser(request)
    const userId = isTestRequest ? 'test-runner' : (user?.id || 'guest')
    const isGuest = !user && !isTestRequest
    const displayName = isTestRequest ? 'Test Runner' : (user?.user_metadata?.display_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous')

    // Rate limiting: max 10 trades per minute (only for logged-in users, skip for test requests)
    if (!isGuest && !isTestRequest) {
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
    const {
      chicago_team, trade_partner, players_sent, players_received,
      draft_picks_sent, draft_picks_received, session_id, partner_team_key,
      // MLB salary retention & cash considerations
      salary_retentions, cash_sent, cash_received,
      // 3-team trade fields
      trade_partner_1, trade_partner_2, players: threeTeamPlayers, draft_picks: threeTeamPicks,
    } = body

    if (!chicago_team || !TEAM_SPORT_MAP[chicago_team]) {
      return NextResponse.json({ error: 'Invalid chicago_team' }, { status: 400 })
    }

    // Detect if this is a 3-team trade
    const isThreeTeamTrade = !!(trade_partner_1 && trade_partner_2)

    if (!isThreeTeamTrade) {
      // 2-team trade validation
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
    } else {
      // 3-team trade validation
      const hasAssets = (Array.isArray(threeTeamPlayers) && threeTeamPlayers.length > 0) ||
                        (Array.isArray(threeTeamPicks) && threeTeamPicks.length > 0)
      if (!hasAssets) {
        return NextResponse.json({ error: 'Must include at least one player or draft pick in 3-team trade' }, { status: 400 })
      }
    }

    const sport = TEAM_SPORT_MAP[chicago_team]
    const teamDisplayNames: Record<string, string> = {
      bears: 'Chicago Bears', bulls: 'Chicago Bulls', blackhawks: 'Chicago Blackhawks',
      cubs: 'Chicago Cubs', whitesox: 'Chicago White Sox',
    }

    // Handle 3-team trades separately
    if (isThreeTeamTrade) {
      const safeThreeTeamPlayers = Array.isArray(threeTeamPlayers) ? threeTeamPlayers : []
      const safeThreeTeamPicks = Array.isArray(threeTeamPicks) ? threeTeamPicks : []

      // Group assets by team for display
      const teamAssets: Record<string, { sends: string[], receives: string[] }> = {}
      const allTeamKeys = [chicago_team, trade_partner_1, trade_partner_2]

      for (const key of allTeamKeys) {
        teamAssets[key] = { sends: [], receives: [] }
      }

      // Process players
      for (const p of safeThreeTeamPlayers) {
        const playerDesc = `${p.player_name} (${p.position || 'N/A'})`
        if (p.from_team && teamAssets[p.from_team]) {
          teamAssets[p.from_team].sends.push(playerDesc)
        }
        if (p.to_team && teamAssets[p.to_team]) {
          teamAssets[p.to_team].receives.push(playerDesc)
        }
      }

      // Process draft picks
      for (const pk of safeThreeTeamPicks) {
        const pickDesc = `${pk.year} Round ${pk.round} pick`
        if (pk.from_team && teamAssets[pk.from_team]) {
          teamAssets[pk.from_team].sends.push(pickDesc)
        }
        if (pk.to_team && teamAssets[pk.to_team]) {
          teamAssets[pk.to_team].receives.push(pickDesc)
        }
      }

      // Build trade description for AI
      const chicagoName = teamDisplayNames[chicago_team]

      // Fetch team context for all 3 teams
      const [ctx1, ctx2, ctx3] = await Promise.all([
        getTeamContext(chicago_team, sport),
        getTeamContext(trade_partner_1, sport),
        getTeamContext(trade_partner_2, sport),
      ])

      let tradeDesc = `3-TEAM TRADE\nSport: ${sport.toUpperCase()}\n\n`

      for (const [teamKey, assets] of Object.entries(teamAssets)) {
        const teamName = teamKey === chicago_team ? chicagoName : teamKey
        tradeDesc += `${teamName}:\n`
        tradeDesc += `  SENDS: ${assets.sends.length > 0 ? assets.sends.join(', ') : 'Nothing'}\n`
        tradeDesc += `  RECEIVES: ${assets.receives.length > 0 ? assets.receives.join(', ') : 'Nothing'}\n\n`
      }

      // Add team context for all 3 teams
      tradeDesc += `\n## TEAM SITUATIONAL CONTEXT (CRITICAL)\n`
      tradeDesc += formatTeamContextForPrompt(ctx1, chicagoName) + '\n\n'
      tradeDesc += formatTeamContextForPrompt(ctx2, trade_partner_1) + '\n\n'
      tradeDesc += formatTeamContextForPrompt(ctx3, trade_partner_2) + '\n\n'

      tradeDesc += `Grade this trade from the perspective of the ${chicagoName}. Consider each team's competitive phase and needs when evaluating realism.`

      // Call AI for grading (no deterministic grade for 3-team trades)
      const response = await getAnthropic().messages.create({
        model: MODEL_NAME,
        max_tokens: 1500,
        temperature: 0,
        system: GM_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: tradeDesc }],
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
      let threeTeamHistoricalContext: any = null
      let threeTeamSuggestedTrade: any = null

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

        // Parse historical context for 3-team trades
        if (parsed.historical_context) {
          threeTeamHistoricalContext = {
            similar_trades: Array.isArray(parsed.historical_context.similar_trades)
              ? parsed.historical_context.similar_trades.slice(0, 3)
              : [],
            success_rate: typeof parsed.historical_context.success_rate === 'number'
              ? Math.max(0, Math.min(100, parsed.historical_context.success_rate))
              : 50,
            key_patterns: Array.isArray(parsed.historical_context.key_patterns)
              ? parsed.historical_context.key_patterns.slice(0, 5)
              : [],
            why_this_fails_historically: parsed.historical_context.why_this_fails_historically || null,
            what_works_instead: parsed.historical_context.what_works_instead || null,
          }
        }

        // Parse suggested trade for rejected 3-team trades
        if (parsed.suggested_trade && grade < 70) {
          // FIX B: Filter out picks with undefined round or year (3-team trade path)
          const filterValidItems3Team = (items: any[]) => {
            if (!Array.isArray(items)) return []
            return items.filter((item: any) => {
              if (item.type === 'pick' || item.round !== undefined || item.year !== undefined) {
                return item.round && item.year
              }
              if (item.type === 'player' || item.name !== undefined) {
                return item.name && item.name.trim() !== ''
              }
              return item.name || (item.round && item.year)
            })
          }

          threeTeamSuggestedTrade = {
            description: parsed.suggested_trade.description || '',
            chicago_sends: filterValidItems3Team(parsed.suggested_trade.chicago_sends),
            chicago_receives: filterValidItems3Team(parsed.suggested_trade.chicago_receives),
            why_this_works: parsed.suggested_trade.why_this_works || '',
            likelihood: parsed.suggested_trade.likelihood || 'possible',
            estimated_grade_improvement: typeof parsed.suggested_trade.estimated_grade_improvement === 'number'
              ? Math.max(0, Math.min(50, parsed.suggested_trade.estimated_grade_improvement))
              : 15,
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

      // Get team logos
      let partner1Logo: string | null = null
      let partner2Logo: string | null = null
      let chicagoTeamLogo: string | null = null

      const { data: p1 } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', trade_partner_1)
        .eq('sport', sport)
        .single()
      partner1Logo = p1?.logo_url || null

      const { data: p2 } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', trade_partner_2)
        .eq('sport', sport)
        .single()
      partner2Logo = p2?.logo_url || null

      const { data: ct } = await datalabAdmin
        .from('gm_league_teams')
        .select('logo_url')
        .eq('team_key', chicago_team)
        .eq('sport', sport)
        .single()
      chicagoTeamLogo = ct?.logo_url || null

      // Save 3-team trade to database
      const { data: trade, error: tradeError } = await datalabAdmin.from('gm_trades').insert({
        user_id: userId,
        user_email: userEmail,
        chicago_team,
        sport,
        trade_partner: `${trade_partner_1} / ${trade_partner_2}`, // Combined for display
        players_sent: safeThreeTeamPlayers.filter(p => p.from_team === chicago_team),
        players_received: safeThreeTeamPlayers.filter(p => p.to_team === chicago_team),
        grade,
        grade_reasoning: reasoning,
        status,
        is_dangerous,
        session_id: session_id || null,
        improvement_score: improvementScore,
        trade_summary: tradeSummary,
        ai_version: `gm_3team_${API_VERSION}_${MODEL_NAME}`,
        shared_code: sharedCode,
        partner_team_key: trade_partner_1,
        partner_team_logo: partner1Logo,
        chicago_team_logo: chicagoTeamLogo,
        draft_picks_sent: safeThreeTeamPicks.filter(pk => pk.from_team === chicago_team),
        draft_picks_received: safeThreeTeamPicks.filter(pk => pk.to_team === chicago_team),
        talent_balance: breakdown.talent_balance,
        contract_value: breakdown.contract_value,
        team_fit: breakdown.team_fit,
        future_assets: breakdown.future_assets,
        cap_analysis: capAnalysis,
        is_three_team: true,
        trade_partner_2: trade_partner_2,
        trade_partner_2_logo: partner2Logo,
        three_team_players: safeThreeTeamPlayers,
        three_team_picks: safeThreeTeamPicks,
      }).select().single()

      if (tradeError) {
        console.error('Failed to insert 3-team trade:', tradeError)
      }

      // Update session counters if applicable
      if (session_id && trade) {
        if (status === 'accepted') {
          await datalabAdmin.rpc('increment_session_approved', { sid: session_id })
        } else {
          await datalabAdmin.rpc('increment_session_rejected', { sid: session_id })
        }
      }

      // Log to audit
      try {
        await datalabAdmin.from('gm_audit_logs').insert({
          user_id: userId,
          user_email: userEmail,
          chicago_team,
          request_payload: { trade_partner_1, trade_partner_2, players: safeThreeTeamPlayers, draft_picks: safeThreeTeamPicks },
          response_payload: { grade, reasoning, breakdown },
          response_time_ms: responseTimeMs,
          ai_model: MODEL_NAME,
        })
      } catch (auditErr) {
        console.error('Audit log failed:', auditErr)
      }

      // Fetch data freshness for 3-team trade
      const threeTeamDataFreshness = await getDataFreshness(chicago_team, sport)

      return NextResponse.json({
        grade,
        reasoning,
        status,
        is_dangerous,
        trade_id: trade?.id || null,
        shared_code: sharedCode,
        improvement_score: improvementScore,
        trade_summary: tradeSummary,
        breakdown,
        cap_analysis: capAnalysis,
        is_three_team: true,
        // New Feb 2026 fields
        historical_context: threeTeamHistoricalContext,
        enhanced_suggested_trade: threeTeamSuggestedTrade,
        data_freshness: threeTeamDataFreshness,
      })
    }

    // ========== 2-TEAM TRADE LOGIC (original) ==========

    // Ensure arrays are initialized (empty arrays, not undefined)
    const safePlayers_sent = Array.isArray(players_sent) ? players_sent : []
    const safePlayers_received = Array.isArray(players_received) ? players_received : []
    const safeDraft_picks_sent = Array.isArray(draft_picks_sent) ? draft_picks_sent : []
    const safeDraft_picks_received = Array.isArray(draft_picks_received) ? draft_picks_received : []

    // Call Edge Function for deterministic grade FIRST
    let deterministicResult: { grade: number; breakdown: any; debug?: any } | null = null
    try {
      deterministicResult = await getDeterministicGrade({
        chicago_team,
        sport,
        players_sent: safePlayers_sent,
        players_received: safePlayers_received,
        draft_picks_sent: safeDraft_picks_sent,
        draft_picks_received: safeDraft_picks_received,
      })
      console.log('Deterministic grade result:', deterministicResult)
    } catch (e) {
      console.error('Failed to get deterministic grade:', e)
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

    // Fetch team context for BOTH Chicago team and trade partner
    // This is critical for understanding WHY a team would make a move
    const [chicagoContext, partnerContext] = await Promise.all([
      getTeamContext(chicago_team, sport),
      partner_team_key ? getTeamContext(partner_team_key, sport) : Promise.resolve(null),
    ])
    console.log('Team context loaded:', { chicago: !!chicagoContext, partner: !!partnerContext })

    // Look up player value tiers for both sides
    const allPlayerNames = [
      ...safePlayers_sent.map((p: any) => p.name || p.full_name),
      ...safePlayers_received.map((p: any) => p.name || p.full_name),
    ].filter(Boolean)

    let tierMap: Record<string, { tier: number, tier_label: string, trade_value: number }> = {}
    try {
      const { data: tiers } = await datalabAdmin
        .from('gm_player_value_tiers')
        .select('full_name, tier, tier_label, trade_value')
        .in('full_name', allPlayerNames)
        .eq('sport', sport)
      if (tiers) {
        for (const t of tiers) {
          tierMap[t.full_name] = { tier: t.tier, tier_label: t.tier_label, trade_value: t.trade_value }
        }
      }
    } catch {
      // Table may not exist yet — continue without tiers
    }

    // Calculate data confidence for confidence-based authority routing
    const dataConfidence = calculateDataConfidence(safePlayers_sent, safePlayers_received, tierMap)
    console.log('Data confidence:', dataConfidence)

    // Calculate cap relief bonus (Instruction 1)
    const capRelief = calculateCapReliefBonus(safePlayers_sent, safePlayers_received, chicagoContext)
    console.log('Cap relief analysis:', capRelief)

    // Find structurally similar trades for calibration
    const similarTrades = await findSimilarTrades(
      sport,
      chicago_team,
      safePlayers_sent,
      safePlayers_received,
      safeDraft_picks_sent,
      safeDraft_picks_received,
      3 // Get top 3 similar trades
    )
    console.log('Similar trades found:', similarTrades.length)
    const similarTradesBlock = formatSimilarTradesForPrompt(similarTrades)

    // Fetch verified historical trade references for accurate citation
    const primaryPosition = safePlayers_sent[0]?.position || safePlayers_received[0]?.position
    const historicalRefs = await getHistoricalTradeReferences(sport, undefined, 5)
    const historicalRefsBlock = formatHistoricalReferencesForPrompt(historicalRefs)
    console.log('Historical references loaded:', historicalRefs.length)

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
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value}${tier.tier === 1 ? ', UNTOUCHABLE' : ''}]`
      return desc
    }).join(', ')

    const recvDesc = safePlayers_received.map((p: any) => {
      let desc = `${p.name || p.full_name} (${p.position})`
      if (p.stat_line) desc += ` [${p.stat_line}]`
      if (p.age) desc += ` Age ${p.age}`
      if (p.cap_hit) desc += `, ${formatMoney(p.cap_hit)} cap hit`
      if (p.contract_years) desc += `, ${p.contract_years}yr remaining`
      const tier = tierMap[p.name || p.full_name]
      if (tier) desc += ` [Tier ${tier.tier}: ${tier.tier_label}, value ${tier.trade_value}${tier.tier === 1 ? ', UNTOUCHABLE' : ''}]`
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

    // MLB Salary Retention & Cash Considerations context
    let mlbFinancialContext = ''
    if (sport === 'mlb') {
      // Salary retention details
      if (salary_retentions && typeof salary_retentions === 'object' && Object.keys(salary_retentions).length > 0) {
        const retentionDetails: string[] = []
        for (const [playerId, pct] of Object.entries(salary_retentions)) {
          const numPct = Number(pct)
          if (numPct > 0) {
            // Find the player in received list
            const player = safePlayers_received.find((p: any) =>
              p.espn_id === playerId || p.player_id === playerId || (p.name || p.full_name) === playerId
            )
            if (player?.cap_hit) {
              const retainedAmount = (player.cap_hit * numPct) / 100
              const netSalary = player.cap_hit - retainedAmount
              retentionDetails.push(
                `${player.name || player.full_name}: ${numPct}% retained by sending team (${formatMoney(retainedAmount)} retained, net ${formatMoney(netSalary)} for Chicago)`
              )
            }
          }
        }
        if (retentionDetails.length > 0) {
          mlbFinancialContext += `\n\nSalary Retention:\n${retentionDetails.join('\n')}`
        }
      }

      // Cash considerations
      if (cash_sent && Number(cash_sent) > 0) {
        mlbFinancialContext += `\nCash sent by Chicago: $${Number(cash_sent).toLocaleString()}`
      }
      if (cash_received && Number(cash_received) > 0) {
        mlbFinancialContext += `\nCash received by Chicago: $${Number(cash_received).toLocaleString()}`
      }
    }

    // Calculate value gap if tiers are available
    let valueContext = ''
    const hasTiers = Object.keys(tierMap).length > 0
    if (hasTiers) {
      const sentValue = safePlayers_sent.reduce((sum: number, p: any) => {
        const tier = tierMap[p.name || p.full_name]
        return sum + (tier?.trade_value || 0)
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
        return sum + (tier?.trade_value || 0)
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

    // Build different prompts based on whether we have a deterministic grade
    let tradeDescription: string
    let systemPrompt: string

    // Build team context block for AI prompt
    const teamContextBlock = `
## TEAM SITUATIONAL CONTEXT (CRITICAL FOR TRADE EVALUATION)
${formatTeamContextForPrompt(chicagoContext, teamDisplayNames[chicago_team])}

${formatTeamContextForPrompt(partnerContext, trade_partner)}

**TRADE MOTIVATION ANALYSIS:**
Use this context to evaluate:
1. Does this trade align with Chicago's competitive phase? (${chicagoContext?.team_phase || 'unknown'})
2. Does Chicago fill a position of need? (Needs: ${chicagoContext?.positional_needs?.join(', ') || 'unknown'})
3. Would the trade partner realistically accept based on THEIR phase? (${partnerContext?.team_phase || 'unknown'})
4. Are both teams trading from positions of strength or desperation?`

    if (deterministicResult) {
      // AI Authority Mode with confidence-based routing
      tradeDescription = `
Sport: ${sport.toUpperCase()}
${teamDisplayNames[chicago_team]} send: ${sentDesc}${picksSentDesc}
${trade_partner} send: ${recvDesc}${picksRecvDesc}${capContext}${mlbFinancialContext}
${teamContextBlock}

${similarTradesBlock}

${historicalRefsBlock}

## DETERMINISTIC BASELINE: ${deterministicResult.grade}
This is a mathematical estimate only. Formula calculated:
- Sent value: ${deterministicResult.debug?.sent_value || 'N/A'}
- Received value: ${deterministicResult.debug?.received_value || 'N/A'}
- Value difference: ${deterministicResult.debug?.value_difference || 'N/A'}
- Team phase: ${deterministicResult.debug?.team_phase || 'N/A'}

## CAP RELIEF ANALYSIS:
${capRelief.explanation}
${capRelief.bonus > 0 ? `Factor this into your grade: saving significant cap space to address team needs is a VALID strategic reason to trade a good player. Consider adding up to +${capRelief.bonus} points.` : 'No significant cap relief in this trade.'}

**You produce the FINAL grade based on all context provided. Your grade IS the grade returned to the user.**

## DATA CONFIDENCE: ${dataConfidence.confidence} (${dataConfidence.confidenceReason})
- High confidence (0.8+) = baseline is likely accurate, adjust for context only
- Medium confidence (0.5-0.8) = baseline is a reasonable starting point
- Low confidence (<0.5) = baseline may be off, use your judgment heavily

## PLAYER TIER DATA (from database):
${Object.entries(tierMap).map(([name, data]) => `- ${name}: Tier ${data.tier} (${data.tier_label}), trade_value=${data.trade_value}`).join('\n') || 'No tier data available'}

## YOUR TASK:
You are GM, the FINAL AUTHORITY. Your grade IS the grade returned to the user.
- Use the TEAM CONTEXT above to understand WHY each team would make this trade
- **CHECK HISTORICAL CALIBRATION above** — if your grade differs >15 points from similar trades, EXPLAIN WHY
- The deterministic baseline of ${deterministicResult.grade} is advisory only — override it if context demands
Evaluate all factors and produce YOUR final grade.`

      // Use the main GM_SYSTEM_PROMPT which now establishes AI authority
      systemPrompt = GM_SYSTEM_PROMPT
    } else {
      // Fallback: Full AI grading (original behavior)
      tradeDescription = `
Sport: ${sport.toUpperCase()}
${teamDisplayNames[chicago_team]} send: ${sentDesc}${picksSentDesc}
${trade_partner} send: ${recvDesc}${picksRecvDesc}${capContext}${mlbFinancialContext}${valueContext}
${teamContextBlock}

${similarTradesBlock}

${historicalRefsBlock}
${examplesBlock}

## CAP RELIEF ANALYSIS:
${capRelief.explanation}
${capRelief.bonus > 0 ? `Factor this into your grade: saving significant cap space to address team needs is a VALID strategic reason to trade a good player.` : ''}

**IMPORTANT:** If your grade differs by >15 points from similar historical trades, you MUST explain why in your reasoning. Also ensure any historical trade analysis matches the known consensus grades shown above.

Grade this trade from the perspective of the ${teamDisplayNames[chicago_team]}.`
      systemPrompt = GM_SYSTEM_PROMPT
    }

    const requestPayload = { model: MODEL_NAME, system: deterministicResult ? 'DETERMINISTIC_EXPLAIN_PROMPT' : 'GM_SYSTEM_PROMPT', tradeDescription, deterministicGrade: deterministicResult?.grade }

    const response = await getAnthropic().messages.create({
      model: MODEL_NAME,
      max_tokens: 1500,
      temperature: 0, // Deterministic output
      system: systemPrompt,
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
    let historicalContext: any = null
    let suggestedTrade: any = null

    // DEBUG: Track grading internals
    let debugInfo: any = {
      api_version: API_VERSION,
      model: MODEL_NAME,
      timestamp: new Date().toISOString(),
    }

    try {
      const parsed = JSON.parse(rawText)
      // TASK 1: Claude Opus is the FINAL AUTHORITY - no clamping
      // The deterministic baseline is advisory only - Claude's grade IS the final grade
      const aiGrade = Math.max(0, Math.min(100, Math.round(parsed.grade)))

      // Claude's grade is the final grade - no clamping or adjustment
      grade = aiGrade

      // DEBUG: Capture grading details (baseline is advisory only)
      const baseline = deterministicResult?.grade
      debugInfo = {
        ...debugInfo,
        grading_mode: 'claude_opus_final_authority_v4',
        data_confidence: dataConfidence.confidence,
        confidence_reason: dataConfidence.confidenceReason,
        deterministic_baseline: baseline ?? 'N/A',
        baseline_note: 'Advisory only - Claude Opus produces the FINAL grade',
        claude_final_grade: aiGrade,
        baseline_diff: baseline ? aiGrade - baseline : 'N/A',
        sent_side_analysis: dataConfidence.sentSideAnalysis,
        received_side_analysis: dataConfidence.receivedSideAnalysis,
      }

      // Rule: Grade 69 rounds up to 70 (1 point from acceptance is frustrating)
      if (grade === 69) {
        grade = 70
      }

      // Add final grade to debug info
      debugInfo.final_grade = grade

      // Use AI breakdown
      if (parsed.breakdown) {
        breakdown = {
          talent_balance: Math.max(0, Math.min(1, parsed.breakdown.talent_balance ?? 0.5)),
          contract_value: Math.max(0, Math.min(1, parsed.breakdown.contract_value ?? 0.5)),
          team_fit: Math.max(0, Math.min(1, parsed.breakdown.team_fit ?? 0.5)),
          future_assets: Math.max(0, Math.min(1, parsed.breakdown.future_assets ?? 0.5)),
        }
      } else if (deterministicResult?.breakdown) {
        // Fallback to deterministic breakdown if AI didn't provide one
        breakdown = deterministicResult.breakdown
      }
      reasoning = parsed.reasoning || 'No reasoning provided.'
      tradeSummary = parsed.trade_summary || ''
      improvementScore = typeof parsed.improvement_score === 'number' ? Math.max(-10, Math.min(10, parsed.improvement_score)) : 0
      capAnalysis = parsed.cap_analysis || ''

      // Parse historical context from AI response
      if (parsed.historical_context) {
        historicalContext = {
          similar_trades: Array.isArray(parsed.historical_context.similar_trades)
            ? parsed.historical_context.similar_trades.slice(0, 3)
            : [],
          success_rate: typeof parsed.historical_context.success_rate === 'number'
            ? Math.max(0, Math.min(100, parsed.historical_context.success_rate))
            : 50,
          key_patterns: Array.isArray(parsed.historical_context.key_patterns)
            ? parsed.historical_context.key_patterns.slice(0, 5)
            : [],
          why_this_fails_historically: parsed.historical_context.why_this_fails_historically || null,
          what_works_instead: parsed.historical_context.what_works_instead || null,
        }
      }

      // Parse suggested trade for rejected trades
      if (parsed.suggested_trade && grade < 70) {
        // FIX B: Filter out picks with undefined round or year
        const filterValidItems = (items: any[]) => {
          if (!Array.isArray(items)) return []
          return items.filter((item: any) => {
            // If it's a pick, must have valid round and year
            if (item.type === 'pick' || item.round !== undefined || item.year !== undefined) {
              return item.round && item.year // Only include if both are defined and truthy
            }
            // If it's a player, must have a name
            if (item.type === 'player' || item.name !== undefined) {
              return item.name && item.name.trim() !== ''
            }
            // Unknown item type - include if it has meaningful content
            return item.name || (item.round && item.year)
          })
        }

        suggestedTrade = {
          description: parsed.suggested_trade.description || '',
          chicago_sends: filterValidItems(parsed.suggested_trade.chicago_sends),
          chicago_receives: filterValidItems(parsed.suggested_trade.chicago_receives),
          why_this_works: parsed.suggested_trade.why_this_works || '',
          likelihood: parsed.suggested_trade.likelihood || 'possible',
          estimated_grade_improvement: typeof parsed.suggested_trade.estimated_grade_improvement === 'number'
            ? Math.max(0, Math.min(50, parsed.suggested_trade.estimated_grade_improvement))
            : 15,
        }
      }
    } catch {
      // AI parse failure - fall back to deterministic baseline only if available
      if (deterministicResult) {
        grade = deterministicResult.grade
        breakdown = deterministicResult.breakdown || {
          talent_balance: 0.5,
          contract_value: 0.5,
          team_fit: 0.5,
          future_assets: 0.5,
        }
        reasoning = `Trade graded ${grade}/100 based on deterministic baseline (AI response could not be parsed).`
        debugInfo.ai_parse_error = true
        debugInfo.fallback = 'deterministic_baseline_only'
        debugInfo.note = 'AI authority mode failed - using baseline as emergency fallback'
      } else {
        const gradeMatch = rawText.match(/(\d{1,3})/)
        grade = gradeMatch ? Math.max(0, Math.min(100, parseInt(gradeMatch[1]))) : 50
        reasoning = rawText || 'AI response could not be parsed.'
        debugInfo.ai_parse_error = true
        debugInfo.fallback = 'regex_extraction'
      }
    }

    // DEBUG: Add tier map and player lookups
    debugInfo.tier_map = tierMap
    debugInfo.players_sent_with_tiers = safePlayers_sent.map((p: any) => ({
      name: p.name || p.full_name,
      position: p.position,
      tier_info: tierMap[p.name || p.full_name] || 'NOT_FOUND_IN_TIERS',
    }))
    debugInfo.players_received_with_tiers = safePlayers_received.map((p: any) => ({
      name: p.name || p.full_name,
      position: p.position,
      tier_info: tierMap[p.name || p.full_name] || 'NOT_FOUND_IN_TIERS',
    }))
    debugInfo.draft_picks_sent = safeDraft_picks_sent.map((pk: any) => ({
      ...pk,
      estimated_value: pk.round === 1 ? 35 : pk.round === 2 ? 18 : pk.round === 3 ? 10 : 5,
    }))
    debugInfo.draft_picks_received = safeDraft_picks_received.map((pk: any) => ({
      ...pk,
      estimated_value: pk.round === 1 ? 35 : pk.round === 2 ? 18 : pk.round === 3 ? 10 : 5,
    }))
    debugInfo.raw_ai_response = rawText.substring(0, 2000) // First 2000 chars

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
      ai_version: `gm_ai_authority_${API_VERSION}_${MODEL_NAME}`,
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

    // Fetch data freshness
    const dataFreshness = await getDataFreshness(chicago_team, sport)

    // Calculate if grade deviates significantly from similar trades
    const avgSimilarGrade = similarTrades.length > 0
      ? Math.round(similarTrades.reduce((sum, t) => sum + t.grade, 0) / similarTrades.length)
      : null
    const gradeDeviation = avgSimilarGrade !== null ? grade - avgSimilarGrade : null
    const isSignificantDeviation = gradeDeviation !== null && Math.abs(gradeDeviation) > 15

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
      // Cap relief analysis (Instruction 1)
      cap_relief: {
        bonus: capRelief.bonus,
        savings_millions: capRelief.savingsInMillions,
        explanation: capRelief.explanation,
      },
      // New Feb 2026 fields
      historical_context: historicalContext,
      enhanced_suggested_trade: suggestedTrade,
      data_freshness: dataFreshness,
      // Similar trades calibration
      similar_trades: similarTrades.map(t => ({
        id: t.id,
        grade: t.grade,
        status: t.status,
        summary: t.trade_summary,
        similarity_score: t.similarity_score,
      })),
      calibration: {
        avg_similar_grade: avgSimilarGrade,
        grade_deviation: gradeDeviation,
        is_significant_deviation: isSignificantDeviation,
      },
      // TEMPORARY DEBUG - remove after testing
      _debug: debugInfo,
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
