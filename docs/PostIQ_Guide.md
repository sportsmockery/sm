# PostIQ - AI Content Assistant Guide

> **Last Updated:** January 23, 2026
> **Purpose:** Documentation for the PostIQ AI assistant used in admin post creation

---

## Overview

**PostIQ** is the AI-powered content assistant for SportsMockery admins. It helps writers create better headlines, optimize SEO, generate article ideas, and check grammar for correctness.

**Note:** PostIQ is separate from Scout (the Ask AI feature for users). Scout answers Chicago sports questions; PostIQ helps admins write posts.

---

## Technical Details

| Property | Value |
|----------|-------|
| **API Route** | `/api/admin/ai` |
| **Model** | Claude Sonnet 4 (`claude-sonnet-4-20250514`) |
| **SDK** | `@anthropic-ai/sdk` |
| **Frontend Component** | `/src/components/admin/PostEditor/AIAssistant.tsx` |
| **Backend Route** | `/src/app/api/admin/ai/route.ts` |

---

## Features

### 1. Headlines Generator

Generates 5 alternative headlines for your article.

**How it works:**
- Sends title, content preview (500 chars), category, and team to Claude
- Returns attention-grabbing, SEO-friendly headlines
- Mix of styles: punchy, descriptive, wordplay

**API Call:**
```typescript
POST /api/admin/ai
{ action: 'headlines', title, content, category, team }
```

**Response:**
```json
{ "headlines": ["Headline 1", "Headline 2", ...] }
```

---

### 2. SEO Optimizer

Analyzes content and provides SEO recommendations plus a "Mockery Score."

**How it works:**
- Sends title, content (2000 chars), and category to Claude
- Returns optimized title, meta description, keywords, and improvement suggestions
- Mockery Score (1-100) rates the article's entertainment value and SportsMockery style

**API Call:**
```typescript
POST /api/admin/ai
{ action: 'seo', title, content, category }
```

**Response:**
```json
{
  "seoTitle": "Optimized title (50-60 chars)",
  "metaDescription": "Meta description (150-160 chars)",
  "focusKeyword": "primary keyword",
  "secondaryKeywords": ["keyword1", "keyword2"],
  "mockeryScore": {
    "score": 85,
    "feedback": "Great satirical edge..."
  },
  "improvements": ["Add more keywords...", "Shorten paragraphs..."]
}
```

---

### 3. Article Ideas Generator

Generates 5 timely article ideas based on category/team.

**How it works:**
- Considers current sports season, hot takes, player comparisons, fan culture
- Returns headline, angle, and content type for each idea
- Types: news, opinion, satire, analysis, listicle

**API Call:**
```typescript
POST /api/admin/ai
{ action: 'ideas', category, team }
```

**Response:**
```json
{
  "ideas": [
    {
      "headline": "Bears Finally Found Their QB, Now What?",
      "angle": "Analysis of what Chicago needs to build around Caleb Williams",
      "type": "analysis"
    }
  ]
}
```

---

### 4. Grammar Check

Checks content for grammar, spelling, punctuation, and clarity issues.

**How it works:**
- Sends full content to Claude
- Identifies grammar, spelling, and punctuation errors
- Returns corrected content and list of issues found
- Shows before/after for each issue with explanation

**API Call:**
```typescript
POST /api/admin/ai
{ action: 'grammar', content }
```

**Response:**
```json
{
  "correctedContent": "The full content with all corrections applied...",
  "issues": [
    {
      "original": "the problematic text",
      "corrected": "the corrected text",
      "explanation": "brief explanation of the issue"
    }
  ],
  "issueCount": 3
}
```

**Max tokens:** 2000

---

### 5. Auto Excerpt

Generates a compelling 2-3 sentence excerpt for the article.

**How it works:**
- Sends title and content preview (1500 chars)
- Returns a click-worthy summary (max 200 chars)

**API Call:**
```typescript
POST /api/admin/ai
{ action: 'excerpt', title, content }
```

**Response:**
```json
{ "excerpt": "Compelling summary that makes readers want to click..." }
```

---

## UI Location

PostIQ appears as the **"AI Assistant"** panel in the post editor at `/admin/posts/new`.

**Tabs:**
1. **Headlines** - Generate alternative headlines
2. **SEO** - Analyze SEO + Auto Excerpt button
3. **Ideas** - Generate article ideas
4. **Grammar** - Check grammar and apply corrections

---

## Key Files

| File | Purpose |
|------|---------|
| `/src/app/api/admin/ai/route.ts` | Backend API route handling all PostIQ requests |
| `/src/components/admin/PostEditor/AIAssistant.tsx` | Frontend UI component |
| `/src/components/admin/PostEditor/AdvancedPostEditor.tsx` | Parent component that includes AIAssistant |

---

## Error Handling

- All API errors return: `{ error: 'AI service temporarily unavailable' }` with status 500
- Frontend displays error in red banner within the AI Assistant panel
- JSON parsing failures have fallbacks (e.g., line-by-line extraction for headlines)

---

## Comparison: PostIQ vs Scout

| | PostIQ | Scout |
|---|--------|-------|
| **Purpose** | Help admins write posts | Answer user sports questions |
| **Users** | Admin writers only | Public users |
| **Model** | Claude Sonnet 4 | Perplexity sonar-pro |
| **Backend** | Direct Anthropic API | SM Data Lab |
| **Features** | Headlines, SEO, ideas, grammar | Q&A, charts, follow-ups |
