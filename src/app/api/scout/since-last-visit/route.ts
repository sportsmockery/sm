// src/app/api/scout/since-last-visit/route.ts
// Scout "since last visit" catch-up — sends recent posts to datalab for AI summary

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/db'

export const dynamic = 'force-dynamic'

const TEAM_ORDER = ['bears', 'cubs', 'bulls', 'blackhawks', 'whitesox', 'white-sox']

function getTeamSlug(categorySlug: string | null): string | null {
  if (!categorySlug) return null
  const s = categorySlug.toLowerCase()
  if (s.includes('bears')) return 'bears'
  if (s.includes('bulls')) return 'bulls'
  if (s.includes('blackhawks')) return 'blackhawks'
  if (s.includes('cubs')) return 'cubs'
  if (s.includes('whitesox') || s.includes('white-sox')) return 'whitesox'
  return null
}

export async function POST() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              try { cookieStore.set(name, value, options) } catch {}
            })
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get last_visit_date from preferences
    const { data: prefs } = await supabaseAdmin
      .from('sm_user_preferences')
      .select('last_visit_date')
      .eq('user_id', session.user.id)
      .single()

    const lastVisitDate = prefs?.last_visit_date || null
    const today = new Date().toISOString().split('T')[0]

    // Determine the cutoff date for posts
    let sinceDate: string
    let isNewUser = false
    if (lastVisitDate) {
      // Cap at 14 days ago max
      const fourteenDaysAgo = new Date()
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
      const cutoff = fourteenDaysAgo.toISOString().split('T')[0]
      sinceDate = lastVisitDate > cutoff ? lastVisitDate : cutoff
    } else {
      // New user — last 48 hours
      isNewUser = true
      const twoDaysAgo = new Date()
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)
      sinceDate = twoDaysAgo.toISOString().split('T')[0]
    }

    // Fetch recent posts since the cutoff
    const { data: recentPosts } = await supabaseAdmin
      .from('sm_posts')
      .select('id, title, slug, published_at, content_type, importance_score, category:sm_categories!category_id(slug)')
      .eq('status', 'published')
      .gte('published_at', `${sinceDate}T00:00:00Z`)
      .order('importance_score', { ascending: false })
      .limit(50)

    if (!recentPosts?.length) {
      return NextResponse.json({
        bullets: [],
        message: 'No new stories since your last visit.',
      })
    }

    // Build compact posts array for the AI prompt
    const compactPosts = recentPosts.map((p: any) => {
      const cat = Array.isArray(p.category) ? p.category[0] : p.category
      return {
        title: p.title,
        team_slug: getTeamSlug(cat?.slug || null),
        published_at: p.published_at,
        type: p.content_type || 'article',
        slug: p.slug,
        category_slug: cat?.slug || null,
      }
    })

    // Build the prompt
    const prompt = isNewUser
      ? `You are Scout, a high-IQ Chicago sports AI assisting a returning fan of Sports Mockery.

Today's date: ${today}

Using the list of posts we send you (with team, date, and brief metadata), summarize the key Chicago sports stories for the past 48 hours, across Bears, Cubs, Bulls, Blackhawks, and White Sox.

Rules:
- MAX 2 bullets per team.
- MAX 8 bullets total.
- Prioritize: games played and results, major rumors, trades, signings, injuries, cap moves.
- Write in concise, neutral bullet points, no hype.
- Return ONLY a JSON object with this exact shape: { "bullets": [{ "team": "bears", "text": "...", "postSlug": "..." }] }
- "team" must be one of: bears, cubs, bulls, blackhawks, whitesox
- "postSlug" should be the slug of the most relevant post for that bullet`
      : `You are Scout, a high-IQ Chicago sports AI assisting a returning fan of Sports Mockery.

Today's date: ${today}
Last visit date: ${lastVisitDate}

Using the list of posts we send you (with team, date, and brief metadata), summarize the MOST IMPORTANT things that changed in Chicago sports SINCE ${lastVisitDate}, across Bears, Cubs, Bulls, Blackhawks, and White Sox.

Rules:
- MAX 2 bullets per team.
- MAX 8 bullets total.
- Prioritize: games played and results, major rumors, trades, signings, injuries, cap moves.
- If last_visit_date is more than 7 days ago, collapse older events into 1 short "While you were gone" bullet, then focus on this week only.
- Write in concise, neutral bullet points, no hype.
- Return ONLY a JSON object with this exact shape: { "bullets": [{ "team": "bears", "text": "...", "postSlug": "..." }] }
- "team" must be one of: bears, cubs, bulls, blackhawks, whitesox
- "postSlug" should be the slug of the most relevant post for that bullet`

    // Call datalab Scout endpoint (Perplexity)
    const datalabRes = await fetch('https://datalab.sportsmockery.com/api/scout/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postTitle: 'Chicago Sports Catch-Up',
        excerpt: prompt,
        team: 'all',
        posts: compactPosts,
      }),
    })

    if (!datalabRes.ok) {
      console.error('[scout/since-last-visit] DataLab error:', datalabRes.status)
      return NextResponse.json({ error: 'Scout unavailable' }, { status: 502 })
    }

    const datalabData = await datalabRes.json()

    // Try to parse structured bullets from the response
    let bullets: { team: string; text: string; postSlug?: string }[] = []

    // First try: the response itself might have bullets
    if (Array.isArray(datalabData.bullets)) {
      bullets = datalabData.bullets
    } else {
      // Try to extract JSON from the summary text
      const summaryText = datalabData.summary || datalabData.response || ''
      const jsonMatch = summaryText.match(/\{[\s\S]*"bullets"[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed.bullets)) {
            bullets = parsed.bullets
          }
        } catch {}
      }

      // Fallback: split summary into bullets by line
      if (!bullets.length && summaryText) {
        const lines = summaryText.split('\n').filter((l: string) => l.trim().length > 10)
        bullets = lines.slice(0, 8).map((line: string) => {
          const cleaned = line.replace(/^[-*•]\s*/, '').trim()
          // Try to detect team from content
          let team = 'sports'
          for (const t of TEAM_ORDER) {
            if (cleaned.toLowerCase().includes(t)) { team = t; break }
          }
          return { team, text: cleaned }
        })
      }
    }

    // Build slug lookup for linking bullets to articles
    const slugMap = new Map(compactPosts.map((p: any) => [p.slug, p]))

    // Enrich bullets with article URLs
    const enrichedBullets = bullets.map((b: any) => {
      let articleUrl: string | null = null
      if (b.postSlug && slugMap.has(b.postSlug)) {
        const p = slugMap.get(b.postSlug)!
        articleUrl = p.category_slug ? `/${p.category_slug}/${p.slug}` : `/${p.slug}`
      } else {
        // Find best matching post for this team
        const teamPost = compactPosts.find((p: any) => p.team_slug === b.team || p.team_slug === b.team?.replace('white-sox', 'whitesox'))
        if (teamPost) {
          articleUrl = teamPost.category_slug ? `/${teamPost.category_slug}/${teamPost.slug}` : `/${teamPost.slug}`
        }
      }
      return { ...b, articleUrl }
    })

    return NextResponse.json({
      bullets: enrichedBullets,
      lastVisitDate: lastVisitDate || null,
      sinceDate,
    })
  } catch (error) {
    console.error('[scout/since-last-visit] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
