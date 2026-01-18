# Environment Variables

## Required

These are required for the chat system to function:

```bash
# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (for AI responder, already configured)
ANTHROPIC_API_KEY=your-anthropic-key
```

## Optional

These enhance functionality but have fallbacks:

```bash
# GIF API (Tenor or GIPHY)
# If not set, uses curated sports GIFs
TENOR_API_KEY=your-tenor-key
GIPHY_API_KEY=your-giphy-key

# Disqus SSO
# If not set, Disqus SSO is disabled
DISQUS_SECRET_KEY=your-disqus-secret
DISQUS_PUBLIC_KEY=your-disqus-public
```

---

## Supabase Configuration

### Enable Realtime

1. Go to Supabase Dashboard
2. Navigate to Database > Replication
3. Ensure these tables are in the publication:
   - `chat_messages`
   - `chat_reactions`
   - `chat_presence`
   - `chat_dm_messages`

### Row Level Security

RLS is enabled by default in the schema. Verify:

1. Go to Database > Tables
2. Check each `chat_*` table has RLS enabled
3. Review policies match the schema

---

## GIF API Setup

### Option 1: Tenor (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Tenor API
4. Create API credentials
5. Add to `.env.local`:
   ```
   TENOR_API_KEY=your-key
   ```

### Option 2: GIPHY

1. Go to [GIPHY Developers](https://developers.giphy.com/)
2. Create an app
3. Get API key
4. Add to `.env.local`:
   ```
   GIPHY_API_KEY=your-key
   ```

### Fallback

If neither API is configured, the system uses curated sports GIFs:
- Celebration GIFs
- Sports victory GIFs
- Chicago teams GIFs

---

## Disqus SSO Setup

SSO allows users to use their site login for Disqus comments.

### Step 1: Enable SSO in Disqus

1. Go to [Disqus Admin](https://disqus.com/admin/)
2. Select your site
3. Go to Settings > Advanced
4. Enable "Single Sign-On"
5. Note your Public and Secret keys

### Step 2: Configure Environment

```bash
DISQUS_SECRET_KEY=your-64-character-secret
DISQUS_PUBLIC_KEY=your-public-key
```

### Step 3: Configure Remote Auth URL

In Disqus Admin, set:
- **Remote Auth URL**: `https://yourdomain.com/api/auth/disqus-sso`

### How It Works

1. User logs in to your site (Supabase Auth)
2. Frontend calls `/api/auth/disqus-sso` with token
3. API generates HMAC-SHA1 signed payload
4. Payload returned to Disqus embed
5. User automatically logged in to Disqus

---

## AI Responder Configuration

The AI uses Claude (Anthropic) and requires:

```bash
ANTHROPIC_API_KEY=sk-ant-...
```

### Model Configuration

Default model in `ai-responder.ts`:
```typescript
model: 'claude-sonnet-4-20250514'
```

### Customization

Edit `src/lib/chat/ai-responder.ts`:

- `TEAM_INFO` - Team knowledge base
- `CHICAGO_GREETINGS` - Time-based greetings
- `RIVAL_TRASH_TALK` - Rivalry phrases
- `buildSystemPrompt()` - AI personality

---

## Production Checklist

### Security

- [ ] Service role key is not exposed client-side
- [ ] RLS policies are active on all tables
- [ ] API routes validate authentication
- [ ] Rate limiting is configured

### Performance

- [ ] Realtime is enabled for required tables
- [ ] Database indexes are created
- [ ] Message limit is reasonable (50-100)

### Monitoring

- [ ] Moderation log table is active
- [ ] Error tracking configured
- [ ] Rate limit alerts set up

---

## Local Development

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-key

# Anthropic
ANTHROPIC_API_KEY=sk-ant-your-key

# Optional
TENOR_API_KEY=
GIPHY_API_KEY=
DISQUS_SECRET_KEY=
DISQUS_PUBLIC_KEY=
```

### Local Supabase

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Or run SQL files directly
psql postgresql://postgres:postgres@localhost:54322/postgres \
  -f supabase/chat-schema.sql \
  -f supabase/chat-moderation-rules.sql
```
