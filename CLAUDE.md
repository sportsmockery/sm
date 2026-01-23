# SportsMockery - Claude Project Knowledge Base

> **Last Updated:** January 23, 2026
> **Purpose:** This file contains everything Claude needs to know to work on this project.

---

## Project Overview

**Product:** SportsMockery - Chicago sports news and fan engagement platform
**URL:** https://test.sportsmockery.com (test), https://sportsmockery.com (production)
**Owner:** Chris

### Tech Stack
- **Framework:** Next.js 16+ (App Router)
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS

---

## Styling Rules (IMPORTANT)

### Always Use Inline Styles for Button Colors
Tailwind classes for colors/borders on buttons often get overridden by other CSS. **Always use inline `style={{}}` for:**
- `backgroundColor`
- `color`
- `border`
- `outline`
- SVG `stroke` color

**Example - Correct:**
```jsx
<Link
  href="/fan-chat"
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded"
  style={{
    backgroundColor: theme === 'dark' ? '#ffffff' : '#bc0000',
    color: theme === 'dark' ? '#bc0000' : '#ffffff',
    border: 'none',
    outline: 'none',
  }}
>
  <svg stroke={theme === 'dark' ? '#bc0000' : '#ffffff'} ...>
```

**Example - Wrong (will get overridden):**
```jsx
<Link
  className={`... ${theme === 'dark' ? 'bg-white text-[#bc0000]' : 'bg-[#bc0000] text-white'}`}
>
```

### Brand Colors
- **Primary Red:** `#bc0000`
- Use this for CTA buttons, accents, and highlights

### Teams Covered
- Chicago Bears (NFL)
- Chicago Bulls (NBA)
- Chicago Blackhawks (NHL)
- Chicago Cubs (MLB)
- Chicago White Sox (MLB)

---

## Scout - The Ask AI Model

**Scout** is the AI-powered "Ask AI" feature for Chicago sports questions. When the user mentions "Scout", "the AI model", "Ask AI", or "query AI", they are referring to this system.

### Where Scout Lives
| Location | Description |
|----------|-------------|
| Backend | https://datalab.sportsmockery.com/api/query |
| Frontend | /ask-ai page on test.sportsmockery.com |
| API Route | /src/app/api/ask-ai/route.ts (proxies to Data Lab) |

### How Scout Works
1. User submits question on /ask-ai page
2. Frontend sends POST to /api/ask-ai with `{ query, sessionId }`
3. API route proxies to Data Lab: https://datalab.sportsmockery.com/api/query
4. Data Lab uses Perplexity sonar-pro model to generate response
5. Response includes: `response`, `sessionId`, `sessionContext`, `chartData`, `bonusInsight`

### Session Management
Scout maintains conversation context for follow-ups:
- **sessionId**: Passed between requests to maintain context
- **sessionContext**: `{ player, team, season, sport }` for pronoun resolution
- Pronouns like "he", "his", "that player" resolve to last mentioned entity

### Key Files
| File | Purpose |
|------|---------|
| `/src/app/api/ask-ai/route.ts` | Proxies requests to Data Lab API |
| `/src/app/ask-ai/page.tsx` | Ask AI chat interface |
| `/AskAI_Wrong.md` | QA test failure log |

### Known Issues (from QA testing)
See `/AskAI_Wrong.md` for documented failures:
1. Citation markers [1][2][3] appearing in responses
2. Player name typo handling needs improvement
3. Database errors sometimes leak to user responses

---

## PostIQ - Admin Content Assistant

**PostIQ** is the AI-powered content assistant for admin post creation. When the user mentions "PostIQ", "admin AI", or "content assistant", they are referring to this system.

**Note:** PostIQ is separate from Scout. Scout answers user sports questions; PostIQ helps admins write posts.

### Where PostIQ Lives
| Location | Description |
|----------|-------------|
| API Route | `/src/app/api/admin/ai/route.ts` |
| Frontend | `/src/components/admin/PostEditor/AIAssistant.tsx` |
| UI Location | AI Assistant panel in `/admin/posts/new` |

### How PostIQ Works
- Uses Claude Sonnet 4 (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`
- Direct API calls to Anthropic (no Data Lab involved)
- Returns JSON responses parsed by the frontend

### Features
| Feature | Description |
|---------|-------------|
| **Headlines** | Generates 5 alternative headlines for articles |
| **SEO** | Analyzes content, returns optimized title, meta description, keywords, and Mockery Score (1-100) |
| **Ideas** | Generates 5 article ideas based on category/team |
| **Grammar** | Checks grammar, spelling, and punctuation; shows issues with corrections |
| **Excerpt** | Auto-generates 2-3 sentence article summary |
| **Auto-Chart** | Analyzes article, creates chart from data, inserts into content (checkbox in sidebar) |

### API Usage
```typescript
POST /api/admin/ai
{ action: 'headlines' | 'seo' | 'ideas' | 'grammar' | 'excerpt' | 'generate_chart', title, content, category, team }
```

### Key Files
| File | Purpose |
|------|---------|
| `/src/app/api/admin/ai/route.ts` | Backend route handling all PostIQ requests |
| `/src/components/admin/PostEditor/AIAssistant.tsx` | Frontend UI component |
| `/docs/PostIQ_Guide.md` | Full documentation |

---

## Key Features

### Profile / Favorite Teams
- Users can select favorite Chicago teams
- "Eliminate other teams from Homepage" toggle filters feed
- Stored in `sm_user_preferences` table with `eliminate_other_teams` column

### Fan Chat
- AI-powered chat personalities for each team channel
- Chicago Lounge for general sports talk
- Uses `/api/fan-chat/ai-response` endpoint

### Video Section (formerly Podcasts)
- Bears Film Room: /bears-film-room
- Pinwheels & Ivy: /pinwheels-and-ivy

---

## Deployment

**⚠️ CRITICAL: Multiple Claude Code sessions run in parallel. Use the safe deploy command.**

### Deploy Command (Handles Everything Automatically)
```bash
# Commit your changes first, then:
npm run deploy
```

The deploy script automatically:
1. Fetches latest from remote
2. Pulls/rebases if behind (gets other sessions' changes)
3. Attempts auto-rebase if branches diverged
4. Pushes your commits to git
5. Deploys to Vercel

### If Merge Conflicts Occur
The script will abort and show instructions:
```bash
git pull --rebase origin main
# Edit conflicting files to resolve
git add <resolved-files>
git rebase --continue
npm run deploy
```

### Protections in Place
| Layer | What It Does |
|-------|--------------|
| `npm run deploy` | Auto-syncs, pushes, then deploys |
| `bin/vercel` wrapper | Same checks for any `vercel --prod` command |
| Git pre-push hook | Blocks push if diverged |

### NEVER Do These
- ❌ Deploy without committing first
- ❌ Force push (`git push --force`)
- ❌ Run `/usr/local/bin/vercel` directly (bypasses wrapper)

Production URL: https://test.sportsmockery.com

---

## Related Projects

- **SM Data Lab** (`/Users/christopherburhans/Documents/projects/sm-data-lab`)
  - Backend for Scout AI
  - Sports analytics and data
  - URL: https://datalab.sportsmockery.com
