/**
 * GM Trade Simulator Constants (February 2026)
 *
 * Updated cap thresholds and team phases for all sports.
 * These values should match the backend system prompt in /api/gm/grade/route.ts
 */

// CBA Salary Cap Thresholds for 2026
export const CBA_2026 = {
  nfl: {
    cap: 301_200_000,           // $301.2M
    floor: 271_080_000,         // 90% of cap
  },
  nba: {
    cap: 154_647_000,           // $154.6M
    firstApron: 178_100_000,    // $178.1M - hard cap if triggered
    secondApron: 188_900_000,   // $188.9M - severe restrictions
    luxuryTax: 171_300_000,     // $171.3M
  },
  nhl: {
    cap: 95_500_000,            // $95.5M
    floor: 65_000_000,          // $65M
  },
  mlb: {
    cbt: 244_000_000,           // $244M luxury tax threshold
  },
} as const

// Team phases for February 2026
export const TEAM_PHASES_2026 = {
  bears: 'contending',      // 12-7 in 2025, aggressive offseason (Thuney, Jackson)
  bulls: 'rebuilding',      // FULL REBUILD after 7+ deadline trades
  blackhawks: 'rebuilding', // 21-24-9, selling UFAs at deadline
  cubs: 'contending',       // 92-70, aggressive buyer
  whitesox: 'rebuilding',   // 60-102, historic rebuild
} as const

export type TeamPhase = typeof TEAM_PHASES_2026[keyof typeof TEAM_PHASES_2026]

// Grade interpretation for UI
export const GRADE_INTERPRETATION = {
  elite: { min: 90, max: 100, label: 'ELITE', message: 'Franchise-altering steal!', color: '#10b981' },
  excellent: { min: 85, max: 89, label: 'EXCELLENT', message: 'Outstanding trade for Chicago', color: '#22c55e' },
  accepted: { min: 70, max: 84, label: 'ACCEPTED', message: 'Trade approved - good value', color: '#22c55e' },
  close: { min: 65, max: 69, label: 'CLOSE', message: 'Almost there - minor adjustment needed', color: '#eab308' },
  rejected: { min: 55, max: 64, label: 'REJECTED', message: 'Trade rejected - value concerns', color: '#f97316' },
  bad: { min: 40, max: 54, label: 'BAD', message: 'Significant overpay', color: '#ef4444' },
  terrible: { min: 20, max: 39, label: 'TERRIBLE', message: 'Do not make this trade', color: '#dc2626' },
  illegal: { min: 0, max: 19, label: 'ILLEGAL', message: 'Trading untouchable player or illegal trade', color: '#7f1d1d' },
} as const

export function getGradeInterpretation(grade: number) {
  if (grade >= 90) return GRADE_INTERPRETATION.elite
  if (grade >= 85) return GRADE_INTERPRETATION.excellent
  if (grade >= 70) return GRADE_INTERPRETATION.accepted
  if (grade >= 65) return GRADE_INTERPRETATION.close
  if (grade >= 55) return GRADE_INTERPRETATION.rejected
  if (grade >= 40) return GRADE_INTERPRETATION.bad
  if (grade >= 20) return GRADE_INTERPRETATION.terrible
  return GRADE_INTERPRETATION.illegal
}

// Historical trade calibration anchors (for reference/display)
export const HISTORICAL_TRADE_ANCHORS = {
  nfl: {
    elite_cb: 'Sauce Gardner: 2 1sts + player',
    elite_dt: 'Quinnen Williams: 1st + 2nd + player',
    injured_vet: 'Jaire Alexander: 6th only',
  },
  nba: {
    star_swap: 'Harden → Cavs: Garland + Hunter',
    young_talent_swap: 'Kuminga → Hawks: Porzingis',
    bulls_rebuild: 'Bulls made 7+ trades in full rebuild pivot',
  },
  nhl: {
    winger_rental_ceiling: 'Panarin → Kings: prospect + 2 conditional picks',
    retained_star: 'Seth Jones → Panthers: Knight + conditional 1st (with $2.5M retention)',
  },
  mlb: {
    elite_closer: 'Mason Miller + Sears: Leo De Vries (#5 prospect) + 3 more',
    mid_tier_sp_rental: 'Adrian Houser: Curtis Mead + 2 pitching prospects',
  },
} as const

// Position needs by team (February 2026)
export const TEAM_NEEDS_2026 = {
  bears: {
    top: ['EDGE', 'DE', 'OLB'],
    needs: ['DT', 'IOL'],
    strengths: ['WR', 'QB', 'CB', 'OT', 'OG'],
    notes: 'DJ Moore is trade candidate ($28M, declining production)',
  },
  bulls: {
    top: [],
    needs: [],
    strengths: [],
    notes: 'Full rebuild - acquire young players + draft picks. New core: Ivey, Simons, Dillingham, Okoro, Sexton',
  },
  blackhawks: {
    top: ['D', 'G'],
    needs: [],
    strengths: ['C'],
    notes: 'Selling UFAs. May have 0 retention slots available.',
  },
  cubs: {
    top: ['SP', 'RP'],
    needs: [],
    strengths: ['Lineup depth', 'Prospect pool'],
    notes: 'Aggressive buyer',
  },
  whitesox: {
    top: ['Everything'],
    needs: [],
    strengths: [],
    notes: 'Historic rebuild. Luis Robert Jr. is #1 trade chip.',
  },
} as const

// Format cap number for display
export function formatCap(value: number): string {
  return `$${(value / 1_000_000).toFixed(1)}M`
}

// Get cap for a sport
export function getCapForSport(sport: 'nfl' | 'nba' | 'nhl' | 'mlb'): number {
  switch (sport) {
    case 'nfl': return CBA_2026.nfl.cap
    case 'nba': return CBA_2026.nba.cap
    case 'nhl': return CBA_2026.nhl.cap
    case 'mlb': return CBA_2026.mlb.cbt
  }
}
