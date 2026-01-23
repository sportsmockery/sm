# PostIQ Knowledge Management

> **Last Updated:** January 23, 2026
> **Purpose:** How to update and manage PostIQ's knowledge and behavior

---

## Quick Reference

| What to Change | Where to Edit |
|----------------|---------------|
| PostIQ's personality/tone | Prompts in `/src/app/api/admin/ai/route.ts` |
| What features PostIQ has | Add new `case` in switch statement + function |
| Headline style guidelines | `generateHeadlines()` prompt |
| SEO criteria/Mockery Score | `optimizeSEO()` prompt |
| Article idea types | `generateIdeas()` prompt |
| Chart analysis rules | `analyzeChartData()` prompt |
| Grammar check behavior | `checkGrammar()` prompt |

---

## Human Instructions (Non-Technical)

### What is PostIQ's "Knowledge"?

PostIQ doesn't have a database of knowledge like Scout. Instead, PostIQ's "knowledge" is defined by **prompts** - the instructions we give to Claude (the AI model) each time a user clicks a button.

Think of it like this:
- Each time you click "Generate Headlines," we send Claude a message saying "You are a sports journalist for Sports Mockery. Generate 5 headlines that are edgy, satirical..."
- The prompt defines what PostIQ knows, how it behaves, and what it produces

### How to Request Changes

Tell Claude Code (in this terminal) what you want to change. Examples:

**To change PostIQ's personality:**
> "Make PostIQ headlines more sarcastic and include Chicago slang"

**To add new knowledge:**
> "PostIQ should know that Caleb Williams is the Bears' new franchise QB when generating ideas"

**To change output format:**
> "PostIQ should generate 7 headlines instead of 5"

**To add a new feature:**
> "Add a new PostIQ feature that generates social media captions for articles"

### What Can Be Changed

| Change Type | Example Request |
|-------------|-----------------|
| **Tone/Voice** | "Make headlines more satirical" |
| **Output Count** | "Generate 10 ideas instead of 5" |
| **Context** | "PostIQ should always consider current Chicago sports news" |
| **Guidelines** | "Headlines should never exceed 80 characters" |
| **New Features** | "Add a feature to generate tweet threads" |
| **Scoring Criteria** | "Mockery Score should penalize boring headlines" |

### Current PostIQ Features You Can Modify

1. **Headlines Generator** - Generates 5 alternative headlines
2. **SEO Optimizer** - Analyzes SEO + gives Mockery Score (1-100)
3. **Article Ideas** - Generates 5 article ideas with angles
4. **Grammar Check** - Finds and corrects writing errors
5. **Auto Excerpt** - Creates 2-3 sentence summary
6. **Chart Analyzer** - Finds data to visualize in articles

---

## Technical Instructions (For Claude Code)

### File Location

All PostIQ prompts are in:
```
/src/app/api/admin/ai/route.ts
```

### Architecture Overview

```
User clicks button in admin UI
         ↓
Frontend calls POST /api/admin/ai
         ↓
route.ts receives { action: 'headlines', title, content, ... }
         ↓
Switch statement routes to correct function (e.g., generateHeadlines)
         ↓
Function builds prompt string with user's content embedded
         ↓
Calls Anthropic API: anthropic.messages.create({ model, messages })
         ↓
Parses JSON response and returns to frontend
```

### Prompt Locations by Feature

#### 1. Headlines (`generateHeadlines` - line ~72)
```typescript
const prompt = `You are a sports journalist headline writer for Sports Mockery...
Generate 5 alternative headlines for this article. The headlines should be:
- Attention-grabbing and click-worthy (but not clickbait)
- Witty or satirical when appropriate
- SEO-friendly (include relevant keywords)
- Varied in style (some punchy, some descriptive, some with wordplay)
...`
```

**To modify:** Edit the bullet points or add new guidelines.

#### 2. SEO Optimizer (`optimizeSEO` - line ~115)
```typescript
const prompt = `You are an SEO expert for a sports news website called Sports Mockery.
Analyze this article and provide SEO optimization:
...
"mockeryScore": {
  "score": number from 1-100,
  "feedback": "brief feedback on the article's entertainment value and Sports Mockery style"
}
...`
```

**To modify:** Change the JSON schema or scoring criteria.

#### 3. Article Ideas (`generateIdeas` - line ~164)
```typescript
const prompt = `You are a creative sports content producer for Sports Mockery...
Generate 5 article ideas that would be timely and engaging. Consider:
- Current sports season and what's happening
- Hot takes and controversial opinions
- Player comparisons and debates
- Satirical pieces on team management
- Fan culture and memes
...`
```

