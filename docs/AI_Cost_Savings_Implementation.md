# AI Cost Savings Implementation Guide

> **For:** Claude Code implementation sessions
> **Rule:** Nothing goes unanswered. Every user-facing AI query MUST receive a response. Fallbacks are mandatory.
> **Estimated savings:** 40-75% reduction in monthly AI API costs

---

## Enhancement 1: Downgrade Fan Chat from `sonar-pro` to `sonar`

**File:** `src/app/api/fan-chat/ai-response/route.ts`
**Current model:** `sonar-pro` (line 147)
**Change to:** `sonar`

### Exact Instructions

1. Open `src/app/api/fan-chat/ai-response/route.ts`
2. On line 147, change the `model` value in the Perplexity API call:

```typescript
// BEFORE
model: 'sonar-pro',

// AFTER
model: 'sonar',
```

3. No other changes needed. The `sonar` model supports the same API shape including `search_recency_filter`, `max_tokens`, `temperature`, and `top_p`.

### Why this is safe
- Fan Chat personas are casual conversational responses under 280 characters
- `sonar` still has real-time web search for stat verification
- The system prompt, personality config, and response format are unchanged
- Users see a chat persona, not a research tool — they don't need deep reasoning
- All responses still go through Perplexity's search pipeline for accuracy

### Fallback guarantee
The existing error handling at lines 180-187 and 218-224 already returns error JSON if the API fails. No additional fallback needed.

---

## Enhancement 2: Add Response Cache to Fan Chat

**File:** `src/app/api/fan-chat/ai-response/route.ts`
**What to add:** In-memory cache for AI responses keyed by `channelId + normalizedIntent`

### Exact Instructions

1. Add this cache structure at the top of the file, after the existing `rateLimitStore` (line 13):

```typescript
// Response cache: avoids duplicate API calls for similar recent questions
// Key: channelId + normalized last message, Value: { response, timestamp }
const responseCache: Map<string, { response: object; timestamp: number }> = new Map()
const RESPONSE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes
```

2. Add this normalization function after the cache declaration:

```typescript
/**
 * Normalize a message to create a cache key.
 * Strips punctuation, lowercases, and removes filler words.
 */
function normalizeCacheKey(channelId: string, message: string): string {
  const normalized = message
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\b(the|a|an|is|are|was|were|do|does|did|how|what|whats|hows)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return `${channelId}:${normalized}`
}
```

3. Inside the `POST` handler, AFTER the rate limit check passes (after line 77) and BEFORE the trigger reason check (line 80), add the cache lookup:

```typescript
    // Check response cache for similar recent questions
    const lastHumanMsg = messages.filter(m => !m.isAI).pop()
    if (lastHumanMsg) {
      const cacheKey = normalizeCacheKey(channelId, lastHumanMsg.content)
      const cached = responseCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < RESPONSE_CACHE_TTL) {
        return NextResponse.json(cached.response)
      }
    }
```

4. AFTER the successful response is built (after line 215, before the return), cache it:

```typescript
    // Cache the response
    if (lastHumanMsg) {
      // Need to reference lastHumanMsg from earlier - move the declaration up
      const cacheKey = normalizeCacheKey(channelId, lastHumanMsg.content)
      responseCache.set(cacheKey, {
        response: {
          shouldRespond: true,
          message: {
            id: `ai-${Date.now()}`,
            user: personality.username,
            content: aiMessage.trim(),
            time: 'Just now',
            isOwn: false,
            isAI: true,
            personality: personality.id
          }
        },
        timestamp: Date.now()
      })
    }
```

5. Add cache cleanup — every 10 minutes, purge expired entries. Add after the cache declaration:

```typescript
// Periodically clean expired cache entries
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of responseCache) {
    if (now - value.timestamp > RESPONSE_CACHE_TTL) {
      responseCache.delete(key)
    }
  }
}, 10 * 60 * 1000)
```

### Why this is safe
- 5-minute TTL means responses stay fresh
- Cache is per-channel, so Bears chat doesn't serve Bulls answers
- Only caches successful responses — errors and rate limits bypass the cache
- Normalization is conservative — different questions still get different answers
- Cache miss = normal API call, nothing is lost

