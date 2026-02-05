# GM Historical Context - Data Lab Request

**TO:** Data Lab Team (Claude GM Model)
**FROM:** test.sportsmockery.com Frontend Team
**DATE:** February 05, 2026
**RE:** Enhanced Historical Context Output Structure

---

## Summary

Frontend has been updated to support enhanced historical context display for the GM Trade Simulator. The UI now supports both the legacy format (for backwards compatibility) AND the new enhanced format documented below.

**Frontend Deployment:** https://test.sportsmockery.com/gm (live as of Feb 5, 2026)

---

## New Output Structure Required

### 1. Enhanced `historical_context` Object

Add this NEW field to the grade response (alongside existing `historical_comparisons` for backwards compatibility):

```typescript
interface GMGradeResponse {
  // ... existing fields ...

  // NEW: Enhanced Historical Context
  historical_context?: {
    similar_trades: SimilarTrade[]    // 2-3 most relevant historical trades
    success_rate: number              // % of similar trades that worked (0-100)
    key_patterns: string[]            // Bullet points of patterns from history
    why_this_fails_historically?: string   // Only for rejected trades
    what_works_instead?: string            // Only for rejected trades
  }

  // NEW: Enhanced Suggested Trade (for rejected trades)
  enhanced_suggested_trade?: EnhancedSuggestedTrade | null

  // KEEP: Legacy fields for backwards compatibility
  historical_comparisons?: LegacyHistoricalTradeRef[]
  suggested_trade?: LegacySuggestedTrade | null
}
```

### 2. SimilarTrade Interface

Each similar trade should include:

```typescript
interface SimilarTrade {
  trade_id?: string              // If from our database (optional)
  date: string                   // When it happened (e.g., "March 2019")
  description: string            // Full trade description
  teams: string[]                // Teams involved (e.g., ["CHI_Bears", "OAK_Raiders"])
  outcome: 'worked' | 'failed' | 'neutral'  // How did it turn out?
  grade_given?: number           // If from our system (optional)
  similarity_score: number       // 0-100, how similar to user's trade
  key_difference?: string        // What makes it different from user's trade
}
```

**Example:**
```json
{
  "date": "March 2018",
  "description": "Bears traded 2 first-round picks to Raiders for Khalil Mack",
  "teams": ["CHI_Bears", "OAK_Raiders"],
  "outcome": "worked",
  "similarity_score": 85,
  "key_difference": "Mack was younger (27) and had more guaranteed years"
}
```

### 3. EnhancedSuggestedTrade Interface

For rejected trades (grade < 70), include a detailed suggested improvement:

```typescript
interface EnhancedSuggestedTrade {
  description: string            // Summary of the suggested trade
  chicago_sends: TradeItem[]     // What Chicago should send
  chicago_receives: TradeItem[]  // What Chicago should receive
  value_balance: ValueBalance    // Value comparison
  cap_salary_notes: string       // Cap impact explanation
  why_this_works: string         // Reasoning for the suggestion
  likelihood: string             // "very likely" | "likely" | "possible" | "unlikely"
  historical_precedent: HistoricalPrecedent

  // Optional (for compatibility with legacy)
  type?: 'add_picks' | 'add_players' | 'remove_players' | 'restructure' | 'three_team'
  summary?: string
  reasoning?: string
  specific_suggestions?: string[]
  estimated_grade_improvement?: number
}

interface TradeItem {
  type: 'player' | 'pick' | 'prospect' | 'cash'
  name?: string        // For player/prospect
  position?: string    // For player/prospect
  year?: number        // For pick
  round?: number       // For pick
  amount?: number      // For cash
}

interface ValueBalance {
  chicago_value: number
  partner_value: number
  difference: number
  fair_value_range: [number, number]
}

interface HistoricalPrecedent {
  example_trades: string[]              // Example trade descriptions
  success_rate_for_structure: number    // % success for this type of trade
  realistic_because: string             // Why this is realistic
}
```

