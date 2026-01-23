# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** January 23, 2026
> **Test Target:** https://test.sportsmockery.com/api/ask-ai
> **Total Questions:** 100
> **Pass:** 50 | **Fail:** 50

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| NAME_OR_CLASSIFICATION_FAIL | 5 | High |
| SPEC_VIOLATION_PRONOUN_RESOLUTION | 22 | High |
| NO_TABLE_FOR_STATS | 36 | Medium |

---

## [01/23/2026 10:09 CST] - Q1: NAME_OR_CLASSIFICATION_FAIL

**User prompt(s):**
1. ""...""

**Ask AI answer (relevant excerpt):**
> "Could not determine team or sport from question"

**Source:** `classification_error`

**Expected behavior:**
- Should recognize Chicago players/teams from typos
- Should silently correct misspellings, not call them out

**What went wrong:**
- NAME_OR_CLASSIFICATION_FAIL

**Severity:** High

**Suggested fix:**
- Improve name normalization in classifier
---

## [01/23/2026 10:09 CST] - Q2: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many total yards did he have that same season?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q3: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many games did he miss last year?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q4: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "What were his passing yards game by game last season?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q5: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many interceptions did he throw in his rookie year, and in which games did they happen?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q7: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many games did he miss?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q8: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many sacks did the Bears defense have last season and who led the team?"

**Ask AI answer (relevant excerpt):**
> "The Bears defense recorded **35 sacks** in the 2025 regular season, with **Montez Sweat and Gervon Dexter Sr.** tied for the team lead at 17 each."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q9: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How did the Bears offense rank in EPA per play and points per game last year?"

**Ask AI answer (relevant excerpt):**
> "The Bears' offense in 2025 put up **25.9 points per game (9th in the NFL)**, a solid leap that had us dreaming of playoffs instead of our usual Soldier Field therapy sessions. EPA per play landed at **+0.07 (7th in the league)** per SumerSports' advanced metrics, ranking them **80.50 overall (also 7..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q11: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How much does the Hawk at Soldier Field actually affect passing stats for the Bears and their opponents?"

**Ask AI answer (relevant excerpt):**
> "The **Hawk**—that swirling, bone-chilling wind tunnel off Lake Michigan that turns Soldier Field into a frozen meat locker—is Chicago sports' ultimate trash-talking teammate, but it doesn't trash passing stats quite as brutally as Bears fans like to hype. Data from recent seasons shows Bears passers..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q14: NAME_OR_CLASSIFICATION_FAIL

**User prompt(s):**
1. "Historically, how have warm-weather or dome teams (like the Rams or Saints) performed in cold, windy games at Soldier?"

**Ask AI answer (relevant excerpt):**
> "Could not determine team or sport from question"

**Source:** `classification_error`

**Expected behavior:**
- Should recognize Chicago players/teams from typos
- Should silently correct misspellings, not call them out

**What went wrong:**
- NAME_OR_CLASSIFICATION_FAIL

**Severity:** High

**Suggested fix:**
- Improve name normalization in classifier
---

## [01/23/2026 10:09 CST] - Q20: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "If the Bears are 3-point home underdogs in a December game at Soldier, what factors should fans consider when looking at that line?"

**Ask AI answer (relevant excerpt):**
> "Hey Bears fan, your question got mangled by a database glitch that only handles straight stat pulls—no hypotheticals or "what ifs" like this one."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q21: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many tds did caleb willams have this yr?"

**Ask AI answer (relevant excerpt):**
> "Caleb went absolutely nuclear this year with **33 total touchdowns** — 29 passing, 3 rushing, and 1 receiving. That receiving TD was chef's kiss too: he became the first starting QB with multiple receptions in a game since 1953, and the first Bears QB to do it alongside multiple passing TDs since Ji..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q22: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many YDs did he have?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q23: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many ints did he throw?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q24: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many times did he get sacked last yr?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q25: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many games did he win when the temp was under 30?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q28: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "What was his qbr and passer rtg last season?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q30: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many rd zone trips did the bears avg a game?"

**Ask AI answer (relevant excerpt):**
> "I see the confusion—you're asking about **red zone trips** (times the Bears entered the opponent's 20-yard line), but that stat wasn't captured in the search results I have available."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q31: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many points, rebounds, and assists did DeMar DeRozan average last season for the Bulls?"

**Ask AI answer (relevant excerpt):**
> "I need to clarify something important: **DeMar DeRozan is no longer on the Bulls** — he was traded to the Sacramento Kings before the 2024-25 season."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q32: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many games did he play and how many did he miss?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q33: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many threes per game did he average, and what was his 3-point percentage?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q34: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What was Zach LaVine's stat line last season (PPG, REB, AST, TS%)?"