### Fallback guarantee
Cache miss always falls through to the live API call. This enhancement only prevents duplicate calls, never blocks responses.

---

## Enhancement 3: Batch X Bot Analysis + Generation into Single Call

**File:** `src/lib/bot/claude-generator.ts`
**What to change:** Merge `analyzeTweetForResponse()` and `generateResponse()` into a single API call when both are needed

### Exact Instructions

1. Add a new combined function after `analyzeTweetForResponse()` (after line 483):

```typescript
/**
 * Combined analysis + reply generation in a single API call.
 * Saves one Sonnet 4 call per tweet that warrants a response.
 */
export async function analyzeAndGenerateReply(
  tweet_content: string,
  tweet_author: string | undefined,
  team_slug: TeamSlug,
  context?: GenerateResponseParams['context']
): Promise<{
  analysis: {
    should_respond: boolean
    priority: number
    reason: string
    suggested_tone: string
  }
  reply: GeneratedResponse | null
}> {
  const client = getClaudeClient()
  const teamName = TEAM_DISPLAY_NAMES[team_slug]
  const systemPrompt = buildSystemPrompt(team_slug, 'reply')

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `You have TWO tasks for this ${teamName} tweet.

TWEET: "${tweet_content}"
${tweet_author ? `Author: @${tweet_author}` : ''}

TASK 1 - ANALYSIS: Should @sportsmockery respond to this tweet?
Consider: Is it genuine? Would a response add value? Is the topic appropriate?
Avoid: spam, trolls, politics, gambling, negative drama.

TASK 2 - REPLY (only if TASK 1 says yes): Write the reply under 280 characters.
Be authentic, engaging, and true to the Chicago fan perspective.

Return ONLY this JSON:
{
  "should_respond": boolean,
  "priority": number (0-100),
  "reason": "brief explanation",
  "suggested_tone": "supportive|analytical|playful|empathetic|informative",
  "reply": "the tweet text (empty string if should_respond is false)"
}`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    return {
      analysis: { should_respond: false, priority: 0, reason: 'Failed to analyze', suggested_tone: 'informative' },
      reply: null,
    }
  }

  try {
    const parsed = JSON.parse(textContent.text)
    const analysis = {
      should_respond: parsed.should_respond,
      priority: parsed.priority,
      reason: parsed.reason,
      suggested_tone: parsed.suggested_tone,
    }

    let reply: GeneratedResponse | null = null
    if (parsed.should_respond && parsed.reply) {
      let content = parsed.reply.trim()
      if (content.length > 280) {
        content = truncateToLimit(content, 280)
      }
      reply = {
        content,
        tokens_used: response.usage.input_tokens + response.usage.output_tokens,
        model: response.model,
        prompt_used: 'combined-analyze-and-reply',
      }
    }

    return { analysis, reply }
  } catch {
    return {
      analysis: { should_respond: false, priority: 0, reason: 'Failed to parse', suggested_tone: 'informative' },
      reply: null,
    }
  }
}
```

2. Export it from the default export at bottom of file (line 485-491):

```typescript
export default {
  generateResponse,
  generateReply,
  generateOriginalPost,
  generateArticlePromo,
  analyzeTweetForResponse,
  analyzeAndGenerateReply,  // ADD THIS
}
```

3. Update the bot service that calls these functions (find where `analyzeTweetForResponse` is called followed by `generateReply`) to use `analyzeAndGenerateReply` instead. The caller should:
   - Call `analyzeAndGenerateReply()` once
   - If `analysis.should_respond` is true, use `reply` directly instead of making a second call
   - Keep the original separate functions available as fallbacks

### Why this is safe
- Same model, same system prompt, same quality
- If the combined call fails, the existing separate functions remain as fallbacks
- The JSON output includes both analysis and reply in one shot
- Reply quality is identical — same personality prompt, same 280-char limit

### Fallback guarantee
Keep `analyzeTweetForResponse()` and `generateReply()` intact. The bot service should try `analyzeAndGenerateReply()` first, and fall back to the two-call pattern on parse errors.

---

## Enhancement 4: Expand Bears Chat Keyword Fallbacks, Use Haiku Only for Novel Questions

