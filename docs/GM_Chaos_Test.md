# GM Trade Simulator — Chaos Test Results

> **Generated:** 2026-01-28T19:58:00.655Z
> **Environment:** test.sportsmockery.com
> **Purpose:** Try to break everything a Chicago fan could do

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Tests** | 109 |
| **Pass** | 52 |
| **Warn** | 32 |
| **Fail** | 25 |
| **Pass Rate** | 47.7% |
| **Fail Rate** | 22.9% |

---

## Section A: API Input Validation & Malformed Requests

**16 pass / 0 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| A1: Empty body | PASS | HTTP 400 |
| A2: Missing chicago_team | PASS | HTTP 400 |
| A3: Invalid chicago_team (packers) | PASS | HTTP 400 |
| A4: Empty players_sent array | PASS | HTTP 400 |
| A5: Empty players_received array | PASS | HTTP 400 |
| A6: Non-array players_sent (string) | PASS | HTTP 400 |
| A7: Null JSON body | PASS | HTTP 500 |
| A8: Malformed JSON body | PASS | HTTP 500 |
| A9: 50 players each side | PASS | HTTP 500 |
| A10: Player with empty name | PASS | HTTP 500 |
| A11: Player object missing name field | PASS | HTTP 500 |
| A12: GET to grade endpoint | PASS | HTTP 405 |
| A13: 1000-char partner name | PASS | HTTP 500 |
| A14: XSS in player name | PASS | Sanitized or handled safely |
| A15: SQL injection in chicago_team | PASS | HTTP 400 |
| A16: Non-string player name/position types | PASS | HTTP 500 |

---

## Section B: Edge Case Trades

**3 pass / 3 warn / 6 fail**

| Test | Status | Detail |
|------|--------|--------|
| B1: Trade with yourself (Bears to Bears) | PASS | HTTP 500, grade: N/A |
| B2: Same player both sides (DJ Moore for DJ Moore) | WARN | Grade: N/A |
| B3: Draft-picks-only trade (1st for two 2nds) | PASS | HTTP 400, grade: N/A |
| B4: 1-for-15 player trade | **FAIL** | Grade: N/A |
| B5: Entire starting 5 for one player (Bulls for LeBron) | **FAIL** | Grade: N/A |
| B6: Trade for retired player (Michael Jordan) | **FAIL** | Grade: N/A — AI should recognize retirement |
| B7: Fictional player (Johnny Sportsball) | **FAIL** | Grade: N/A |
| B8: Cross-sport trade (NFL player for NBA player) | WARN | Grade: N/A — should be near 0 |
| B9: Trade a head coach for a player | **FAIL** | Grade: N/A |
| B10: Both untouchables (Caleb Williams for Connor Bedard) | WARN | Grade: N/A — must be 0 |
| B11: Duplicate player in sent array | **FAIL** | Grade: N/A |
| B12: 10 first-round picks for one player | PASS | HTTP 400, grade: N/A |

---

## Section C: Rate Limiting & Concurrency

**0 pass / 1 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| C1: 3 simultaneous grade requests | WARN | Statuses: [500,500,500], 7266ms |

---

## Section D: Session & History Edge Cases

**2 pass / 4 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| D1: GET sessions unauthenticated | WARN | HTTP 200 |
| D2: Create session with invalid team | PASS | HTTP 400 |
| D3: GET trades unauthenticated | WARN | HTTP 200 |
| D4: DELETE trades unauthenticated | PASS | HTTP 401 |
| D5: GET leaderboard (public) | WARN | HTTP 401, entries: 0 |
| D6: Leaderboard filtered by team | WARN | HTTP 401, entries: 0 |

---

## Section E: Roster & Team Endpoint Edge Cases

**8 pass / 5 warn / 6 fail**

