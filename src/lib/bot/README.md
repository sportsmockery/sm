# SportsMockery X Bot

AI-powered bot for engaging with Chicago sports communities on X (Twitter).

## Overview

This bot monitors X Communities for the 5 Chicago sports teams and generates engaging, personality-driven responses using Claude AI. It acts as the voice of @sportsmockery, providing analytical yet fan-friendly commentary.

## Features

- **Community Monitoring**: Scans X for team-related tweets
- **AI Response Generation**: Uses Claude to create authentic, engaging responses
- **Article Promotion**: Automatically promotes SportsMockery articles
- **Rate Limiting**: Configurable daily limits per team
- **Activity Tracking**: Logs all bot actions for monitoring
- **Keyword Prioritization**: Responds first to high-value conversations

## Architecture

```
src/lib/bot/
├── index.ts           # Module exports
├── types.ts           # TypeScript types
├── twitter-client.ts  # X API integration
├── claude-generator.ts # AI response generation
├── bot-service.ts     # Main orchestration
└── README.md          # This file

src/app/api/bot/
├── monitor/route.ts   # Trigger monitoring
├── post/route.ts      # Post responses
├── status/route.ts    # Bot status
└── config/route.ts    # Configuration
```

## Environment Variables

Add these to your `.env.local`:

```bash
# Twitter/X API (Required)
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_BEARER_TOKEN=your_bearer_token

# Anthropic Claude API (Required)
ANTHROPIC_API_KEY=sk-ant-your_key

# Bot Security (Optional but recommended)
BOT_API_KEY=your_secret_api_key

# Existing Supabase keys are also required
```

## Getting Twitter/X API Keys

1. Go to [developer.twitter.com](https://developer.twitter.com)
2. Sign up for a developer account linked to @sportsmockery
3. Create a new App with "Automated" use case
4. Get keys from the "Keys and Tokens" section:
   - API Key & Secret (Consumer keys)
   - Access Token & Secret
   - Bearer Token
5. Ensure you have "Elevated" access for posting

## Database Setup

Run the migration to create bot tables:

```sql
-- Run this in Supabase SQL Editor
\i migrations/x-bot-schema.sql
```

Or manually execute the SQL from `migrations/x-bot-schema.sql`.

## API Endpoints

### POST /api/bot/monitor

Trigger monitoring for X communities.

```bash
curl -X POST http://localhost:3000/api/bot/monitor \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_BOT_API_KEY" \
  -d '{"team_slug": "chicago-bears"}'
```

**Request Body:**
- `team_slug` (optional): Filter to specific team

**Response:**
```json
{
  "success": true,
  "results": [{
    "team_slug": "chicago-bears",
    "tweets_found": 20,
    "tweets_processed": 15,
    "replies_queued": 3,
    "errors": []
  }],
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### POST /api/bot/post

Post pending responses to X.

```bash
curl -X POST http://localhost:3000/api/bot/post \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_BOT_API_KEY" \
  -d '{"limit": 5}'
```

**Request Body:**
- `response_id` (optional): Post specific response
- `team_slug` (optional): Filter by team
- `limit` (optional, max 10): Number to post

### GET /api/bot/status

Get current bot status.

```bash
curl http://localhost:3000/api/bot/status?team=chicago-bears
```

**Response:**
```json
{
  "success": true,
  "statuses": [{
    "team_slug": "chicago-bears",
    "enabled": true,
    "today_replies": 5,
    "today_posts": 1,
    "daily_reply_limit": 10,
    "daily_post_limit": 2,
    "can_reply": true,
    "can_post": true,
    "pending_responses": 3
  }],
  "recent_logs": [...],
  "pending_by_team": {"chicago-bears": 3}
}
```

### GET/PUT /api/bot/config

Get or update bot configuration.

```bash
# Get config
curl http://localhost:3000/api/bot/config?team=chicago-bears

# Update config
curl -X PUT http://localhost:3000/api/bot/config \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_BOT_API_KEY" \
  -d '{
    "team_slug": "chicago-bears",
    "enabled": true,
    "daily_reply_limit": 10,
    "daily_post_limit": 2
  }'
```

## Scheduled Execution

### Vercel Cron (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/bot/monitor",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/bot/post",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### Manual Cron

Set up external cron to call the endpoints:

```bash
# Every 15 minutes: Monitor for engagement opportunities
*/15 * * * * curl -X POST https://sportsmockery.com/api/bot/monitor -H "x-api-key: YOUR_KEY"

# Every 30 minutes: Post pending responses
*/30 * * * * curl -X POST https://sportsmockery.com/api/bot/post -H "x-api-key: YOUR_KEY"
```

## Bot Personality

The bot speaks as `@sportsmockery` with these traits:
- Passionate Chicago sports fan
- Analytical and stats-driven
- Funny when organic, never forced
- Always respectful
- Acknowledges fan opinions
- Never reveals it's AI

Each team has specific personality adjustments (references to stadiums, history, current topics).

## Safety & Compliance

### Rate Limits
- Default: 10 replies/day, 2 original posts/day per team
- Configurable delays between posts (30s-5min)
- Varies timing for human-like behavior

### Content Filtering
- Avoids politics, gambling, controversial topics
- Blocks specific users
- Keyword-based priority system

### X Platform Compliance
- Respects API rate limits
- Uses OAuth 1.0a for user-context actions
- Human-like posting patterns

## Monitoring & Debugging

Check logs in the `sm_bot_logs` table:

```sql
SELECT * FROM sm_bot_logs
WHERE team_slug = 'chicago-bears'
ORDER BY created_at DESC
LIMIT 50;
```

Check pending responses:

```sql
SELECT * FROM sm_bot_responses
WHERE status = 'pending'
ORDER BY created_at;
```

## Development

Test locally without posting:

1. Set up environment variables
2. Run migrations
3. Call monitor endpoint to queue responses
4. Check `sm_bot_responses` table
5. Review generated content before enabling posting

## Troubleshooting

### "Twitter client not configured"
- Check all TWITTER_* environment variables are set

### "Unauthorized" on API calls
- Verify BOT_API_KEY matches between requests and env

### No tweets found
- Check X API access level (need Elevated)
- Verify search queries are returning results

### Responses too long
- Claude output is automatically truncated to 280 chars
- Check truncation logic if issues persist