**File:** `src/app/api/bears/chat/route.ts`
**Current behavior:** Falls back to keyword responses only when `ANTHROPIC_API_KEY` is missing
**New behavior:** Try keyword match first, only call Haiku for unmatched questions

### Exact Instructions

1. Expand the fallback keyword responses in `generateResponse()` (starting at line 93). Replace the existing fallback section with a comprehensive keyword matcher that handles 80%+ of questions:

```typescript
// Try keyword-based responses FIRST (free, instant)
const keywordResponse = getKeywordResponse(question, context)
if (keywordResponse) {
  return keywordResponse
}

// Only call Haiku for questions not covered by keywords
if (ANTHROPIC_API_KEY) {
  // ... existing Haiku call (lines 58-89) ...
}

// Final fallback
return `Great question about the Bears! ...`
```

2. Add a comprehensive keyword matcher function BEFORE `generateResponse`:

```typescript
function getKeywordResponse(
  question: string,
  context: Awaited<ReturnType<typeof getBearsContext>>
): string | null {
  const q = question.toLowerCase()

  // Record / standings
  if (q.match(/\b(record|standings|wins|losses|win-loss)\b/)) {
    return `The Bears currently sit at ${context.record} this season. The NFC North is competitive as always. What do you think the Bears' final record will be?`
  }

  // Schedule / next game
  if (q.match(/\b(schedule|next game|upcoming|when do they play)\b/)) {
    return `Check out our schedule page for the full list of upcoming Bears games with dates, times, and opponent breakdowns. We provide game previews and predictions each week!`
  }

  // Caleb Williams / QB
  if (q.match(/\b(caleb|williams|quarterback|qb)\b/)) {
    return `Caleb Williams has been the centerpiece of the Bears' offense. As the young QB develops, fans are excited about his potential to lead Chicago back to playoff contention. Check our latest articles for in-depth analysis!`
  }

  // Trade / rumors / free agency
  if (q.match(/\b(trade|rumors?|free agent|signing|draft)\b/)) {
    return `The rumor mill is always churning in Chicago! Our team tracks all the latest whispers about potential moves. What position do you think the Bears need to address most?`
  }

  // Coaching
  if (q.match(/\b(coach|coaching|ben johnson|play ?call)\b/)) {
    return `Ben Johnson has brought a fresh perspective to the Bears. His offensive approach and game management have been hot topics among fans. What's your take on the coaching this season?`
  }

  // Defense
  if (q.match(/\b(defense|defensive|montez|sweat|tackle|sack)\b/)) {
    return `The Bears defense has been a key factor this season. The pass rush and secondary have had their moments. What defensive player has impressed you most?`
  }

  // Offense / receivers / running
  if (q.match(/\b(offense|offensive|receiver|wr|rushing|run game|dj moore|odunze)\b/)) {
    return `The Bears offense has been evolving with the talent on the roster. The receiver corps and run game are crucial to success. Which offensive weapon do you think is most important?`
  }

  // Rivalry / Packers / division
  if (q.match(/\b(packers?|vikings?|lions?|rival|nfc north|division)\b/)) {
    return `The NFC North rivalry is one of the best in football! The Packers matchups are always electric. Which divisional rival do you think poses the biggest threat?`
  }

  // History / nostalgia
  if (q.match(/\b(history|85 bears|payton|ditka|urlacher|butkus|championship)\b/)) {
    return `Bears history runs deep - from the '85 Bears to Walter Payton to the Monsters of the Midway legacy. This franchise has incredible tradition. What's your favorite Bears moment?`
  }

  // Tickets / stadium / gameday
  if (q.match(/\b(ticket|stadium|soldier field|arlington|gameday|tailgate)\b/)) {
    return `Whether it's Soldier Field or discussions about a new stadium, game day in Chicago is always special. The tailgating scene is legendary! Have you been to a game this season?`
  }

  // Injury
  if (q.match(/\b(injur|hurt|out|questionable|doubtful|ir\b|injured reserve)\b/)) {
    return `Injuries are always a factor during the season. Check our latest articles for up-to-date injury reports and impact analysis. Which player's health concerns you most?`
  }

  // Playoffs
  if (q.match(/\b(playoff|postseason|super bowl|nfc championship|wild card)\b/)) {
    return `Playoff talk is what Bears fans live for! The road to the Super Bowl runs through the NFC, and every game matters. Do you think the Bears are playoff contenders?`
  }

  // No match — return null to trigger Haiku call
  return null
}
```

3. Restructure `generateResponse` to try keywords first:

```typescript
async function generateResponse(
  question: string,
  context: Awaited<ReturnType<typeof getBearsContext>>
): Promise<string> {
  // 1. Try free keyword responses first
  const keywordResponse = getKeywordResponse(question, context)
  if (keywordResponse) {
    return keywordResponse
  }

  // 2. Only call Haiku for novel/complex questions
  if (ANTHROPIC_API_KEY) {
    try {
      // ... existing Anthropic call (lines 60-89, unchanged) ...
    } catch (error) {
      console.error('AI generation error:', error)
    }
  }

  // 3. Final fallback — never leave user without a response
  return `Great question about the Bears! Our team of writers and analysts cover every aspect of Chicago Bears football. Browse our latest articles for the most up-to-date coverage, or ask me something specific about the team, players, or schedule!`
}
```

### Why this is safe
- Keyword responses are the SAME quality as the existing fallback responses (lines 93-112)
- Novel questions still go to Haiku — nothing goes unanswered
- The final fallback string ensures a response even if Haiku fails
- Three-tier system: keywords -> Haiku -> fallback text

### Fallback guarantee
Three layers deep. Impossible to return no response.

---

## Enhancement 5: Extend Highlights Cache from 60 Minutes to 4 Hours (Offseason: 24 Hours)

**File:** `src/app/api/generate-highlights/route.ts`
**Current:** `CACHE_DURATION = 60 * 60 * 1000` (line 32)

### Exact Instructions

1. Replace the static cache duration (line 32) with a dynamic function:

```typescript
// Cache durations
const CACHE_DURATION_STANDARD = 4 * 60 * 60 * 1000  // 4 hours during season
const CACHE_DURATION_OFFSEASON = 24 * 60 * 60 * 1000 // 24 hours during offseason

