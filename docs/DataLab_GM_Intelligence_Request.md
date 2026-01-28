# DataLab Request: GM Trade Simulator — Player Value Tiers

**From:** Claude Code (SM Frontend)
**Date:** January 28, 2026
**Priority:** HIGH

---

## Problem Summary

The GM Trade Simulator AI model (Claude Sonnet 4) grades trades 0-100 but still gives high grades (75-85) to unrealistic trades where the other team would never accept. The AI sees "Chicago gets a star" and grades it high, ignoring that the package is laughably insufficient.

**Current results:** 99 PASS, 28 WARN, 0 FAIL (78% accuracy)
**Target:** 90%+ accuracy

### Examples of the Problem

| Trade | AI Grade | Correct Grade | Issue |
|-------|----------|---------------|-------|
| Seth Jones → David Pastrnak | 85 | 0-15 | Pastrnak is elite, Jones is overpaid — Bruins never accept |
| Ian Happ → Jose Ramirez | 85 | 0-15 | Ramirez is perennial MVP, Happ is average — Guardians laugh |
| Justin Steele + 3rd → Elly De La Cruz | 85 | 0-15 | EDLC is generational, Steele + late pick is insulting |
| Taylor Hall + 1st → Tim Stutzle | 85 | 10-25 | Stutzle is franchise C, Hawks shouldn't trade 1st during rebuild |
| Garrett Crochet → Vladimir Guerrero Jr. | 85 | 10-25 | Vlad is franchise cornerstone, single SP not enough |
| Dansby Swanson → Corbin Carroll | 85 | 10-25 | Carroll is young cost-controlled star, Swanson is aging on big deal |

**Root cause:** The AI has no objective reference for player value. It knows names and positions but sometimes misjudges the gap between "solid starter" and "franchise cornerstone."

---

## What We Need from DataLab

### 1. New Table: `gm_player_value_tiers`

A table that assigns every rostered player across all 4 leagues a value tier. This gets injected into the AI prompt so it has an objective reference.

```sql
CREATE TABLE gm_player_value_tiers (
  id SERIAL PRIMARY KEY,
  player_name TEXT NOT NULL,
  team_key TEXT NOT NULL,           -- e.g., 'bears', 'lakers', 'bruins'
  league TEXT NOT NULL,             -- 'nfl', 'nba', 'nhl', 'mlb'
  position TEXT,
  tier INTEGER NOT NULL,            -- 1-6 (see below)
  tier_label TEXT NOT NULL,         -- human-readable
  trade_value_score INTEGER,        -- 1-100 estimated trade value
  is_untouchable BOOLEAN DEFAULT FALSE,
  notes TEXT,                       -- e.g., "on rookie deal", "injury history"
  season INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_gm_pvt_team ON gm_player_value_tiers(team_key);
CREATE INDEX idx_gm_pvt_league ON gm_player_value_tiers(league);
CREATE INDEX idx_gm_pvt_season ON gm_player_value_tiers(season);
```

### Tier Definitions

| Tier | Label | Description | Examples | Trade Value |
|------|-------|-------------|----------|-------------|
| **1** | Untouchable | Franchise cornerstones, generational talents | Mahomes, SGA, McDavid, Ohtani, Caleb Williams, Bedard | 95-100 |
| **2** | Franchise | Top-10 at position, All-Stars/All-Pro | Justin Jefferson, Jaylen Brown, Makar, Soto | 80-94 |
| **3** | Star | Top-25 at position, high-impact starters | Montez Sweat, Zach LaVine, Seth Jones, Justin Steele | 60-79 |
| **4** | Solid Starter | Reliable starters, average-to-good | Jaylon Johnson, Patrick Williams, Alex Vlasic, Ian Happ | 40-59 |
| **5** | Role Player | Rotational players, depth pieces | Kyler Gordon, Jason Dickinson, Jameson Taillon | 20-39 |
| **6** | Replacement | End-of-roster, aging vets past prime, negative contracts | Petr Mrazek, Ben Simmons | 1-19 |

### Population Priority

Start with these players (all players involved in our 100-trade test):

**Chicago Teams (all active roster):**
- Bears, Bulls, Blackhawks, Cubs, White Sox — full rosters

