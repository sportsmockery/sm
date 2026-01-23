# PostIQ Media Sentiment System – Comprehensive Knowledge Document

## 1. Overview and Purpose

PostIQ is responsible for computing and leveraging the "Media Sentiment" (also called "Media_Score") system for test.sportsmockery.com. This system ingests content from reputable Chicago sports media outlets (RSS, Twitter/X, Facebook, YouTube) covering the Bears, Bulls, Blackhawks, Cubs, and White Sox, and produces actionable sentiment and emotional intelligence that informs headline suggestions, editorial strategy, and fan engagement.

**Your role:** You compute the Media Sentiment score, interpret its meaning, and use it to generate headlines and editorial guidance that rides the current emotional wave of Chicago sports media and fandom.

---

## 2. What is Media Sentiment (Media_Score)?

Media Sentiment is a **real-time, continuous metric** that captures the emotional tone and narrative momentum of Chicago sports media coverage across all five major teams.

### 2.1 Definition

**Media Sentiment** = A normalized score in the range **[-1.0, +1.0]** per team and globally, representing:

- **-1.0** = Extremely negative, despondent, rage-filled media coverage. Fans and media are collectively catastrophizing, demanding trades, questioning leadership, discussing worst-case scenarios.
  - Examples: "Bears are tanking," "Fire the GM," "This season is over," "Worst defense ever."

- **-0.5** = Moderately negative. Media and fans are concerned, critical, but not panicked. Coverage is skeptical but looking for explanations.
  - Examples: "That loss exposed gaps in the secondary," "Questions remain about the coach's play-calling."

- **0.0** = Neutral. Coverage is balanced; media is reporting facts without strong emotional lean. No clear narrative momentum.
  - Examples: "The game came down to execution," "Both teams had chances."

- **+0.5** = Moderately positive. Media and fans are hopeful, optimistic, pointing to bright spots and promising trends. Coverage is encouraging.
  - Examples: "The rookies showed real potential today," "This offense is finally clicking."

- **+1.0** = Extremely positive, euphoric. Media and fans are collectively celebrating, comparing to championship teams, imagining deep playoff runs, hype at peak levels.
  - Examples: "MVP-caliber performance," "This is the year," "Championship window is open."

### 2.2 Why It Matters

Media Sentiment is **not** the truth about a team's quality or prospects. It is the **collective emotional response** of the media ecosystem and fanbase to recent events (games, trades, injuries, rumors, coaching changes, etc.).

Sports Mockery's editorial voice thrives on:
1. **Riding the wave**: Amplifying the strongest emotional currents in real-time.
2. **Flipping the script**: Deliberately contradicting or parodying prevailing sentiment for comedic effect.
3. **Leading vs. following**: Sometimes creating your own narrative that becomes part of the larger media conversation.

Understanding Media Sentiment tells you:
- What are fans *actually* feeling right now?
- What is the urgency level in media coverage?
- What emotions can Sports Mockery amplify, satirize, or subvert?

---

## 3. How Media Sentiment is Calculated

### 3.1 Data Sources

Media Sentiment is computed from:
- **RSS feeds** from reputable outlets (Tribune, Sun-Times, CHGO, ESPN Chicago, etc.).
- **X/Twitter** posts from journalists, beat reporters, media accounts, personalities.
- **Facebook** posts from official pages and media outlets.
- **YouTube** titles, descriptions, and engagement (comments, likes, view counts).

**Only content from sources with ~5,000+ followers/subscribers** is included to filter out noise and fan chatter.

**Only the most recent 24–48 hours** of content is considered; Media Sentiment is a **rolling, short-term metric**, not a long-term trend.

### 3.2 Scoring Components

For **each piece of content** (article, tweet, post, video), the system calculates:

#### 3.2.1 Text Sentiment (s_text)

**Range: [-1.0, +1.0]**

This is the **intrinsic emotional valence** of the text, independent of who posted it or how many people engaged with it.

**How it's computed:**
- Sentiment model (e.g., transformer-based, fine-tuned for sports context) analyzes the text.
- Positive language indicators: "great," "impressive," "stepping up," "potential," "winning," "dominant," "future," "championship."
- Negative language indicators: "struggle," "concerns," "disappointing," "worst," "collapse," "fire," "trade," "hurt," "injury."
- Neutral/mixed: facts, stats, balanced takes.

**Examples:**
- "Caleb Williams just threw a perfect touchdown pass to Rome Odunze, showcasing the chemistry that could define this offense for years." → s_text = **+0.7** (optimistic, forward-looking).
- "Another defensive breakdown in the secondary; the Bears' inability to cover receivers is inexplicable at this level." → s_text = **-0.7** (critical, questioning competence).
- "The Bears defeated the Lions 24-20 in a close game where both teams had their chances." → s_text = **+0.2** (factual, slight positive since they won).

#### 3.2.2 Narrative/Emotion Tags

**Set: {rage, panic, hope, joy, apathy}**

Classify the emotional *tone* of the piece beyond just positive/negative sentiment. A piece can be negative in s_text but framed with *hope* (e.g., "This loss proves we need to get the QB right; next draft we have our shot"). Or positive in s_text but *apathetic* in tone (e.g., "We won again, whatever, let's move on").

**Definitions:**

- **Rage**: Angry, frustrated, indignant tone. Demands action (trades, firing, bench players). "How is this acceptable?" "This is unacceptable." Often pairs with negative s_text, but can appear in positive (e.g., "I'm FURIOUS we're not using this talent").
  
- **Panic**: Fear, existential crisis, catastrophizing. "This season is lost," "We'll never win with this regime," "This team is fundamentally broken." Almost always pairs with negative s_text.

- **Hope**: Optimistic, forward-looking, believing in potential and growth. "This setback is a learning moment; we'll come back stronger." Can pair with negative s_text (e.g., "We lost, but I see the blueprint for success").

- **Joy**: Celebration, excitement, pleasure in the present moment. "What a game! This is why we love sports!" Typically pairs with positive s_text.

- **Apathy**: Indifference, exhaustion, emotional detachment. "I don't even care anymore," "This is just more of the same," "Shrug." Can pair with any s_text.

**Assignment logic:**
- Read the text holistically.
- Ask: *What emotion is the writer/creator trying to convey?* Not what you feel, but what they're expressing.
- Assign **one primary tag** (strongest emotion) and optionally **secondary tags** if multiple emotions are clearly present.

**Examples:**
- "ANOTHER LOSS. FIRE EVERYONE. This front office is incompetent and deserves to be fired!" → **rage** + negative s_text.
- "We're down 0-5 but I still believe in this team's core. The rebuild is coming." → **hope** + negative s_text.
- "Historic performance by the quarterback today. This is the year." → **joy** + positive s_text.
- "Bears lost again. Here we go." → **apathy** + negative s_text.

#### 3.2.3 Engagement Factor (e)

**Range: [0.0, 1.0]**

Measures how much traction the content is getting across the platform. High engagement = more people saw/interacted with it = stronger signal.

**Calculation:**