/**
 * Get cache duration based on whether any team is in-season.
 * NFL: Sep-Feb, NBA: Oct-Jun, NHL: Oct-Jun, MLB: Mar-Oct
 */
function getCacheDuration(): number {
  const month = new Date().getMonth() + 1 // 1-12
  // At least one Chicago team is in-season year-round except maybe late July / early August
  const isDeadPeriod = month === 7 || month === 8
  return isDeadPeriod ? CACHE_DURATION_OFFSEASON : CACHE_DURATION_STANDARD
}
```

2. Update the cache check in `getCachedHighlights` (line 105):

```typescript
// BEFORE
if (now - updatedAt < CACHE_DURATION) {

// AFTER
if (now - updatedAt < getCacheDuration()) {
```

### Why this is safe
- Highlights are AI-generated mockery/commentary — they don't need to be real-time
- 4 hours is still fresh enough for daily content
- During dead periods (July/August), 24 hours is fine — nothing is happening
- The cache is per-team, so each team gets its own refresh cycle

### Fallback guarantee
Cache miss still triggers a Haiku call. The `generateFallbackHighlights()` function (line 248) still exists for API failures.

---

## Enhancement 6: Add Request Deduplication for Highlights

**File:** `src/app/api/generate-highlights/route.ts`
**Problem:** If 50 users load a team page when cache is expired, 50 Haiku calls fire simultaneously

### Exact Instructions

1. Add an in-flight request map at the top of the file, after the cache duration constants:

```typescript
// In-flight request deduplication: prevents duplicate API calls for the same team
const inFlightRequests: Map<string, Promise<unknown[]>> = new Map()
```

2. Modify the POST handler to use deduplication. Replace lines 67-71 with:

```typescript
    // Check if there's already an in-flight request for this team
    let highlightsPromise = inFlightRequests.get(teamSlug)

    if (!highlightsPromise) {
      // No in-flight request — start one and register it
      highlightsPromise = generateHighlightsWithClaude(teamSlug, teamConfig)
        .finally(() => {
          // Remove from in-flight map when done (success or failure)
          inFlightRequests.delete(teamSlug)
        })
      inFlightRequests.set(teamSlug, highlightsPromise)
    }

    const highlights = await highlightsPromise

    // Cache the results
    await cacheHighlights(teamSlug, highlights)

    return NextResponse.json({ highlights, cached: false })
```

### Why this is safe
- Only the first request triggers the API call
- All concurrent requests for the same team await the same promise
- Once resolved, all get the same response
- The `.finally()` cleanup ensures the map never leaks
- Next request after completion starts a fresh call

### Fallback guarantee
If the shared promise rejects, all waiters fall through to the existing error handler which returns `generateFallbackHighlights()`.

---

## Enhancement 7: Downgrade X Bot Tweet Analysis to Haiku

**File:** `src/lib/bot/claude-generator.ts`
**Current:** `analyzeTweetForResponse()` uses `claude-sonnet-4-20250514` (line 434)
**Change to:** `claude-3-haiku-20240307`

### Exact Instructions

1. In `analyzeTweetForResponse()`, change line 434:

```typescript
// BEFORE
model: 'claude-sonnet-4-20250514',

// AFTER
model: 'claude-3-haiku-20240307',
```

2. No other changes. The function returns a simple JSON classification (should_respond boolean, priority number, reason string, tone string). This is a classification task that Haiku handles well.

### Why this is safe
- This is a yes/no classification task with a priority score
- Haiku is excellent at structured JSON classification
- The actual tweet generation (`generateResponse`, `generateReply`, `generateArticlePromo`) still uses Sonnet 4 for quality
- If Haiku returns unparseable JSON, the existing catch block (lines 475-482) returns a safe default of `should_respond: false`

### Fallback guarantee
Lines 464-471 handle missing text content. Lines 473-482 handle JSON parse failures. Both return safe defaults. No tweet goes unanswered — if analysis fails, the bot simply skips that tweet (which is the safe default).

**Note:** If you implement Enhancement 3 (combined call), this enhancement becomes unnecessary for combined calls but still applies to any standalone `analyzeTweetForResponse()` usage.

---

## Enhancement 8: Add Scout AI Response Caching on SM Side

**File:** `src/app/api/ask-ai/route.ts`
**What to add:** Short-lived cache for identical/near-identical queries

### Exact Instructions

1. Add cache structure at the top of the file, after the imports:

```typescript
// Scout response cache: prevents duplicate Data Lab calls for identical questions
const scoutCache: Map<string, { data: object; timestamp: number }> = new Map()
const SCOUT_CACHE_TTL = 10 * 60 * 1000 // 10 minutes

function normalizeScoutQuery(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Clean expired entries every 15 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of scoutCache) {
    if (now - value.timestamp > SCOUT_CACHE_TTL) {
      scoutCache.delete(key)
    }
  }
}, 15 * 60 * 1000)
```

2. In the `POST` handler, AFTER the query validation (after line 199) and BEFORE the team detection (line 204), add cache lookup:

```typescript
    // Check cache for identical/near-identical queries
    const normalizedQuery = normalizeScoutQuery(query)
    const cachedResponse = scoutCache.get(normalizedQuery)
    if (cachedResponse && Date.now() - cachedResponse.timestamp < SCOUT_CACHE_TTL) {
      console.log('Scout cache HIT:', normalizedQuery.slice(0, 50))
      return NextResponse.json(cachedResponse.data)
    }
