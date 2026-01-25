# PostIQ Audit Report

> **Date:** January 25, 2026
> **Audited Pages:** `/admin/posts/new`, `/studio/posts/new`
> **API Route:** `/api/admin/ai`

---

## Executive Summary

PostIQ is the AI-powered content assistant for Sports Mockery post creation. This audit reviewed all PostIQ functions across both the admin and studio post editors.

**Status:** ❌ **BLOCKED** - All PostIQ functions fail with "AI service temporarily unavailable"

**Root Cause:** The `ANTHROPIC_API_KEY` in `.env.local` is set to a placeholder value (`your-anthropic-key`) instead of a valid API key.

---

## PostIQ Functions Inventory

| Function | Action | Description | Status |
|----------|--------|-------------|--------|
| **Generate Headlines** | `headlines` | Creates 5 alternative headlines with emotion scores | ❌ Blocked |
| **SEO Optimization** | `seo` / `generate_seo` | Analyzes content for SEO title, meta description, keywords, Mockery Score | ❌ Blocked |
| **Article Ideas** | `ideas` | Generates 5 article ideas with angles and emotion tags (Angle Finder) | ❌ Blocked |
| **Grammar Check** | `grammar` | Checks grammar, spelling, ethics, and voice issues | ❌ Blocked |
| **Generate Excerpt** | `excerpt` | Creates 2-3 sentence article summary | ❌ Blocked |
| **Analyze Chart** | `analyze_chart` | Identifies chartable data in content | ❌ Blocked |
| **Generate Chart** | `generate_chart` | Creates chart and inserts shortcode into content | ❌ Blocked |
| **Generate Poll** | `generate_poll` | Creates poll and inserts shortcode into content | ❌ Blocked |

---

## Code Structure

### API Route: `/src/app/api/admin/ai/route.ts`

```
POST /api/admin/ai
├── action: 'headlines' → generateHeadlines()
├── action: 'seo' → optimizeSEO()
├── action: 'generate_seo' → optimizeSEO()
├── action: 'ideas' → generateIdeas()
├── action: 'grammar' → checkGrammar()
├── action: 'excerpt' → generateExcerpt()
├── action: 'analyze_chart' → analyzeChartData()
├── action: 'generate_chart' → generateChartForPost()
└── action: 'generate_poll' → generatePollForPost()
```

**Model Used:** `claude-sonnet-4-20250514`
**SDK:** `@anthropic-ai/sdk`

### Frontend Components

| Page | Component | File |
|------|-----------|------|
| `/admin/posts/new` | AdvancedPostEditor | `/src/components/admin/PostEditor/AdvancedPostEditor.tsx` |
| `/studio/posts/new` | StudioPostEditor | `/src/app/studio/posts/new/StudioPostEditor.tsx` |

Both components share the same PostIQ feature set:
- Left sidebar: Article Ideas panel
- Right sidebar: Headlines, SEO, Chart, Poll options
- Auto-SEO: Triggers when content reaches 150+ words
- Chart Modal: Interactive chart type selection
- Poll Modal: Auto-generated poll questions

---

## Issues Found

### Issue 1: Invalid API Key (CRITICAL)

**Location:** `.env.local`
```
ANTHROPIC_API_KEY=your-anthropic-key  ← PLACEHOLDER, NOT REAL KEY
```

**Impact:** All PostIQ functions fail with error 500

**Fix Required:**
1. Obtain valid Anthropic API key from https://console.anthropic.com
2. Update `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
   ```
3. Ensure production environment variables are set in Vercel

### Issue 2: No Authentication on API Route

**Location:** `/src/app/api/admin/ai/route.ts`

The API route has no authentication middleware. Any caller can access PostIQ functions.

