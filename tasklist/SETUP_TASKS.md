# SportsMockery Setup Tasks

Complete these tasks to finish deploying the SportsMockery rebuild.

---

## 1. Supabase Database Schema

### Required Table: `sm_user_preferences`

Run this SQL in Supabase SQL Editor:

```sql
-- Create user preferences table for personalization
CREATE TABLE IF NOT EXISTS sm_user_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  favorite_teams TEXT[] DEFAULT ARRAY['bears']::TEXT[],
  notification_prefs JSONB DEFAULT '{
    "breaking_news": true,
    "game_alerts": true,
    "weekly_digest": true,
    "trade_rumors": false
  }'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON sm_user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE sm_user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own preferences
CREATE POLICY "Users can read own preferences" ON sm_user_preferences
  FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences" ON sm_user_preferences
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON sm_user_preferences
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- Policy: Service role can access all (for API routes)
CREATE POLICY "Service role full access" ON sm_user_preferences
  FOR ALL USING (auth.role() = 'service_role');
```

### Verify Existing Tables

Ensure these tables exist with required columns:

```sql
-- Check sm_posts table has required columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_posts';

-- Required columns: id, slug, title, excerpt, content, featured_image,
-- published_at, status, views, importance_score, author_id, category_id

-- Check sm_categories table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_categories';

-- Required columns: id, name, slug

-- Check sm_authors table
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'sm_authors';

-- Required columns: id, display_name, bio, avatar_url, email, slug
```

---

## 2. Environment Variables

### Local Development (.env.local) ✅ DONE

File already created with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Production (Vercel/Hosting)

Add these environment variables in your hosting dashboard:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://izwhcuccuwvlqqhpprbb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (server only) |
| `NEXT_PUBLIC_SITE_URL` | `https://sportsmockery.com` |
| `RESEND_API_KEY` | (Optional) For email functionality |
| `ANTHROPIC_API_KEY` | (Optional) For AI features |

### Disqus Integration (for comments)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_DISQUS_SHORTNAME` | `sportsmockery` |
| `NEXT_PUBLIC_DISQUS_PUBLIC_KEY` | Disqus API public key |
| `DISQUS_API_KEY` | Disqus API key (for OAuth) |
| `DISQUS_API_SECRET` | Disqus API secret (for OAuth) |

Get Disqus keys at: https://disqus.com/api/applications/
Set OAuth callback: `https://test.sportsmockery.com/api/auth/disqus/callback`

### Social Login (Google, Facebook, X/Twitter)

Social login providers are configured in **Supabase Dashboard**, not Vercel:
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google, Facebook, and Twitter
3. Add API keys from each provider's developer console

---

## 3. Dependencies

All required dependencies are already installed:

- ✅ `@supabase/supabase-js` - Database client
- ✅ `@supabase/ssr` - Server-side rendering support
- ✅ `date-fns` - Date formatting
- ✅ `next-sitemap` - Sitemap generation
- ✅ `framer-motion` - Animations
- ✅ `react-select` - Form selects

No additional npm packages needed.

---

## 4. Optional: Analytics Integration

To enable analytics (Phase 9.5), add one of these:

### Google Analytics 4

1. Create GA4 property at https://analytics.google.com
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
3. Create `src/components/Analytics.tsx`:
   ```tsx
   'use client'
   import Script from 'next/script'

   export default function Analytics() {
     const gaId = process.env.NEXT_PUBLIC_GA_ID
     if (!gaId) return null

     return (
       <>
         <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
         <Script id="google-analytics">
           {`
             window.dataLayer = window.dataLayer || [];
             function gtag(){dataLayer.push(arguments);}
             gtag('js', new Date());
             gtag('config', '${gaId}');
           `}
         </Script>
       </>
     )
   }
   ```
4. Add to `app/layout.tsx`

### Vercel Analytics (Simpler)

1. `npm install @vercel/analytics`
2. Add to `app/layout.tsx`:
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   // ... in body:
   <Analytics />
   ```

---

## 5. Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` - verify no errors
- [ ] Test locally with `npm run dev`
- [ ] Verify Supabase tables exist
- [ ] Set all environment variables in hosting
- [ ] Test user preferences save/load
- [ ] Verify sitemap at `/sitemap.xml`
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Test article pages load correctly
- [ ] Test team pages load correctly
- [ ] Test Bears hub at `/bears`

---

## 6. Post-Deployment

After deploying:

1. **Submit sitemap to Google Search Console**
   - Go to https://search.google.com/search-console
   - Add property for sportsmockery.com
   - Submit `https://sportsmockery.com/sitemap.xml`

2. **Verify OpenGraph tags**
   - Test with https://developers.facebook.com/tools/debug/
   - Test with https://cards-dev.twitter.com/validator

3. **Monitor performance**
   - Check Core Web Vitals in Search Console
   - Monitor Vercel Analytics (if enabled)

---

## Quick Reference

### Files Created/Modified This Session

| File | Purpose |
|------|---------|
| `src/components/team/TeamHub.tsx` | Generic team hub component |
| `src/components/article/MoreFromTeam.tsx` | Related team posts |
| `src/components/article/ArticleTableOfContents.tsx` | In-article TOC |
| `src/components/personalization/FavoriteTeamsSelector.tsx` | Multi-select teams |
| `src/app/sitemap.ts` | Dynamic sitemap |
| `src/app/robots.ts` | Dynamic robots.txt |
| `src/app/[category]/[slug]/page.tsx` | Enhanced article page |
| `src/app/profile/settings/page.tsx` | Updated settings |
| `next.config.ts` | Performance optimizations |
| `.env.local` | Environment variables |
| `.env.example` | Documentation |

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user/preferences` | GET | Get user preferences |
| `/api/user/preferences` | POST | Create/update preferences |
| `/api/user/preferences` | PATCH | Partial update preferences |
| `/api/team/[slug]` | GET | Get team-specific posts |
| `/api/feed` | GET | Get personalized feed |