| Test | Status | Detail |
|------|--------|--------|
| E1: bears roster | **FAIL** | HTTP 401, 0 players |
| E1: bulls roster | **FAIL** | HTTP 401, 0 players |
| E1: blackhawks roster | **FAIL** | HTTP 401, 0 players |
| E1: cubs roster | **FAIL** | HTTP 401, 0 players |
| E1: whitesox roster | **FAIL** | HTTP 401, 0 players |
| E2: Invalid Chicago team (yankees) | WARN | HTTP 401 |
| E3: Roster with no team param | WARN | HTTP 401 |
| E4: Opponent roster (Packers) | **FAIL** | HTTP 401, 0 players |
| E5: Opponent roster with invalid sport (mls) | PASS | HTTP 401 |
| E6: Roster search (bears, "moore") | WARN | HTTP 401, 0 results |
| E7: Roster search with zero matches | WARN | HTTP 401, 0 results |
| E8: Roster position filter (QB) | WARN | HTTP 401, 0 results |
| E9: All teams endpoint | PASS | HTTP 200, 124 teams |
| E10: Teams by sport (nfl) | PASS | 32 teams |
| E10: Teams by sport (nba) | PASS | 30 teams |
| E10: Teams by sport (nhl) | PASS | 32 teams |
| E10: Teams by sport (mlb) | PASS | 30 teams |
| E11: Team search (lakers) | PASS | 1 results |
| E12: XSS in search parameter | PASS | HTTP 401 |

---

## Section F: Share Link & Public Endpoints

**5 pass / 0 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| F1: Non-existent share code | PASS | HTTP 404 |
| F2: Empty share code | PASS | HTTP 404 |
| F3: 200-char share code | PASS | HTTP 404 |
| F4: SQL injection in share code | PASS | HTTP 404 |
| F5: Real share code (6f5fd5caaa28) | PASS | HTTP 200, items: 2 |

---

## Section G: Cap Data Edge Cases

**1 pass / 3 warn / 5 fail**

| Test | Status | Detail |
|------|--------|--------|
| G1: Cap data bears (nfl) | **FAIL** | HTTP 401, cap: null |
| G1: Cap data bulls (nba) | **FAIL** | HTTP 401, cap: null |
| G1: Cap data blackhawks (nhl) | **FAIL** | HTTP 401, cap: null |
| G1: Cap data cubs (mlb) | **FAIL** | HTTP 401, cap: null |
| G1: Cap data whitesox (mlb) | **FAIL** | HTTP 401, cap: null |
| G2: Cap without team_key | WARN | HTTP 401 |
| G3: Cap without sport | WARN | HTTP 401 |
| G4: Cap with invalid sport (cricket) | PASS | HTTP 401 |
| G5: Opponent cap data (Packers) | WARN | HTTP 401, cap: null |

---

## Section H: AI Response Robustness

**1 pass / 0 warn / 6 fail**

| Test | Status | Detail |
|------|--------|--------|
| H1: Unicode player name (diacritics) | **FAIL** | Grade: N/A |
| H2: Emoji in player name | **FAIL** | Grade: N/A |
| H3: Prompt injection in player name | **FAIL** | Grade: N/A — should NOT be 100 |
| H4: Prompt injection in trade_partner | **FAIL** | Grade: N/A — should NOT be 99 |
| H5: Excessive notes field in player object | **FAIL** | Grade: N/A |
| H6: Whitespace-only player name | PASS | HTTP 500 |
| H7: Newlines/tabs in player name | **FAIL** | Grade: N/A |

---

## Section I: Cross-Sport Confusion

**0 pass / 1 warn / 2 fail**

| Test | Status | Detail |
|------|--------|--------|
| I1: Bears trade with Bulls (NFL↔NBA) | **FAIL** | Grade: N/A — should detect cross-sport |
| I2: Cubs trade with Blackhawks (MLB↔NHL) + untouchable | WARN | Grade: N/A |
| I3: White Sox receive NFL player from Yankees | **FAIL** | Grade: N/A |

---

## Section J: Homer Trades (Fan Delusion Tests)