```

3. BEFORE the final `return NextResponse.json(...)` on the success path (line 263), cache the response:

```typescript
    const responseData = {
      response: data.response,
      rowCount: data.rowCount,
      source: data.source,
      team: data.team,
      teamDisplayName: data.teamDisplayName,
      sport: data.sport,
      dataGapLogged: data.dataGapLogged,
      showSuggestions: data.showSuggestions,
      suggestions: data.suggestions,
      relatedArticles: data.relatedArticles,
      newsSummary: data.newsSummary,
      chartData: transformedChartData,
      bonusInsight: data.bonusInsight,
      rawData: data.rawData,
      sessionId: data.sessionId,
      sessionContext: data.sessionContext,
    }

    // Cache the successful response
    scoutCache.set(normalizedQuery, { data: responseData, timestamp: Date.now() })

    return NextResponse.json(responseData)
```

4. Do NOT cache error responses or follow-up session queries. Add this condition to the cache lookup:

```typescript
    // Only use cache for non-session queries (follow-ups need fresh context)
    if (!sessionId) {
      const cachedResponse = scoutCache.get(normalizedQuery)
      if (cachedResponse && ...) { ... }
    }
```

### Why this is safe
- 10-minute TTL keeps data fresh
- Session queries (follow-ups with pronouns) bypass cache entirely
- Only caches successful Data Lab responses
- Cache miss = normal Data Lab call
- Common queries like "Bears record" or "next Cubs game" get served instantly

### Fallback guarantee
Cache miss always falls through to the live Data Lab call. All existing error handling (lines 241-308) is unchanged.

---

## Enhancement 9: Add Rate Limiting + Debounce to PostIQ

**File:** `src/app/api/admin/ai/route.ts`
**What to add:** Per-user rate limiting and duplicate request prevention

### Exact Instructions

1. Add rate limiting at the top of the file, after imports:

```typescript
// PostIQ rate limiting: prevent accidental spam
const postiqRateLimits: Map<string, { count: number; resetTime: number }> = new Map()
const POSTIQ_MAX_REQUESTS_PER_HOUR = 60
const POSTIQ_DEBOUNCE_MS = 3000 // 3 seconds between identical requests