**Ask AI answer (relevant excerpt):**
> "I see the issue – you're asking about Zach LaVine's stats, but the search results show he's now on the **Sacramento Kings**, not the Bulls. Let me clarify what you're looking for!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q36: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many clutch games (within 5 points in the last 5 minutes) did the Bulls win and lose?"

**Ask AI answer (relevant excerpt):**
> "Based on the search results, I can provide you with clutch game information, though the data is from different time periods: **2023-24 Season (March 2024):** According to Bleacher Nation, the Chicago Bulls had a **20-15 record in clutch games** (defined as games within 5 points with 5 minutes remain..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q38: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Compare this Bulls team to the Derrick Rose era in terms of style and ceiling."

**Ask AI answer (relevant excerpt):**
> "Look, comparing this 2025-26 Bulls squad to the **Derrick Rose era** is basically comparing a rebuilding project to a legitimate championship contender—and it's not a fun comparison for Bulls fans. ## Style: Night and Day The Rose-era Bulls (2008-2012) were built around **elite perimeter defense, pa..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q43: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What did Derozen avg last yr for pts, rebs, and asts?"

**Ask AI answer (relevant excerpt):**
> "I couldn't quite parse your question – looks like there was a technical hiccup on my end! Let me clarify what you're asking:"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q44: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many 3s did he avg?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q45: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "Was his ts% better or worse than his spurs years?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q46: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many games did he miss?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q48: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Is this bulls team closer to the baby bulls or the rose mvp era?"

**Ask AI answer (relevant excerpt):**
> "This current Bulls squad in 2025-26 feels a lot **closer to the Baby Bulls era**—that young, draft-heavy core from around 2019-2023—than the star-powered Derrick Rose MVP peak of 2010-11. Here's why, breaking it down like a true Bulls fan would: The roster's packed with homegrown talents like **Coby..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q49: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many home runs did the Cubs' leading hitter have last season, and what was his OPS?"

**Ask AI answer (relevant excerpt):**
> "I can answer that! **Michael Busch led the Cubs with 34 home runs in 2025, and his OPS was .866**."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q50: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many wins did the Cubs finish with and where did they rank in the NL Central?"

**Ask AI answer (relevant excerpt):**
> "The **Cubs finished the 2025 season with 92 wins** and placed **2nd in the NL Central**, five games behind the Milwaukee Brewers. The Cubs went 92-70 overall, putting up some solid offensive numbers—they ranked 3rd in home runs with 223 and had the 6th-best ERA on the pitching side at 3.79. They dom..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q55: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How good was the Cubs' starting rotation last year (ERA, FIP, strikeout rates)?"

**Ask AI answer (relevant excerpt):**
> "Hey buddy, looks like there was a database hiccup pulling the exact "cubs_games" table, but I can still hook you up with solid 2025 Cubs rotation stats from reliable sources like FanGraphs and FOX Sports."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q56: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How often did the bullpen blow saves, and how did that compare to league average?"

**Ask AI answer (relevant excerpt):**
> "The **Cubs bullpen blew 20 saves** in the 2025 regular season out of 64 opportunities, good for a **68.8% save percentage**—which was actually right around league average, not some South Side-level catastrophe. They ranked tied for 18th in blown saves league-wide, with worse teams like the Angels (3..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q62: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "What was his avg and ops?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q63: NAME_OR_CLASSIFICATION_FAIL

**User prompt(s):**
1. "Did the pen still blow a ton of saves this season?"

**Ask AI answer (relevant excerpt):**
> "Could not determine team or sport from question"

**Source:** `classification_error`

**Expected behavior:**
- Should recognize Chicago players/teams from typos
- Should silently correct misspellings, not call them out

**What went wrong:**
- NAME_OR_CLASSIFICATION_FAIL

**Severity:** High

**Suggested fix:**
- Improve name normalization in classifier
---

## [01/23/2026 10:09 CST] - Q64: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How do they play when the wind is blowing in vs blowing out?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q66: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "What was their team ERA and OPS, and what does that say about their strengths/weaknesses?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q70: NAME_OR_CLASSIFICATION_FAIL

**User prompt(s):**
1. "Is the front office actually committed to spending when the next contention window opens?"

**Ask AI answer (relevant excerpt):**
> "Could not determine team or sport from question"

**Source:** `classification_error`

