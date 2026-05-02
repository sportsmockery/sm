# Sports Mockery — Editorial Style Guide

This guide codifies how Sports Mockery articles are written, structured, and titled. It exists primarily to optimize for AI Overview / featured-snippet extraction and search-intent alignment, while keeping our voice consistent across writers.

> Version: 1.0 — initial publication covers article structure (Tip #16) and title construction (Tip #17). Treat this as a living document; propose changes via PR.

---

## Article Structure: Inverted Pyramid

### Definition

The **inverted pyramid** is a journalism structure where the most vital fact appears in the first 2–3 sentences of the article. Detail, context, and background follow in descending order of importance. Readers — and increasingly, AI extractors — get the answer immediately and only keep reading if they want more.

### Why it matters for AI Overview

Google's AI Overview, Bing's Copilot, and similar surfaces extract the answer to a user's query from the **opening of the page**. If the lede is buried under throat-clearing ("It was a beautiful Sunday in Chicago…"), the model either skips the page or extracts the wrong sentence. A clean inverted-pyramid open is the single highest-leverage thing a writer can do for snippet eligibility.

### The three required openers (in priority order)

Every article must answer these three questions inside the first 2–3 sentences. For sports recaps and breaking news, use the parenthetical sports-flavored equivalents.

1. **Who / What** — the dominant entity *(score and key player)*
2. **When / Where** — the moment and place *(quarter, stadium, opponent)*
3. **Why it matters** — the immediate consequence *(playoff implications, injury, record, personnel decision)*

If a reader stops after sentence three, they should still know the score, the headliner, and what it changes.

### GOOD example openings

**Recap:**
> Caleb Williams threw for 312 yards and three touchdowns Sunday at Soldier Field, leading the Bears to a 27–17 win over the Vikings. The result clinches Chicago's first NFC North title since 2018 and pushes Minnesota into a wild-card play-in. Williams completed 24 of 31 passes with no interceptions.

**Breaking news:**
> The Cubs traded outfielder Ian Happ to the San Diego Padres on Tuesday in exchange for two minor-league pitching prospects, the team announced. The move clears roughly $21 million from Chicago's 2026 payroll and signals an accelerated rebuild around catcher Moisés Ballesteros. Happ, 31, had two years remaining on his contract.

**Roster / depth chart:**
> The Bulls will start rookie guard Matas Buzelis at small forward against the Heat on Wednesday, head coach Billy Donovan confirmed. Buzelis replaces an injured Patrick Williams (left ankle) and steps into a role that has rotated four times this season. The change comes with Chicago at 18–24 and clinging to the play-in.

### BAD example openings (and what's wrong)

**Delayed lede:**
> It was a cold afternoon at Soldier Field, with snow flurries falling on a crowd that had waited all season for a moment like this. The Bears entered the game needing a win to keep their playoff hopes alive. After kickoff, both teams traded punts before Caleb Williams found his rhythm in the second quarter…

*Problem:* The score and the headliner appear nowhere in the first paragraph. The AI Overview will not extract a useful answer here.

**Weather throat-clearing:**
> Sunday's game in Chicago was played under heavy winds gusting up to 25 mph, conditions that historically favor running offenses. Bears fans braved the cold to pack the stands as their team prepared to face a divisional rival. The atmosphere was electric…

*Problem:* Two paragraphs in, no entity, no event, no consequence. Pure scene-setting belongs deeper in the piece, if at all.

**"What a game!" filler:**
> What a game it was at Soldier Field on Sunday! Bears fans got their money's worth as Chicago and Minnesota traded blows in a thriller that came down to the final minutes. If you missed it, here's what you need to know…

*Problem:* Editorial editorializing without substance. "Here's what you need to know" is a promise, not information — say the thing.

### Pre-publish checklist

Editors should run every article through this 5-item check before hitting publish:

1. **Lede test:** Does sentence one name the dominant entity (team, player, or event)?
2. **Score / outcome test:** For recaps and breaking news, is the score or the decisive fact present in the first 2–3 sentences?
3. **Consequence test:** Does the opening explain *why this matters* — standings, contract, injury, record — without forcing the reader into paragraph four?
4. **No-filler test:** No "What a game!", no weather scene-setting, no "Let's break it down" stalling in the first paragraph.
5. **Snippet read-aloud test:** Read sentences 1–3 aloud as if Google were quoting them. Do they answer a plausible search query on their own? If not, rewrite.

---

## Title Construction

### Goal

Titles should match the **dominant entity** and the **user's actual question**, not chase keyword density. Modern search ranks pages that resolve intent; titles that read like keyword soup get skipped.

### The four patterns we want

#### 1. Question-style titles

When the article answers a clear user question, phrase the title as that question.

- *Why Did the Bears Trade Cole Kmet?*
- *Will Caleb Williams Play Sunday Against the Packers?*
- *What Happened to the Cubs' 2026 Payroll?*

Use sparingly — only when the article genuinely answers the question. Avoid clickbait phrasing like *You Won't Believe What the Bears Did Next*.

#### 2. Entity-led declarative

Lead with the dominant entity (player, team, or event) and the specific topic.

- *Caleb Williams' Receivers: 2026 Depth Chart Breakdown*
- *Bulls Trade Deadline: Three Targets Chicago Should Pursue*
- *White Sox Spring Training Roster: Storylines to Watch*

#### 3. Number-led ranking

Numbered lists tell the reader exactly what they're getting. Use real, defensible numbers.

- *5 Bears Who Could Surprise in 2026*
- *3 Reasons the Cubs' Rotation Is in Trouble*
- *7 Bulls Lineups Billy Donovan Hasn't Tried Yet*

#### 4. Result-led recap

Score-first titles for recaps. Lead with the outcome, then the headliner, then color.

- *Bears 27, Vikings 17: Caleb Williams Outduels Sam Darnold*
- *Cubs 4, Cardinals 2: Imanaga Carries No-Hitter Into the 8th*
- *Bulls 112, Pacers 108 (OT): Buzelis Hits Game-Winner in Debut*

### Anti-patterns

Do not ship titles that match these shapes:

- **Keyword stuffing.** *Bears News Caleb Williams Update Latest Trade Rumors 2026* — this is a sitemap, not a title.
- **ALL CAPS.** *BEARS BLOW OUT VIKINGS!* Reserved for parody verticals only; never for the main news feed.
- **Clickbait questions.** *Are the Bears About to Make the BIGGEST Trade in NFL History?!* If the article doesn't deliver, the title shouldn't promise.
- **Vague "What Happened" titles.** *What Happened to the Bears on Sunday* — say what happened. *Bears Lose 24–10 to Lions: Three Takeaways* tells the reader what they're getting.
- **Stacked colons.** *Bears: Caleb Williams: Injury Update: What We Know* — pick one structure.

### Length budget

- **Target:** 50–60 characters
- **Hard cap:** 70 characters

Titles longer than 60 characters get truncated in most SERP layouts — the most important words must appear in the first 60. Hard-cap at 70 because Open Graph cards on social begin clipping aggressively past that.

### Brand suffix policy

**Do not append `| Sports Mockery` to titles in the CMS.** The site's title-template (in the Next.js metadata layer) handles brand-suffix concatenation automatically. Manually appending it will produce duplicated suffixes (`Bears Win | Sports Mockery | Sports Mockery`) on rendered pages and in social cards.

If you see a duplicated brand suffix on a live page, the fix is to remove the manual suffix from the article title in the CMS — not to change the title-template.