---

## Example Full Response

```json
{
  "grade": 45,
  "status": "rejected",
  "reasoning": "The Bears are significantly overpaying for a declining veteran...",
  "is_dangerous": false,
  "breakdown": {
    "talent_balance": 0.35,
    "contract_value": 0.25,
    "team_fit": 0.55,
    "future_assets": 0.40
  },
  "cap_analysis": "This trade would add $18M to Chicago's cap...",

  "historical_context": {
    "similar_trades": [
      {
        "date": "March 2020",
        "description": "Bears traded 4th-round pick for Nick Foles",
        "teams": ["CHI_Bears", "JAX_Jaguars"],
        "outcome": "failed",
        "similarity_score": 78,
        "key_difference": "Foles had worse contract but similar declining production"
      },
      {
        "date": "April 2018",
        "description": "Browns traded for Tyrod Taylor plus picks",
        "teams": ["CLE_Browns", "BUF_Bills"],
        "outcome": "neutral",
        "similarity_score": 65,
        "key_difference": "Taylor was acquired as a bridge, not a starter"
      }
    ],
    "success_rate": 28,
    "key_patterns": [
      "Teams overpaying for veterans over 30 rarely see playoff success",
      "QB trades with 2+ year contracts have 70% failure rate",
      "Draft capital is more valuable than aging starters"
    ],
    "why_this_fails_historically": "In the last 10 years, 72% of trades involving a 1st-round pick for a QB over 30 have resulted in the acquiring team missing the playoffs.",
    "what_works_instead": "Successful rebuilding teams typically target QBs under 28 with team control, or invest draft capital in developing their own."
  },

  "enhanced_suggested_trade": {
    "description": "Reduce the draft capital and add contract protections",
    "chicago_sends": [
      { "type": "pick", "year": 2026, "round": 2 },
      { "type": "pick", "year": 2027, "round": 4 }
    ],
    "chicago_receives": [
      { "type": "player", "name": "Example Player", "position": "QB" }
    ],
    "value_balance": {
      "chicago_value": 850,
      "partner_value": 920,
      "difference": -70,
      "fair_value_range": [800, 1000]
    },
    "cap_salary_notes": "This structure saves $4M in dead cap if the player declines",
    "why_this_works": "The reduced draft capital better reflects the player's age and injury history",
    "likelihood": "likely",
    "historical_precedent": {
      "example_trades": [
        "Similar to the 2021 Carson Wentz trade: Colts sent a conditional 2nd instead of 1st",
        "Matthew Stafford trade included multiple conditional protections"
      ],
      "success_rate_for_structure": 62,
      "realistic_because": "Teams have shown willingness to accept 2nd-round picks for veterans with questions"
    },
    "type": "restructure",
    "summary": "Lower the pick to a 2nd-rounder with conditions",
    "estimated_grade_improvement": 20
  }
}
```

---

## Priority

- **HIGH**: `historical_context.similar_trades` with similarity scores
- **HIGH**: `historical_context.why_this_fails_historically` for rejected trades
- **HIGH**: `historical_context.what_works_instead` for rejected trades
- **MEDIUM**: `enhanced_suggested_trade` with full structure
- **LOW**: `historical_context.key_patterns` bullet points

---

## Notes

1. **Backwards Compatibility**: Frontend supports BOTH legacy format (`historical_comparisons`, `suggested_trade`) AND new enhanced format. You can roll out gradually.

2. **Display Priority**: If BOTH formats are present, frontend prefers the enhanced format.

3. **Rejected Trades**: The `why_this_fails_historically` and `what_works_instead` fields are ONLY displayed for rejected trades (grade < 70).

4. **Similarity Scores**: Displayed as "X% match" badges on similar trade cards.

5. **Outcome Colors**:
   - `worked` = green badge
   - `failed` = red badge
   - `neutral` = yellow badge

---

## Questions?

Contact the frontend team or test at https://test.sportsmockery.com/gm