// Track recent requests to prevent duplicates
const recentRequests: Map<string, number> = new Map() // key -> timestamp
```

2. At the start of the `POST` handler (after line 42), add rate check:

```typescript
    // Rate limiting (use IP or a header as user identifier)
    const clientId = request.headers.get('x-forwarded-for') || 'unknown'
    const now = Date.now()

    // Check rate limit
    const limit = postiqRateLimits.get(clientId) || { count: 0, resetTime: now + 3600000 }
    if (now > limit.resetTime) {
      limit.count = 0
      limit.resetTime = now + 3600000
    }
    if (limit.count >= POSTIQ_MAX_REQUESTS_PER_HOUR) {
      return NextResponse.json({ error: 'Rate limit exceeded. Please wait before making more requests.' }, { status: 429 })
    }

    // Debounce: prevent identical rapid-fire requests
    const requestKey = `${clientId}:${action}:${(title || '').slice(0, 50)}`
    const lastRequest = recentRequests.get(requestKey)
    if (lastRequest && now - lastRequest < POSTIQ_DEBOUNCE_MS) {
      return NextResponse.json({ error: 'Please wait a moment before retrying.' }, { status: 429 })
    }

    // Update counters
    limit.count++
    postiqRateLimits.set(clientId, limit)
    recentRequests.set(requestKey, now)
```

### Why this is safe
- 60 requests/hour is very generous for admin use (one request every minute)
- 3-second debounce only prevents rapid double-clicks, not normal usage
- Rate limit resets every hour automatically
- Returns clear error messages so the admin knows what happened

### Fallback guarantee
Rate limiting only prevents excess calls — it never blocks a reasonable first attempt. All AI generation logic is untouched.

---

## Enhancement 10: Enable Anthropic Prompt Caching for Static System Prompts

**Files:**
- `src/lib/bot/claude-generator.ts` (X Bot)
- `src/app/api/admin/ai/route.ts` (PostIQ)
- `src/app/api/bears/chat/route.ts` (Bears Chat)
- `src/app/api/generate-highlights/route.ts` (Highlights)

### Exact Instructions

Anthropic's prompt caching charges 90% less for cached input tokens after the first request. System prompts that are identical across calls are automatically cached when you use the `system` parameter as an array of content blocks with a `cache_control` field.

**For each file that calls the Anthropic API, change the `system` parameter format:**

#### X Bot (`claude-generator.ts`, line 145-155 and line 388-393):

```typescript
// BEFORE
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens,
  system: systemPrompt,
  messages: [{ role: 'user', content: userPrompt }],
})

