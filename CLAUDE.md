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
