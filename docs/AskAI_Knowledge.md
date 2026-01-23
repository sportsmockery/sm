# Scout (Ask AI) - Complete Knowledge Base

> **Last Updated:** January 23, 2026
> **Purpose:** Comprehensive documentation for the Scout AI system

---

## Overview

**Scout** is the AI-powered "Ask AI" feature for Chicago sports questions on SportsMockery. This is the official name for the AI assistant.

### Alternate Names (all refer to Scout)
- Ask AI
- The AI model
- Query AI
- Scout AI

### Teams Covered
- Chicago Bears (NFL)
- Chicago Bulls (NBA)
- Chicago Blackhawks (NHL)
- Chicago Cubs (MLB)
- Chicago White Sox (MLB)

---

## Architecture

### System Flow

```
User submits question on /ask-ai page
         ↓
Frontend sends POST to /api/ask-ai with { query, sessionId }
         ↓
API route proxies to Data Lab: https://datalab.sportsmockery.com/api/query
         ↓
Data Lab uses Perplexity sonar-pro model to generate response
         ↓
Response includes: response, sessionId, sessionContext, chartData, bonusInsight
         ↓
Frontend displays formatted response with optional charts
```

### Key Locations

| Location | Description |
|----------|-------------|
| Backend API | https://datalab.sportsmockery.com/api/query |
| Frontend Page | /ask-ai on test.sportsmockery.com |
| API Route | /src/app/api/ask-ai/route.ts (proxies to Data Lab) |
| Frontend Component | /src/app/ask-ai/page.tsx |

### No-Cache Configuration

Scout is configured to always fetch fresh responses from Data Lab:

```typescript
// In /src/app/api/ask-ai/route.ts
export const dynamic = 'force-dynamic'
export const revalidate = 0

// In fetch call:
cache: 'no-store'
```

This ensures any changes to the Scout model in DataLabs are instantly reflected on test.sportsmockery.com.

---

## Session Management

Scout maintains conversation context for follow-up questions using sessions.

### Session Flow

1. First question: No sessionId sent
2. Response includes new sessionId
3. Follow-up questions: Include sessionId from previous response
4. Context carries over for pronoun resolution

### Session Context Object

```typescript
{
  sessionId: string,
  sessionContext: {
    player?: string,    // Last mentioned player
    team?: string,      // Last mentioned team
    season?: number,    // Last mentioned season
    sport?: string      // Last mentioned sport
  },
  contextApplied: boolean  // Whether context was used in this response
}
```

### Pronoun Resolution

When sessionContext exists:
- "he", "his", "that player" → resolves to `sessionContext.player`
- "they", "the team" → resolves to `sessionContext.team`
- "this year", "last season" → resolves relative to `sessionContext.season`

---

## API Reference

### POST /api/ask-ai

Main endpoint for Scout queries.

**Request:**
```json
{
  "query": "How many touchdowns did Caleb Williams throw?",
  "sessionId": "optional-session-id-from-previous-response"
}
```

**Response:**
```json
{
  "response": "Caleb Williams threw 27 passing touchdowns in the 2025 regular season...",
  "rowCount": 1,
  "source": "ai",
  "team": "bears",
  "teamDisplayName": "Chicago Bears",
  "sport": "nfl",
  "dataGapLogged": false,
  "showSuggestions": true,
  "suggestions": ["Follow-up question 1", "Follow-up question 2"],
  "relatedArticles": [],
  "newsSummary": null,
  "chartData": {
    "type": "bar",
    "title": "Caleb Williams TDs by Game",
    "labels": ["Week 1", "Week 2", "..."],
    "datasets": [{ "label": "TDs", "data": [2, 3, "..."] }]
  },
  "bonusInsight": "Fun fact: This tied the Bears rookie record!",
  "rawData": null,
  "sessionId": "abc123",
  "sessionContext": { "player": "Caleb Williams", "team": "bears", "season": 2025 },
  "contextApplied": false
}
```

### GET /api/ask-ai?q=query

Simple GET endpoint for URL-based queries (converts to POST internally).

### Source Types

| Source | Description |
|--------|-------------|
| `ai` | Response from AI model (Perplexity sonar-pro) |
| `web_fallback` | Response sourced from web search |
| `error` | Error occurred during processing |

---

## Chart Data Transformation

The API transforms DataLab's chart format to the frontend component format:

**DataLab Format:**
```json
{
  "type": "bar",
  "title": "Stats",
  "columns": ["Type", "Value"],
  "rows": [{ "Type": "TDs", "Value": 27 }]
}
```

**Frontend Component Format:**
```json
{
  "type": "bar",
  "title": "Stats",
  "labels": ["TDs"],
  "datasets": [{ "label": "Value", "data": [27] }]
}
```

---

## Known Issues (QA Testing)

From testing on 2026-01-22, the following issues were documented:

### 1. Citation Markers in Responses (High Severity)

**Problem:** Perplexity's `[1][2][3]` citation markers appear in user-facing text.

**Example:**
> "Caleb Williams threw **27 passing touchdowns** in the 2025 regular season for the Bears.[1][6]"