**0 pass / 10 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| J1: BEARS homer — Cole Kmet (TE) for Patrick Mahomes (QB), Travis Kelce (TE) | WARN | Grade: N/A (expect 0-25) — TE for franchise QB + best TE ever |
| J2: BEARS homer — 2027 5th Round for Micah Parsons (LB) | WARN | Grade: N/A (expect 0-25) — Late pick for DPOY candidate |
| J3: BEARS homer — Velus Jones Jr. (WR) for Christian McCaffrey (RB) | WARN | Grade: N/A (expect 0-25) — Bust WR for All-Pro RB |
| J4: BULLS homer — Lonzo Ball (PG) for Jayson Tatum (SF) | WARN | Grade: N/A (expect 0-25) — Injured PG for MVP candidate |
| J5: BULLS homer — Andre Drummond (C) for Shai Gilgeous-Alexander (PG), Chet Holmgren (C) | WARN | Grade: N/A (expect 0-25) — Washed center for two franchise players |
| J6: BLACKHAWKS homer — Petr Mrazek (G) for Connor McDavid (C), Leon Draisaitl (C) | WARN | Grade: N/A (expect 0-25) — Aging goalie for two best players in NHL |
| J7: CUBS homer — Jameson Taillon (SP) for Shohei Ohtani (DH), Mookie Betts (SS), Freddie Freeman (1B) | WARN | Grade: N/A (expect 0-25) — Mid SP for three superstars |
| J8: WHITESOX homer — Andrew Vaughn (1B) for Aaron Judge (RF), Juan Soto (RF) | WARN | Grade: N/A (expect 0-25) — Average 1B for two MVPs |
| J9: BEARS homer — Nate Davis (G) for Lamar Jackson (QB) | WARN | Grade: N/A (expect 0-25) — Bad OG for reigning MVP |
| J10: BULLS homer — 2027 2nd Round for Nikola Jokic (C) | WARN | Grade: N/A (expect 0-25) — Late 2nd for 3x MVP |

---

## Section K: Draft Pick Edge Cases

**5 pass / 0 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| K1: Draft pick from year 2099 | PASS | HTTP 400, grade: N/A |
| K2: Draft pick round 0 | PASS | HTTP 400 |
| K3: Negative draft pick year | PASS | HTTP 400 |
| K4: Protected draft pick with condition | PASS | Grade: N/A |
| K5: 20 draft picks (all rounds for MLB) | PASS | HTTP 400, grade: N/A |

---

## Section L: Error Logging Endpoint

**0 pass / 3 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| L1: Log test error | WARN | HTTP 500 |
| L2: Fetch recent errors | WARN | HTTP 401 |
| L3: XSS in error message | WARN | HTTP 500 |

---

## Section M: Database Integrity

**11 pass / 2 warn / 0 fail**

| Test | Status | Detail |
|------|--------|--------|
| M1: bears has active roster | PASS | 81 players |
| M1: bulls has active roster | PASS | 18 players |
| M1: blackhawks has active roster | PASS | 20 players |
| M1: cubs has active roster | PASS | 40 players |
| M1: whitesox has active roster | PASS | 40 players |
| M2: gm_nfl_rosters | PASS | 2463 active players |
| M2: gm_nba_rosters | PASS | 510 active players |
| M2: gm_nhl_rosters | PASS | 840 active players |
| M2: gm_mlb_rosters | PASS | 1095 active players |
| M3: gm_leaderboard accessible | PASS | 2 entries |
| M4: gm_league_teams count | PASS | 124 (expect 124) |
| M5: Orphaned trade items check | WARN | exec_sql not available — skipped |
| M6: Bears headshot coverage | WARN | 0/10 have headshots |

---

## Failures Summary

- **B4: 1-for-15 player trade**: Grade: N/A
- **B5: Entire starting 5 for one player (Bulls for LeBron)**: Grade: N/A
- **B6: Trade for retired player (Michael Jordan)**: Grade: N/A — AI should recognize retirement
- **B7: Fictional player (Johnny Sportsball)**: Grade: N/A
- **B9: Trade a head coach for a player**: Grade: N/A
- **B11: Duplicate player in sent array**: Grade: N/A
- **E1: bears roster**: HTTP 401, 0 players
- **E1: bulls roster**: HTTP 401, 0 players
- **E1: blackhawks roster**: HTTP 401, 0 players
- **E1: cubs roster**: HTTP 401, 0 players
- **E1: whitesox roster**: HTTP 401, 0 players
- **E4: Opponent roster (Packers)**: HTTP 401, 0 players
- **G1: Cap data bears (nfl)**: HTTP 401, cap: null
- **G1: Cap data bulls (nba)**: HTTP 401, cap: null
- **G1: Cap data blackhawks (nhl)**: HTTP 401, cap: null
- **G1: Cap data cubs (mlb)**: HTTP 401, cap: null
- **G1: Cap data whitesox (mlb)**: HTTP 401, cap: null
- **H1: Unicode player name (diacritics)**: Grade: N/A
- **H2: Emoji in player name**: Grade: N/A
- **H3: Prompt injection in player name**: Grade: N/A — should NOT be 100
- **H4: Prompt injection in trade_partner**: Grade: N/A — should NOT be 99
- **H5: Excessive notes field in player object**: Grade: N/A
- **H7: Newlines/tabs in player name**: Grade: N/A
- **I1: Bears trade with Bulls (NFL↔NBA)**: Grade: N/A — should detect cross-sport
- **I3: White Sox receive NFL player from Yankees**: Grade: N/A

