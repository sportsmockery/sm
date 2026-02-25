import { createHash } from 'crypto'

/**
 * Compute a deterministic hash for a trade based on its assets.
 * Used to detect repeat trades from the same user and return cached grades.
 *
 * Hash inputs (all sorted for determinism):
 * - chicago_team, sport, partner_team_key
 * - Sorted player ESPN IDs (sent + received)
 * - Sorted draft picks (year:round, sent + received)
 * - For 3-team trades: both partner keys + all asset flows
 */
export function computeTradeHash(params: {
  chicago_team: string
  sport: string
  partner_team_key?: string
  players_sent: { espn_id?: string; name?: string }[]
  players_received: { espn_id?: string; name?: string }[]
  draft_picks_sent?: { year: number; round: number }[]
  draft_picks_received?: { year: number; round: number }[]
  // 3-team trade support
  trade_partner_1?: string
  trade_partner_2?: string
  three_team_players?: { player_name?: string; espn_id?: string; from_team?: string; to_team?: string }[]
  three_team_picks?: { from_team?: string; to_team?: string; year?: number; round?: number }[]
}): string {
  const parts: string[] = []

  // Core identifiers
  parts.push(`team:${params.chicago_team}`)
  parts.push(`sport:${params.sport}`)

  if (params.trade_partner_1 && params.trade_partner_2) {
    // 3-team trade: sort partner keys for determinism
    const partners = [params.trade_partner_1, params.trade_partner_2].sort()
    parts.push(`partners:${partners.join(',')}`)

    // 3-team players: sorted by from_team:to_team:identifier
    if (params.three_team_players?.length) {
      const playerKeys = params.three_team_players
        .map(p => `${p.from_team || ''}>${p.to_team || ''}:${p.espn_id || p.player_name || ''}`)
        .sort()
      parts.push(`3tp:${playerKeys.join('|')}`)
    }

    // 3-team picks: sorted by from_team:to_team:year:round
    if (params.three_team_picks?.length) {
      const pickKeys = params.three_team_picks
        .map(pk => `${pk.from_team || ''}>${pk.to_team || ''}:${pk.year || 0}:${pk.round || 0}`)
        .sort()
      parts.push(`3tpk:${pickKeys.join('|')}`)
    }
  } else {
    // 2-team trade
    if (params.partner_team_key) {
      parts.push(`partner:${params.partner_team_key}`)
    }

    // Players sent: sort by ESPN ID (fall back to name)
    const sentIds = (params.players_sent || [])
      .map(p => p.espn_id || p.name || '')
      .filter(Boolean)
      .sort()
    parts.push(`sent:${sentIds.join(',')}`)

    // Players received: sort by ESPN ID (fall back to name)
    const recvIds = (params.players_received || [])
      .map(p => p.espn_id || p.name || '')
      .filter(Boolean)
      .sort()
    parts.push(`recv:${recvIds.join(',')}`)

    // Draft picks sent: sort by year:round
    const picksSent = (params.draft_picks_sent || [])
      .map(pk => `${pk.year}:${pk.round}`)
      .sort()
    if (picksSent.length > 0) parts.push(`pks:${picksSent.join(',')}`)

    // Draft picks received: sort by year:round
    const picksRecv = (params.draft_picks_received || [])
      .map(pk => `${pk.year}:${pk.round}`)
      .sort()
    if (picksRecv.length > 0) parts.push(`pkr:${picksRecv.join(',')}`)
  }

  const input = parts.join('||')
  return createHash('sha256').update(input).digest('hex').substring(0, 32)
}