**Opponent players referenced in trades (minimum):**
- NFL: Jordan Love, Puka Nacua, Justin Jefferson, Sauce Gardner, Nick Bosa, Jaylen Waddle, Aidan Hutchinson, A.J. Brown, Josh Allen, Chris Jones, Tee Higgins, Davante Adams, DK Metcalf, Devon Witherspoon, Drake Maye, Travis Etienne, T.J. Watt, Jeffery Simmons, Kyle Pitts, Will Anderson Jr.
- NBA: LeBron James, Stephen Curry, Jaylen Brown, Devin Booker, Giannis, SGA, Michael Porter Jr., Julius Randle, Ben Simmons, De'Aaron Fox, Domantas Sabonis, Tyrese Haliburton, Scottie Barnes, Donovan Mitchell, Jaren Jackson Jr., Cade Cunningham, Dejounte Murray, Anfernee Simons, Brandon Miller, Jimmy Butler, Karl-Anthony Towns
- NHL: Auston Matthews, Connor McDavid, Cale Makar, Artemi Panarin, Nikita Kucherov, Filip Forsberg, Jason Robertson, Jaccob Slavin, Jack Hughes, Sam Reinhart, Mark Scheifele, J.T. Miller, Jordan Kyrou, Lucas Raymond, David Pastrnak, Kirill Kaprizov, Sidney Crosby, Drew Doughty, Anze Kopitar, Nazem Kadri, Tim Stutzle
- MLB: Shohei Ohtani, Juan Soto, Fernando Tatis Jr., Ronald Acuna Jr., Trea Turner, Yordan Alvarez, Corey Seager, Julio Rodriguez, Adley Rutschman, Wander Franco, Jose Ramirez, Francisco Lindor, Byron Buxton, Willy Adames, Corbin Carroll, Bryan Reynolds, Nolan Arenado, Logan Webb, Elly De La Cruz, CJ Abrams, Mookie Betts, Anthony Volpe, Rafael Devers, Jose Altuve, Bryce Harper, Michael Harris II, Manny Machado, Vladimir Guerrero Jr., Riley Greene, Bobby Witt Jr., Nolan Jones, Shane McClanahan, Jazz Chisholm Jr., Brent Rooker, Hunter Greene, Ke'Bryan Hayes, James Wood, Mike Trout, Pete Alonso

**Ideal long-term:** All ~3,500 rostered players across all 4 leagues with tiers assigned.

### Data Source Suggestions

- ESPN Player Ratings / QBR / PER / WAR
- Contract data (Spotrac, OTC) — big contract + low production = low tier
- Age + years of control (young + cheap = higher tier)
- All-Star / All-Pro / MVP selections
- Trade market comparables from recent real trades

### Update Frequency

- Weekly during season (tiers shift with injuries, trades, performance)
- Daily during trade deadline windows
- Cron: `gm_player_value_tiers` refresh

---

### 2. How SM Frontend Will Use This

When a trade is submitted, before calling the AI we will:

1. Look up both sides' players in `gm_player_value_tiers`
2. Sum the `trade_value_score` for each side
3. Inject a value context block into the AI prompt:

```
Player Value Context:
SENDING: Petr Mrazek (Tier 6: Replacement, value 12), 2026 3rd Round (~value 15)
  → Combined send value: ~27
RECEIVING: Jordan Kyrou (Tier 3: Star, value 65)
  → Combined receive value: ~65
VALUE GAP: Chicago receiving ~38 points MORE value than sending.
⚠ REALISM WARNING: The other team is sending significantly more value. This trade is likely unrealistic.
```

This gives the AI an objective anchor so it can't ignore the value gap.

### 3. Few-Shot Examples Table (Optional but Helpful)

A table of ~20 pre-graded example trades that get injected as few-shot examples:

```sql
CREATE TABLE gm_grading_examples (
  id SERIAL PRIMARY KEY,
  sport TEXT NOT NULL,
  chicago_team TEXT NOT NULL,
  trade_description TEXT NOT NULL,
  correct_grade INTEGER NOT NULL,
  reasoning TEXT NOT NULL,
  category TEXT NOT NULL  -- 'unrealistic_steal', 'fair_trade', 'overpay', 'untouchable', 'absurd'
);
```

**Example rows:**

| Category | Trade | Grade | Reasoning |
|----------|-------|-------|-----------|
| unrealistic_steal | Bears send Cole Kmet for Sauce Gardner | 8 | Gardner is elite All-Pro CB, Kmet is average TE — Jets would never accept |
| fair_trade | Bulls send LaVine + Vucevic for Fox + Sabonis | 72 | Blockbuster with fair value on both sides, both teams get what they need |
| overpay | Bears send Moore + 1st + 2nd for mid-tier LB | 25 | Massive overpay, giving up WR1 and premium picks for replaceable player |
| untouchable | Bears send Caleb Williams for anyone | 0 | Untouchable franchise QB on rookie deal |
| absurd | Bulls send Coby White for SGA | 5 | Laughable value gap, OKC hangs up immediately |

---

## Summary of What's Needed

| Item | Priority | Description |
|------|----------|-------------|
| `gm_player_value_tiers` table | **HIGH** | Player tiers (1-6) and trade value scores (1-100) |
| Populate Chicago + trade test players | **HIGH** | ~250 players minimum |
| Populate all league rosters | MEDIUM | ~3,500 players |
| `gm_grading_examples` table | MEDIUM | ~20 pre-graded examples |
| Weekly auto-update cron | LOW | Keep tiers current |

---

## Expected Outcome

With value tiers injected, the AI will see:
- "Petr Mrazek (value 12) for Jordan Kyrou (value 65) → GAP: 53 points → UNREALISTIC"
- Instead of: "Mrazek for Kyrou... hmm, getting a young winger sounds great! Grade: 85"

**Target:** 90%+ test accuracy (currently 78%).

---

*Request generated by Claude Code (SM Frontend)*
*Contact: Chris (project owner)*