---

## Warnings Summary

- B2: Same player both sides (DJ Moore for DJ Moore): Grade: N/A
- B8: Cross-sport trade (NFL player for NBA player): Grade: N/A — should be near 0
- B10: Both untouchables (Caleb Williams for Connor Bedard): Grade: N/A — must be 0
- C1: 3 simultaneous grade requests: Statuses: [500,500,500], 7266ms
- D1: GET sessions unauthenticated: HTTP 200
- D3: GET trades unauthenticated: HTTP 200
- D5: GET leaderboard (public): HTTP 401, entries: 0
- D6: Leaderboard filtered by team: HTTP 401, entries: 0
- E2: Invalid Chicago team (yankees): HTTP 401
- E3: Roster with no team param: HTTP 401
- E6: Roster search (bears, "moore"): HTTP 401, 0 results
- E7: Roster search with zero matches: HTTP 401, 0 results
- E8: Roster position filter (QB): HTTP 401, 0 results
- G2: Cap without team_key: HTTP 401
- G3: Cap without sport: HTTP 401
- G5: Opponent cap data (Packers): HTTP 401, cap: null
- I2: Cubs trade with Blackhawks (MLB↔NHL) + untouchable: Grade: N/A
- J1: BEARS homer — Cole Kmet (TE) for Patrick Mahomes (QB), Travis Kelce (TE): Grade: N/A (expect 0-25) — TE for franchise QB + best TE ever
- J2: BEARS homer — 2027 5th Round for Micah Parsons (LB): Grade: N/A (expect 0-25) — Late pick for DPOY candidate
- J3: BEARS homer — Velus Jones Jr. (WR) for Christian McCaffrey (RB): Grade: N/A (expect 0-25) — Bust WR for All-Pro RB
- J4: BULLS homer — Lonzo Ball (PG) for Jayson Tatum (SF): Grade: N/A (expect 0-25) — Injured PG for MVP candidate
- J5: BULLS homer — Andre Drummond (C) for Shai Gilgeous-Alexander (PG), Chet Holmgren (C): Grade: N/A (expect 0-25) — Washed center for two franchise players
- J6: BLACKHAWKS homer — Petr Mrazek (G) for Connor McDavid (C), Leon Draisaitl (C): Grade: N/A (expect 0-25) — Aging goalie for two best players in NHL
- J7: CUBS homer — Jameson Taillon (SP) for Shohei Ohtani (DH), Mookie Betts (SS), Freddie Freeman (1B): Grade: N/A (expect 0-25) — Mid SP for three superstars
- J8: WHITESOX homer — Andrew Vaughn (1B) for Aaron Judge (RF), Juan Soto (RF): Grade: N/A (expect 0-25) — Average 1B for two MVPs
- J9: BEARS homer — Nate Davis (G) for Lamar Jackson (QB): Grade: N/A (expect 0-25) — Bad OG for reigning MVP
- J10: BULLS homer — 2027 2nd Round for Nikola Jokic (C): Grade: N/A (expect 0-25) — Late 2nd for 3x MVP
- L1: Log test error: HTTP 500
- L2: Fetch recent errors: HTTP 401
- L3: XSS in error message: HTTP 500
- M5: Orphaned trade items check: exec_sql not available — skipped
- M6: Bears headshot coverage: 0/10 have headshots

---

*Report generated by scripts/test-gm-chaos.mjs*