**Recommendation:** Add authentication check:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... rest of handler
}
```

### Issue 3: No Rate Limiting

The API route allows unlimited requests, which could:
- Exhaust Anthropic API credits
- Enable abuse

**Recommendation:** Add rate limiting (e.g., 60 requests/minute per user)

---

## Function Details

### 1. Generate Headlines (`headlines`)

**Input:**
- `title`: Article title
- `content`: Article content (first 500 chars used)
- `category`: Category name
- `team`: Team key (bears, bulls, cubs, etc.)

**Output:**
```json
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"]
}
```

**Knowledge Base Used:**
- `HEADLINE_GUIDELINES` from postiq-knowledge.ts
- Team-specific knowledge (rivalries, historical context)

---

### 2. SEO Optimization (`seo` / `generate_seo`)

**Input:**
- `title`: Article title
- `content`: Article content (first 2000 chars used)
- `category`: Category name

**Output:**
```json
{
  "seoTitle": "Optimized title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "focusKeyword": "primary keyword",
  "secondaryKeywords": ["keyword1", "keyword2"],
  "suggestedSlug": "url-friendly-slug",
  "mockeryScore": {
    "score": 75,
    "feedback": "Feedback on authenticity, credibility, virality"
  },
  "emotionTags": {
    "rage": 30,
    "hope": 50,
    "lol": 10,
    "nostalgia": 10
  },
  "improvements": ["Suggestion 1", "Suggestion 2"],
  "internalLinkSuggestions": ["Topic 1", "Topic 2"]
}
```

---

### 3. Article Ideas (`ideas`)

**Input:**
- `category`: Category name
- `team`: Team key

**Output:**
```json
{
  "ideas": [
    {
      "headline": "Article headline",
      "angle": "Approach description",
      "type": "news|opinion|satire|analysis|listicle|hot-take",
      "emotion": "rage|hope|LOL|nostalgia|panic|analysis",
      "emotionScore": 75,
      "viralPotential": "high"
    }
  ]
}
```

---

### 4. Grammar Check (`grammar`)

**Input:**
- `content`: Full article content

**Output:**
```json
{
  "correctedContent": "Content with grammar fixes applied",
  "issues": [
    {
      "original": "problematic text",
      "corrected": "fixed text",
      "explanation": "why it was wrong",
      "type": "grammar|spelling|punctuation|attribution|voice|defamation-risk"
    }
  ],
  "issueCount": 3,
  "ethicsFlags": ["Any serious journalism concerns"],
  "voiceSuggestions": ["Ways to make copy more SM-voice"]
}
```

---

### 5. Generate Excerpt (`excerpt`)

**Input:**
- `title`: Article title
- `content`: Article content (first 1500 chars used)

**Output:**
```json
{
  "excerpt": "2-3 sentence teaser text (max 200 chars)"
}
```

---

### 6. Analyze Chart (`analyze_chart`)

**Input:**
- `title`: Article title
- `content`: Article content (first 3000 chars, HTML stripped)
- `category`: Category name

**Output:**
```json
{
  "shouldCreateChart": true,
  "chartType": "bar|line|pie|player-comparison|team-stats",
  "chartTitle": "Chart title",
  "data": [
    { "label": "Category", "value": 100 }
  ],
  "paragraphIndex": 2,
  "reasoning": "Why this data makes a good chart"
}
```

---

### 7. Generate Chart (`generate_chart`)

**Input:** Same as analyze_chart

**Process:**
1. Analyzes content for chartable data
2. Creates chart via `/api/charts` endpoint
3. Inserts `[chart:ID]` shortcode after specified paragraph

**Output:**
```json
{
  "success": true,
  "chartId": "uuid",
  "shortcode": "[chart:uuid]",
  "chartType": "bar",
  "chartTitle": "Chart title",
  "updatedContent": "HTML with chart shortcode inserted"
}
```

---

### 8. Generate Poll (`generate_poll`)

**Input:**
- `title`: Article title
- `content`: Article content (first 3000 chars)
- `category`: Category name

**Process:**
1. Identifies debatable topic from content
2. Creates poll via `/api/admin/polls` endpoint
3. Inserts `[poll:ID]` shortcode after specified paragraph

**Output:**
```json
{
  "success": true,
  "pollId": "uuid",
  "shortcode": "[poll:uuid]",
  "question": "Poll question",
  "options": ["Option 1", "Option 2", "Option 3"],
  "updatedContent": "HTML with poll shortcode inserted"
}
```

---

## UI Integration Points

### Admin Post Editor (`/admin/posts/new`)

| Feature | Location | Trigger |
|---------|----------|---------|
| Article Ideas | Left sidebar "Ideas" tab | Click "Get Ideas" button |
| Headlines | Right sidebar "AI" section | Click "Headlines" button |
| SEO | Right sidebar accordion | Auto at 150+ words, or click "Regenerate SEO" |
| Grammar | Right sidebar | Click "Grammar" button |
| Excerpt | Right sidebar | Click "Excerpt" button |
| Auto-Chart | Right sidebar checkbox | Checked before publish |
| Auto-Poll | Right sidebar checkbox | Checked before publish |
| Chart Modal | Left sidebar | Click "Add Chart" button |

### Studio Post Editor (`/studio/posts/new`)

Same features as Admin editor, with identical UI placement.

---

## Recommendations

### Immediate Actions

1. **Set Valid API Key**
   ```bash
   # In .env.local
   ANTHROPIC_API_KEY=sk-ant-api03-YOUR-REAL-KEY
   ```

2. **Verify Production Environment**
   - Check Vercel environment variables
   - Ensure `ANTHROPIC_API_KEY` is set in production

### Security Improvements

1. Add authentication middleware to `/api/admin/ai`
2. Implement rate limiting (60 req/min)
3. Add request logging for audit trail

### UX Improvements

1. Better error messages when API fails
2. Loading states for each PostIQ function
3. Retry logic with exponential backoff

---

## Testing Checklist (After API Key Fixed)

| Function | Test Action | Expected Result |
|----------|-------------|-----------------|
| Headlines | Click "Headlines" button with title/content | 5 headlines appear |
| SEO | Wait for 150+ words in content | SEO fields auto-populate |
| Ideas | Click "Get Ideas" button | 5 article ideas appear |
| Grammar | Click "Grammar" button | Corrected content returned |
| Excerpt | Click "Excerpt" button | 2-3 sentence summary appears |
| Chart | Click "Add Chart" button | Chart modal opens with suggestions |
| Poll | Check "Auto-Add Poll" and publish | Poll shortcode inserted |

---

## Files Referenced

| File | Purpose |
|------|---------|
| `/src/app/api/admin/ai/route.ts` | PostIQ API endpoint |
| `/src/lib/postiq-knowledge.ts` | System prompts and team knowledge |
| `/src/components/admin/PostEditor/AdvancedPostEditor.tsx` | Admin post editor |
| `/src/app/studio/posts/new/StudioPostEditor.tsx` | Studio post editor |
| `/src/app/admin/posts/new/page.tsx` | Admin new post page |
| `/src/app/studio/posts/new/page.tsx` | Studio new post page |
