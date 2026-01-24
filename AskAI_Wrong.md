# Ask AI (Scout) - QA Test Failure Log

> **Test Date:** January 24, 2026
> **Test Target:** https://test.sportsmockery.com/api/ask-ai
> **Total Questions:** 100
> **Pass:** 63 | **Fail:** 37

---

## Summary of Failures

| Issue Type | Count | Severity |
|------------|-------|----------|
| NO_TABLE_FOR_STATS | 36 | Medium |
| SPEC_VIOLATION_PRONOUN_RESOLUTION | 6 | High |

---

## [01/24/2026 17:25 CST] - Q4: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What were his passing yards game by game last season?"

**Ask AI answer (relevant excerpt):**
> "```json
{ "text": "Alright, here's Caleb's week-by-week passing yards from the 2024 season. The kid had some absolute *nuclear* games mixed in with some rough outings—which is pretty normal for a rookie dealing with Matt Eberflus's offensive scheme and getting sacked 68 times (oof). His best game wa..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q5: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many interceptions did he throw in his rookie year, and in which games did they happen?"

**Ask AI answer (relevant excerpt):**
> "Hey Bears fan, that query hit a snag because it didn't specify which QB ("he") you're talking about—I'm guessing Caleb Williams from his 2024 rookie year, but the database couldn't run without a clear player name."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q8: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many sacks did the Bears defense have last season and who led the team?"

**Ask AI answer (relevant excerpt):**
> "The Bears defense recorded **35 sacks** in the 2025 regular season, with **Montez Sweat** leading the team at 17 sacks (tied with Gervon Dexter Sr.)."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q9: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How did the Bears offense rank in EPA per play and points per game last year?"

**Ask AI answer (relevant excerpt):**
> "The Bears offense finally showed up in 2025, averaging **25.9 points per game** (9th in the NFL) and **24.0 points per game** in their postseason stats after an 11-6 regular season that clinched the NFC North. That's a massive glow-up from the tire fire years—remember when we were lucky to crack 17?..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q11: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How much does the Hawk at Soldier Field actually affect passing stats for the Bears and their opponents?"

**Ask AI answer (relevant excerpt):**
> "The **Hawk**—that infamous wind tunnel whipping through Soldier Field off Lake Michigan—gets hyped like it's the Bears' 12th man, but the data says it messes with everybody pretty equally, without giving Chicago a massive home-field edge on passing stats. Looking at the Bears' 2025 season (11-6, NFC..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q16: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Compare the 2025 Bears offense to the 2018 Bears offense in terms of efficiency and points."

**Ask AI answer (relevant excerpt):**
> "The **2025 Bears offense crushed the 2018 version** in both efficiency metrics and points scored, turning Chicago from a run-heavy, QB-question-mark unit into a modern, explosive machine that finally lived up to the hype. Back in 2018, Nagy's "explosive" offense was more promise than reality: they a..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q20: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "If the Bears are 3-point home underdogs in a December game at Soldier, what factors should fans consider when looking at that line?"

**Ask AI answer (relevant excerpt):**
> "Hey Bears fan, your question was sharp but hit a snag since I can only pull straight stats queries—not run hypotheticals or predictions like this one."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q21: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many tds did caleb willams have this yr?"

**Ask AI answer (relevant excerpt):**
> "Caleb Williams has 33 total TDs this year - 29 passing, 3 rushing, and even snagged 1 receiving TD. Kid's putting up dual-threat numbers like a true Bears savior, even if the D couldn't seal the deal in that Rams heartbreaker."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q22: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many YDs did he have?"

**Ask AI answer (relevant excerpt):**
> "I don't have the exact total yards data for Caleb Williams right in front of me from the database, but reports show he put up a franchise-record **4,030 total yards** (passing plus rushing) this season, smashing past Erik Kramer's old passing mark and eyeing 4,000 passing. Dude's been cooking with *..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q23: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many ints did he throw?"

**Ask AI answer (relevant excerpt):**
> "Hey, Bears fan, your question "How many ints did he throw?" is solid Bears slang for interceptions (picks/INTs), but it tripped up the database 'cause it's too vague on **who** ("he" could be Caleb, Tyson, or anybody) and any context like season or games."

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

## [01/24/2026 17:25 CST] - Q28: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What was his qbr and passer rtg last season?"

**Ask AI answer (relevant excerpt):**
> "Caleb Williams posted an average QBR of **43.67** and average passer rating of **87.76** across 17 games last season (2025). Dude started every game, threw for nearly 4K yards with 27 TDs and just 7 picks—solid rookie-to-sophomore jump, even if the QBR's a bit rough around the edges like most young ..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q30: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many rd zone trips did the bears avg a game?"

**Ask AI answer (relevant excerpt):**
> "Hey Bears fan, that "rd zone trips" query hit a snag with a division by zero error—likely because the database couldn't find red zone trip data (that's **red zone trips**, meaning offensive drives entering the opponent's 20-yard line) or the team played zero games in the filtered view."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q31: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many points, rebounds, and assists did DeMar DeRozan average last season for the Bulls?"

**Ask AI answer (relevant excerpt):**
> "I see the issue—you're asking about DeMar DeRozan's stats with the Bulls, but he's not on the Bulls anymore."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q33: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many threes per game did he average, and what was his 3-point percentage?"

**Ask AI answer (relevant excerpt):**
> "Hey, fellow Bulls fan! The search results don't specify an exact player for "he," but looking at the 2025-26 Chicago Bulls stats, **Matas Buzelis** leads the team in total threes made with 81 so far (through 44 games), which works out to about **1.8 threes per game** according to StatMuse's tracking..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q34: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What was Zach LaVine's stat line last season (PPG, REB, AST, TS%)?"

**Ask AI answer (relevant excerpt):**
> "Hey buddy, your question was crystal clear but hit a technical issue—let's pivot to "last season" meaning 2024-25 Bulls stats (LaVine's final Bulls year before the Kings trade)."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q36: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many clutch games (within 5 points in the last 5 minutes) did the Bulls win and lose?"

**Ask AI answer (relevant excerpt):**
> "**In the 2023-24 NBA season, the Chicago Bulls went 20-15 in clutch games—defined as games within 5 points with 5 minutes remaining—winning 20 and losing 15.** This tied them for the league lead in clutch wins with the Denver Nuggets and Milwaukee Bucks, despite their overall 29-32 record at that po..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q38: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Compare this Bulls team to the Derrick Rose era in terms of style and ceiling."

**Ask AI answer (relevant excerpt):**
> "Man, comparing this 2025-26 Bulls squad—sitting at 22-22 and scrapping for that third spot in the Central—to the Derrick Rose era is like pitting a gritty bar fight against a fireworks show. The Rose teams (2010-13 peak) were all about **explosive, transition-fueled chaos** driven by D-Rose's MVP su..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q43: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What did Derozen avg last yr for pts, rebs, and asts?"

**Ask AI answer (relevant excerpt):**
> "Hey buddy, looks like there was a database hiccup with that Bulls game ID column—probably 'cause Derozen left the Bulls after last season (2024-25). I got you covered with his actual **2024-25 averages**: **22.2 PTS, 3.9 REB, 4.4 AST** over 77 games."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q44: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many 3s did he avg?"

**Ask AI answer (relevant excerpt):**
> "Zach LaVine's the Bulls' all-time leader in career threes made with **1,130**, but if you're asking about his **3s per game average**, that's around **2.8** over his Chicago tenure—solid volume for a guy who's carried the offense through some lean years. Look, in Chicago sports, we Bulls fans know h..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q45: SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "Was his ts% better or worse than his spurs years?"

**Ask AI answer (relevant excerpt):**
> "I appreciate the question, but I need to let you know what's happening here: **your query references a specific player and their true shooting percentage (TS%), but doesn't tell me who that player is** or which years you're comparing. Based on the search results provided, I can see references to sev..."

**Source:** `ai`

**Expected behavior:**
- Should resolve pronouns (he/his/they) from session context

**What went wrong:**
- SPEC_VIOLATION_PRONOUN_RESOLUTION

**Severity:** Medium

**Suggested fix:**
- Apply sessionContext to resolve pronouns before query processing
---

## [01/24/2026 17:25 CST] - Q48: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Is this bulls team closer to the baby bulls or the rose mvp era?"

**Ask AI answer (relevant excerpt):**
> "Hey, that's a classic opinion-based question—I can only hit you with stats, not tell you if this squad's more "Baby Bulls" vibes or peak Rose MVP fire!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q49: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many home runs did the Cubs' leading hitter have last season, and what was his OPS?"

**Ask AI answer (relevant excerpt):**
> "**Michael Busch** led the Cubs in home runs during the 2025 season with **34 homers** and posted an **OPS of .866**. Busch had a monster year at the plate, finishing with 90 RBIs and a .261 batting average across 155 games. He was a major offensive force for the Cubs, and that .866 OPS reflects the ..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q50: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many wins did the Cubs finish with and where did they rank in the NL Central?"

**Ask AI answer (relevant excerpt):**
> "The **Cubs finished the 2025 season with 92 wins and 70 losses, placing them 2nd in the NL Central**, 5 games behind the Milwaukee Brewers. It was a solid regular season for the North Siders—good enough to earn a Wild Card berth, which they rode all the way through the Wild Card Series against the P..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q55: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How good was the Cubs' starting rotation last year (ERA, FIP, strikeout rates)?"

**Ask AI answer (relevant excerpt):**
> "Hey, looks like your query hit a technical issue—probably too broad for the system to pull those exact rotation stats cleanly. Try narrowing it to the full team staff or a specific starter instead!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q62: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "What was his avg and ops?"

**Ask AI answer (relevant excerpt):**
> "Hey, that query was too vague—I need to know **who** "his" refers to, which team (Cubs/White Sox for **OPS**, Bears for other stats), and what time frame (season, specific games, etc.)!"

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

## [01/24/2026 17:25 CST] - Q66: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What was their team ERA and OPS, and what does that say about their strengths/weaknesses?"

**Ask AI answer (relevant excerpt):**
> "Hey, your question got tripped up because it didn't specify which team (Cubs or Sox?) or season (regular or playoffs?), and I couldn't pull full team stats from the database—try being more specific with that!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q75: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many homers and rbis did the sox best hitter have last yr?"

**Ask AI answer (relevant excerpt):**
> "Hey, I think you meant the **White Sox** best hitter (not Boston Red Sox), but the query got mangled into something the database couldn't handle—happens with vague "best hitter" stuff. Try being more specific on the player or leader!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q76: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Was their era and whip as bad as it felt watching them?"

**Ask AI answer (relevant excerpt):**
> "Hey, looks like your question tripped a database glitch—I think you're asking about the **White Sox** pitching staff's **ERA** and **WHIP** from last season (it felt brutal watching those guys get shelled, right?). Try rephrasing it clearer like this:"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q78: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How many goals, assists, and points did Connor Bedard have last season for the Blackhawks?"

**Ask AI answer (relevant excerpt):**
> "Connor Bedard lit up the ice last season (2024-25) with **23 goals, 44 assists, and 67 points** in 82 games for the Blackhawks—that's the career-high sophomore mark he's already on pace to crush in this 2025-26 campaign. Kid's a walking highlight reel, basically carrying Chicago hockey on his back w..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q79: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How did his expected goals (xG) compare to his actual goals?"

**Ask AI answer (relevant excerpt):**
> "I appreciate the question, but I need to call a timeout here—the search results don't contain enough specific information to give you a solid answer about expected goals versus actual goals for any particular Chicago player. The only xG reference in the results mentions the **Seattle Kraken** (not a..."

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

## [01/24/2026 17:25 CST] - Q80: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "Where did the Hawks finish in the standings and how did their goal differential look?"

**Ask AI answer (relevant excerpt):**
> "The Blackhawks are sitting at **6th in the Central Division** after 50 games with a record of **21-22-7** (49 points), and their goal differential is **-18** (139 goals for, 157 against). They're right in that familiar Chicago hockey purgatory—not bad enough to tank for a draft lottery miracle, but ..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q81: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How did the Hawks' Corsi and expected goals metrics look at 5-on-5?"

**Ask AI answer (relevant excerpt):**
> "Hey there, fellow Hawks fan! You're asking about the Chicago **Blackhawks' 5-on-5 Corsi and expected goals metrics**—those are key advanced stats like Corsi (shot attempt share) and xG (expected goals based on shot quality) that tell us how they're controlling play at even strength. The best spot fo..."

**Source:** `web_fallback`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q82: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "How does the Bedard era so far compare to the beginning of the Toews/Kane era?"

**Ask AI answer (relevant excerpt):**
> "Connor Bedard's start with the Blackhawks is statistically more impressive than Jonathan Toews and Patrick Kane's debuts, but the context tells a very different story about Chicago hockey. **The Raw Numbers Favor Bedard** Through his first three seasons, Bedard has posted 61 points as a rookie, 67 p..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q88: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "What did conner bedard do this yr in g, a, and pts?"

**Ask AI answer (relevant excerpt):**
> "I got it—you're asking about **Connor Bedard's stats this season**, but I had a database hiccup. No worries, I've got the data from the live sources!"

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

## [01/24/2026 17:25 CST] - Q89: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "How many sogs did he avg?"

**Ask AI answer (relevant excerpt):**
> "Hey, I see you're asking about **SOGs** (Shots On Goal) average for a Blackhawks player, but it's too vague without knowing "he" (like Bedard? Bertuzzi?) and which season/games."

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

## [01/24/2026 17:25 CST] - Q90: NO_TABLE_FOR_STATS, SPEC_VIOLATION_PRONOUN_RESOLUTION

**User prompt(s):**
1. "Were his xg and actual snipes close or was he over/underperforming?"

**Ask AI answer (relevant excerpt):**
> "Hey, fellow Hawks fan! The query doesn't specify **which player** you're asking about for xG (expected goals) vs. actual goals ("snipes"), but based on Chicago Blackhawks' 2025-26 stats, it looks like you're probably eyeing a top scorer like **Tyler Bertuzzi** (team-leading **24 goals** per ESPN) or..."

**Source:** `web_fallback`

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

## [01/24/2026 17:25 CST] - Q99: NO_TABLE_FOR_STATS

**User prompt(s):**
1. "As a casual fan, what are the 5 key stats I should know to sound smart about Bears, Bulls, Cubs, Sox, and Hawks?"

**Ask AI answer (relevant excerpt):**
> "Alright, casual fan, wanna drop some knowledge at the next watch party without sounding like a poser? Here's your **5 key stats cheat sheet** for Chicago's big five—**Bears, Bulls, Cubs, White Sox, Blackhawks**—pulled from the city's championship glory and fan loyalty metrics that'll make you sound ..."

**Source:** `ai`

**Expected behavior:**
- Stats questions should include markdown tables

**What went wrong:**
- NO_TABLE_FOR_STATS

**Severity:** Medium

**Suggested fix:**
- Add table formatting logic to stats responses
---