**To modify:** Add new idea categories or change the focus.

#### 4. Grammar Check (`checkGrammar` - line ~205)
```typescript
const prompt = `You are a professional editor. Check this content for grammar, spelling, punctuation, and clarity issues.
...`
```

**To modify:** Add style guidelines or specific rules.

#### 5. Auto Excerpt (`generateExcerpt` - line ~250)
```typescript
const prompt = `Generate a compelling excerpt/summary (2-3 sentences, max 200 characters) for this sports article that will make readers want to click through.
...`
```

**To modify:** Change length requirements or tone.

#### 6. Chart Analyzer (`analyzeChartData` - line ~273)
```typescript
const prompt = `You are a sports data analyst for Sports Mockery. Analyze this article and identify data that would make a compelling chart visualization.
...
Choose the best chart type:
- "bar" for comparing values (player stats, rankings, comparisons)
- "line" for trends over time (season progress, performance over weeks/games)
- "pie" for percentages or distributions (play types, snap counts)
...`
```

**To modify:** Add new chart types or change analysis criteria.

### How to Add a New Feature

1. **Add action to interface** (line ~27):
```typescript
interface AIRequest {
  action: 'headlines' | 'seo' | 'ideas' | 'grammar' | 'excerpt' | 'your_new_action'
  // ...
}
```

2. **Add case to switch statement** (line ~44):
```typescript
case 'your_new_action':
  return await yourNewFunction(title || '', content || '', category)
```

3. **Create the function**:
```typescript
async function yourNewFunction(title: string, content: string, category?: string) {
  const prompt = `Your prompt here...`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [{ role: 'user', content: prompt }],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const jsonText = extractJSON(responseText)
    return NextResponse.json(JSON.parse(jsonText))
  } catch (e) {
    return NextResponse.json({ error: 'Failed to parse response' })
  }
}
```

4. **Add UI in frontend** (`/src/components/admin/PostEditor/AIAssistant.tsx`)

### Prompt Best Practices

1. **Be specific about output format:**
   ```
   Return ONLY a JSON array of 5 headline strings, no explanation.
   ```

2. **Include context about Sports Mockery's brand:**
   ```
   Sports Mockery is a Chicago sports news site known for edgy, satirical takes.
   ```

3. **Limit input content to save tokens:**
   ```typescript
   content.slice(0, 2000)  // Only send first 2000 chars
   ```

4. **Define JSON schema explicitly:**
   ```
   Return a JSON object with:
   {
     "field1": "description",
     "field2": ["array", "items"]
   }
   ```

5. **Include fallback instructions:**
   ```
   If no suitable data found, set shouldCreateChart to false.
   ```

### Model Configuration

Current settings:
```typescript
model: 'claude-sonnet-4-20250514'
max_tokens: 500-2000 (varies by feature)
```

To change the model or token limits, edit the `anthropic.messages.create()` call in each function.

### Testing Changes

After modifying prompts:

1. Run TypeScript check:
   ```bash
   npx tsc --noEmit
   ```

2. Test locally:
   ```bash
   npm run dev
   ```

3. Go to `/admin/posts/new` and test the feature

4. Deploy:
   ```bash
   npm run deploy
   ```

---

## Example: Adding Current Events Knowledge

If you want PostIQ to know about current events (e.g., "Bears drafted Caleb Williams"):

**Option 1: Add to relevant prompts**
```typescript
const prompt = `You are a creative sports content producer for Sports Mockery...

Current context (January 2026):
- Bears: Caleb Williams is the franchise QB, second season
- Bulls: Rebuilding around young core
- Cubs: Coming off playoff appearance
- White Sox: New ownership, rebuilding
- Blackhawks: Connor Bedard leading the rebuild

Generate 5 article ideas...`
```

**Option 2: Create a shared context constant**
```typescript
const CURRENT_SPORTS_CONTEXT = `
Current context (January 2026):
- Bears: Caleb Williams is the franchise QB
- Bulls: Rebuilding around young core
...
`

// Then use in prompts:
const prompt = `...
${CURRENT_SPORTS_CONTEXT}
...`
```

---

## Deployment Checklist

After updating PostIQ knowledge:

- [ ] TypeScript compiles without errors
- [ ] Tested feature locally in admin
- [ ] JSON responses parse correctly
- [ ] Committed changes with descriptive message
- [ ] Run `npm run deploy`