// AFTER
const response = await client.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens,
  system: [
    {
      type: 'text',
      text: systemPrompt,
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: userPrompt }],
})
```

Apply the same pattern to ALL Anthropic API calls in these files:

#### PostIQ (`admin/ai/route.ts`) — lines 99, 163, 224, 286, 329, 381, 456, 618:

```typescript
// Every anthropic.messages.create() call that has a `system:` parameter
// Change from:
system: systemPrompt,
// To:
system: [
  {
    type: 'text',
    text: systemPrompt,
    cache_control: { type: 'ephemeral' }
  }
],
```

For PostIQ calls that pass `system` directly in `messages.create()` without a separate system param (like `analyzeChartData` at line 381 and `generateChartForPost` at line 456), add the system parameter:

```typescript
// BEFORE (no system param)
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  messages: [{ role: 'user', content: prompt }],
})

// AFTER (add cacheable system)
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1000,
  system: [
    {
      type: 'text',
      text: 'You are PostIQ, the AI content assistant for Sports Mockery.',
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: prompt }],
})
```

#### Bears Chat (`bears/chat/route.ts`, line 77):

```typescript
// BEFORE
system: systemPrompt,

// AFTER
system: [
  {
    type: 'text',
    text: systemPrompt,
    cache_control: { type: 'ephemeral' }
  }
],
```

#### Highlights (`generate-highlights/route.ts`, line 214-223):

```typescript
// BEFORE
const response = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1024,
  messages: [{ role: 'user', content: prompt }],
})

// AFTER
const response = await anthropic.messages.create({
  model: 'claude-3-haiku-20240307',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: 'You are a sports highlights generator for Sports Mockery, a Chicago sports fan site.',
      cache_control: { type: 'ephemeral' }
    }
  ],
  messages: [{ role: 'user', content: prompt }],
})
```

### Why this is safe
- No change to response quality — identical prompts, identical outputs
- `cache_control: { type: 'ephemeral' }` tells Anthropic to cache for ~5 minutes
- System prompts in this codebase are static (PostIQ knowledge base, bot personality, Bears context template)
- The X Bot's `BASE_SYSTEM_PROMPT` + `TEAM_SPECIFIC_PROMPTS` are ~2,000+ tokens each — caching saves significantly

### Prompt caching impact
- PostIQ: ~500-2,000 token system prompts × 100 calls/mo → 90% reduction on cached portion
- X Bot: ~1,500 token system prompt × 600 calls/mo → significant savings
- The more calls per 5-minute window, the more savings

### Fallback guarantee
Prompt caching is transparent — if caching is unavailable, the API processes normally at standard rates. No code path changes, no risk of missing responses.

---

## Implementation Priority Order

| Priority | Enhancement | Effort | Savings | Risk |
|----------|------------|--------|---------|------|
| 1 | **#5** Extend highlights cache | 5 min | High | None |
| 2 | **#1** Downgrade Fan Chat model | 1 min | High | Low |
| 3 | **#7** Haiku for bot analysis | 1 min | Medium | Low |
| 4 | **#6** Deduplicate highlights | 10 min | Medium | None |
| 5 | **#10** Prompt caching | 20 min | Medium | None |
| 6 | **#4** Bears Chat keywords first | 15 min | Low-Med | None |
| 7 | **#8** Scout response cache | 15 min | Low-Med | None |
| 8 | **#2** Fan Chat response cache | 15 min | Low-Med | None |
| 9 | **#9** PostIQ rate limiting | 10 min | Low | None |
| 10 | **#3** Batch bot calls | 20 min | Medium | Low |

## Critical Rule: Nothing Goes Unanswered

Every enhancement above preserves the guarantee that **every user-facing AI interaction returns a response.** The fallback chain for each feature:

| Feature | Layer 1 | Layer 2 | Layer 3 |
|---------|---------|---------|---------|
| Scout AI | SM cache | Data Lab API | Friendly error + suggestions |
| Fan Chat | Response cache | Perplexity API (sonar) | Error JSON |
| Bears Chat | Keyword matcher | Haiku API | Hardcoded fallback text |
| Highlights | DB cache (4h) | Haiku API | `generateFallbackHighlights()` |
| X Bot | Combined call | Separate calls | Safe default (skip tweet) |
| PostIQ | Rate limit check | Sonnet 4 API | Error JSON to admin |