**Fix Required:** Strip citation markers in Data Lab API:
```javascript
response.replace(/\[\d+\]/g, '')
```

### 2. Player Name Typo Handling (High Severity)

**Problem:** Common misspellings not recognized.

**Example:**
- Query: "What did Derozen avg last yr?"
- Response: "Could not determine team or sport from question"

**Expected:** Recognize "Derozen" as DeMar DeRozan (Bulls)

**Fix Required:** Improve fuzzy matching with Levenshtein distance or common misspelling lists.

### 3. Database Errors Leaking to Users (Medium Severity)

**Problem:** Internal errors exposed in responses.

**Example:**
> "Hey buddy, your question was crystal clear but hit a database snag on the 'Cubs games' table..."

**Fix Required:** Never expose implementation details; provide friendly fallback responses.

### 4. Missing Data Visualizations (Medium Severity)

**Problem:** Stats questions return no tables/charts when they should.

**Expected:** Stats queries should include game-by-game or season summary tables.

### 5. Source Misclassification (Medium Severity)

**Problem:** Source marked as "error" even when valid answer provided.

---

## Training Guidelines

Scout should follow these guidelines (from Claude_AI_Training.md):

### Response Style
- Produce beautifully formatted answers with tables, charts, and narrative flow
- Never show citation markers like [1][2][3]
- Never show errors (no "could not determine team or sport", no stack traces)
- Correct all typos/slang silently - never lecture; answer as if typed perfectly

### Data Presentation
- Include at least one well-structured table for stats questions
- Use charts for visual data comparison
- Add bonus insights for engaging responses

### Error Handling
- Provide friendly fallback messages
- Never expose database or implementation details
- Suggest alternative questions when unable to answer

---

## External Source Logging

When Scout cannot answer from the internal database, it logs queries and validates with external sources.

### Validation Process

1. Query logged to `ai_external_queries_log`
2. Data validated with 2+ independent sources
3. If validated, imported to team AI tables
4. Cached for future queries

### Team AI Tables

- `bears_AI` - Chicago Bears data
- `bulls_AI` - Chicago Bulls data
- `cubs_AI` - Chicago Cubs data
- `whitesox_AI` - Chicago White Sox data
- `blackhawks_AI` - Chicago Blackhawks data

### Validation Sources

| Source | Reliability |
|--------|-------------|
| ESPN API | 0.95 |
| Pro Football Reference | 0.92 |
| Basketball Reference | 0.92 |
| Baseball Reference | 0.92 |
| Hockey Reference | 0.92 |
| Official league sites (NFL.com, NBA.com, etc.) | 0.95 |

### Data Types

| Type | Example Query |
|------|---------------|
| `player_stat` | "Caleb Williams passing yards" |
| `game_info` | "Bears vs Packers score" |
| `roster` | "Bears starting lineup" |
| `news` | "Bears trade rumors" |
| `historical` | "Bears all-time wins" |
| `general` | "Why are the Bears struggling?" |

---

## File Structure

```
src/
├── app/
│   ├── ask-ai/
│   │   └── page.tsx              # Scout chat interface
│   ├── api/
│   │   ├── ask-ai/
│   │   │   └── route.ts          # Proxies to Data Lab API
│   │   └── admin/
│   │       └── ai-logging/
│   │           └── route.ts      # Admin API for logging
│   └── admin/
│       └── ai-logging/
│           └── page.tsx          # Admin UI page
├── components/
│   └── admin/
│       └── Sidebar.tsx           # Includes AI Logging link
└── lib/
    └── ai-external-service.ts    # External source service functions

docs/
├── AskAI_Knowledge.md            # This file
└── Ask_AI_External_Functions.md  # Detailed external logging docs

/AskAI_Wrong.md                   # QA test failure log
/CLAUDE.md                        # Project overview with Scout section
```

---

## Related Projects

- **SM Data Lab** (`/Users/christopherburhans/Documents/projects/sm-data-lab`)
  - Backend for Scout AI
  - Sports analytics and data
  - URL: https://datalab.sportsmockery.com
  - Contains the actual Perplexity AI integration and prompt engineering

---

## Admin Interface

Access at: `/admin/ai-logging`

### Features:
1. **Query Logs Tab** - View external queries with filtering
2. **Imported Data Tab** - View data in team AI tables
3. **Statistics Tab** - Cache hit rate, validation success rate, etc.

---

## Troubleshooting

### Scout Not Returning Fresh Data
- Verify `cache: 'no-store'` in route.ts
- Verify `dynamic = 'force-dynamic'` export
- Check Data Lab API is responding

### Session Context Not Working
- Verify sessionId is being passed in requests
- Check sessionId is extracted from responses
- Look for sessionContext in response payload

### Charts Not Displaying
- Check chartData is not null in response
- Verify transformation function handles DataLab format
- Check frontend DataVisualization component

### Player Names Not Recognized
- Issue logged in AskAI_Wrong.md
- Requires Data Lab fuzzy matching improvement
- Common misspellings should be handled