**Expected behavior:**
- Should recognize Chicago players/teams from typos
- Should silently correct misspellings, not call them out

**What went wrong:**
- NAME_OR_CLASSIFICATION_FAIL

**Severity:** High

**Suggested fix:**
- Improve name normalization in classifier
---

## [01/23/2026 10:09 CST] - Q75: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many homers and rbis did the sox best hitter have last yr?"

**Ask AI answer (relevant excerpt):**
> "Hey buddy, I think you meant the **White Sox** (Chicago's South Siders), but the query glitched out on a database technicality—happens sometimes with team lookups. Try rephrasing it clearer like this to nail down their **best hitter** by HRs or RBIs in 2025:"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q76: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "Was their era and whip as bad as it felt watching them?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q77: NAME_OR_CLASSIFICATION_FAIL

**User prompt(s):**
1. "Is this another fake "retool" or a real rebuild?"

**Ask AI answer (relevant excerpt):**
> "Could not determine team or sport from question"

**Source:** `classification_error`

**Expected behavior:**
- Should recognize Chicago players/teams from typos
- Should silently correct misspellings, not call them out

**What went wrong:**
- NAME_OR_CLASSIFICATION_FAIL

**Severity:** High

**Suggested fix:**
- Improve name normalization in classifier
---

## [01/23/2026 10:09 CST] - Q78: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many goals, assists, and points did Connor Bedard have last season for the Blackhawks?"

**Ask AI answer (relevant excerpt):**
> "Connor Bedard posted **23 goals, 44 assists, and 67 points** in his sophomore season (2024-25) with the Blackhawks, playing all 82 games despite the team's rough rebuild. That marked a slight bump from his Calder-winning rookie year (22G-39A-61P in 68GP), where he lit up the league as an 18-year-old..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q79: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How did his expected goals (xG) compare to his actual goals?"

**Ask AI answer (relevant excerpt):**
> "I appreciate the question, but I need to let you know that **the search results don't contain specific expected goals (xG) data** for any Chicago player. The results focus on 2026 season projections and win-loss predictions for the White Sox, Blackhawks, and Cubs, but they don't include the advanced..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q80: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Where did the Hawks finish in the standings and how did their goal differential look?"

**Ask AI answer (relevant excerpt):**
> "I got your question about the Hawks standings—there was just a technical hiccup on my end. Here's what you're looking for:"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q81: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How did the Hawks' Corsi and expected goals metrics look at 5-on-5?"

**Ask AI answer (relevant excerpt):**
> "The Chicago Blackhawks' **5-on-5 Corsi and expected goals metrics** for the 2025-26 season are available via MoneyPuck's advanced stats dashboard, which tracks these possession and chance quality indicators league-wide. According to MoneyPuck.com, you can view the Hawks' **team Corsi For %** (shot a..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q82: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How does the Bedard era so far compare to the beginning of the Toews/Kane era?"

**Ask AI answer (relevant excerpt):**
> "Man, comparing the early **Bedard era** to the dawn of the **Toews/Kane dynasty** is like pitting a solo act against a tag-team that immediately started stacking Cups—it's night and day, but with some eerie parallels in the hype and heartbreak that define us Chicago fans. **Bedard's start (2023-26 s..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q88: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What did conner bedard do this yr in g, a, and pts?"

**Ask AI answer (relevant excerpt):**
> "Hey, I got what you were asking about Connor Bedard's **goals (G)**, **assists (A)**, and **points (P)** this year, but the database glitched on the query format - no biggie!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/23/2026 10:09 CST] - Q89: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many sogs did he avg?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q90: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "Were his xg and actual snipes close or was he over/underperforming?"

**Ask AI answer (relevant excerpt):**
> "Hey there! Looks like you're asking a follow-up, but I'm not sure who you're referring to. Which Chicago player are you asking about? Drop their name and I'll get you the stats."

**Source:** `pronoun_resolution_needed`

**Expected behavior:**
- Stats questions should include markdown tables
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- NO_TABLE_FOR_STATS
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
- Apply sessionContext to resolve pronouns before query processing
---

## [01/23/2026 10:09 CST] - Q99: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "As a casual fan, what are the 5 key stats I should know to sound smart about Bears, Bulls, Cubs, Sox, and Hawks?"

**Ask AI answer (relevant excerpt):**
> "Here are five key stats that'll make you sound like you actually follow Chicago sports: **Bears: 11 championships**
The Bears have won the most titles of any Chicago team with 11 total, including their legendary 1985 Super Bowl XX team that went 15-1 and dominated everyone 46-10. That's the foundati..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

