import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// ── Social media channel configs ──────────────────────────────────────────────
const YOUTUBE_CHANNELS = [
  { handle: 'sportsmockery', label: 'SportsMockery' },
  { handle: 'bearsfilmroom', label: 'Bears Film Room' },
  { handle: 'untoldchicagostories', label: 'Untold Chicago Stories' },
  { handle: 'PinwheelsandIvyPodcast', label: 'Pinwheels & Ivy' },
]

const X_ACCOUNTS = [
  { username: 'sportsmockery', label: 'SportsMockery' },
  { username: 'bfr_pod', label: 'Bears Film Room Pod' },
  { username: 'PinwheelsIvyPod', label: 'Pinwheels & Ivy Pod' },
  { username: 'SSBehavior', label: 'SS Behavior' },
]

// ── Main handler ──────────────────────────────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '28d'

  const daysMap: Record<string, number> = { '7d': 7, '28d': 28, '90d': 90, '1y': 365 }
  const days = daysMap[range] || 28
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 86400000)
  const prevStart = new Date(startDate.getTime() - days * 86400000)

  try {
    const [editorial, social] = await Promise.all([
      fetchEditorial(startDate.toISOString(), prevStart.toISOString(), now.toISOString()),
      fetchSocial(),
    ])

    return NextResponse.json({
      ...editorial,
      social,
      range,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Exec dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

// ── Editorial data from Supabase ──────────────────────────────────────────────
async function fetchEditorial(sinceStr: string, prevSinceStr: string, nowStr: string) {
  const [
    totalPostsResult,
    totalViewsResult,
    periodPostsResult,
    prevPeriodPostsResult,
    authorsResult,
    categoriesResult,
    recentResult,
    topContentResult,
    dailyTrendResult,
    authorStatsResult,
  ] = await Promise.all([
    supabaseAdmin.from('sm_posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('sm_posts').select('views'),
    supabaseAdmin.from('sm_posts')
      .select('id, views, published_at, category_id, author_id, read_time_estimate')
      .gte('published_at', sinceStr).lte('published_at', nowStr),
    supabaseAdmin.from('sm_posts')
      .select('id, views')
      .gte('published_at', prevSinceStr).lt('published_at', sinceStr),
    supabaseAdmin.from('sm_authors').select('*'),
    supabaseAdmin.from('sm_categories').select('*').order('post_count', { ascending: false }).limit(20),
    supabaseAdmin.from('sm_posts')
      .select('id, title, slug, views, published_at, author_id, category_id, featured_image, content_type, primary_topic, read_time_estimate, importance_score')
      .order('published_at', { ascending: false }).limit(20),
    supabaseAdmin.from('sm_posts')
      .select('id, title, slug, views, published_at, author_id, category_id, featured_image')
      .gte('published_at', sinceStr).order('views', { ascending: false }).limit(10),
    supabaseAdmin.from('sm_posts')
      .select('published_at, views')
      .gte('published_at', sinceStr).order('published_at', { ascending: true }),
    supabaseAdmin.from('sm_posts')
      .select('author_id, views')
      .gte('published_at', sinceStr),
  ])

  const totalPosts = totalPostsResult.count || 0
  const allViews = (totalViewsResult.data || []).reduce((s: number, p: any) => s + (p.views || 0), 0)
  const periodPosts = periodPostsResult.data || []
  const prevPosts = prevPeriodPostsResult.data || []
  const authors = authorsResult.data || []
  const categories = categoriesResult.data || []
  const recent = recentResult.data || []
  const topContent = topContentResult.data || []
  const dailyPosts = dailyTrendResult.data || []
  const authorPosts = authorStatsResult.data || []

  const periodViews = periodPosts.reduce((s, p: any) => s + (p.views || 0), 0)
  const prevViews = prevPosts.reduce((s, p: any) => s + (p.views || 0), 0)

  const authorMap = new Map(authors.map((a: any) => [a.id, a]))
  const categoryMap = new Map(categories.map((c: any) => [c.id, c]))

  // Writer stats
  const writerStats = new Map<number, { posts: number; views: number }>()
  for (const p of authorPosts) {
    if (!(p as any).author_id) continue
    const aid = (p as any).author_id
    const existing = writerStats.get(aid) || { posts: 0, views: 0 }
    existing.posts++
    existing.views += (p as any).views || 0
    writerStats.set(aid, existing)
  }

  const writers = Array.from(writerStats.entries())
    .map(([authorId, stats]) => {
      const author = authorMap.get(authorId) as any
      return {
        id: authorId,
        name: author?.display_name || 'Unknown',
        avatar: author?.avatar_url || null,
        email: author?.email || '',
        role: author?.role || '',
        posts: stats.posts,
        views: stats.views,
        avgViews: stats.posts > 0 ? Math.round(stats.views / stats.posts) : 0,
      }
    })
    .sort((a, b) => b.views - a.views)

  // Daily trend
  const dailyMap = new Map<string, { count: number; views: number }>()
  for (const p of dailyPosts) {
    const day = (p as any).published_at?.split('T')[0] || ''
    if (!day) continue
    const existing = dailyMap.get(day) || { count: 0, views: 0 }
    existing.count++
    existing.views += (p as any).views || 0
    dailyMap.set(day, existing)
  }
  const publishingTrend = Array.from(dailyMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Category breakdown
  const catCounts = new Map<number, { count: number; views: number }>()
  for (const p of periodPosts) {
    const cid = (p as any).category_id
    if (!cid) continue
    const existing = catCounts.get(cid) || { count: 0, views: 0 }
    existing.count++
    existing.views += (p as any).views || 0
    catCounts.set(cid, existing)
  }
  const categoryBreakdown = Array.from(catCounts.entries())
    .map(([catId, stats]) => ({
      name: (categoryMap.get(catId) as any)?.name || 'Uncategorized',
      ...stats,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // Enrich posts
  const enrichPost = (p: any) => ({
    ...p,
    author_name: (authorMap.get(p.author_id) as any)?.display_name || 'Unknown',
    category_name: (categoryMap.get(p.category_id) as any)?.name || 'Uncategorized',
  })

  return {
    overview: {
      totalPosts,
      allTimeViews: allViews,
      periodPosts: periodPosts.length,
      prevPeriodPosts: prevPosts.length,
      periodViews,
      prevPeriodViews: prevViews,
      totalAuthors: authors.length,
      totalCategories: categories.length,
      avgReadTime: Math.round(
        periodPosts.reduce((s, p: any) => s + (p.read_time_estimate || 4), 0) / (periodPosts.length || 1)
      ),
    },
    writers,
    categories: categoryBreakdown,
    recentPosts: recent.map(enrichPost),
    topContent: topContent.map(enrichPost),
    publishingTrend,
  }
}

// ── Social media APIs ─────────────────────────────────────────────────────────
async function fetchSocial() {
  const [youtube, x, facebook] = await Promise.allSettled([
    fetchYouTube(),
    fetchX(),
    fetchFacebook(),
  ])

  return {
    youtube: youtube.status === 'fulfilled' ? youtube.value : [],
    x: x.status === 'fulfilled' ? x.value : [],
    facebook: facebook.status === 'fulfilled' ? facebook.value : [],
  }
}

async function fetchYouTube() {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  const results = await Promise.allSettled(
    YOUTUBE_CHANNELS.map(async (ch) => {
      const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(ch.handle)}&key=${apiKey}`
      const res = await fetch(url, { next: { revalidate: 3600 } })
      if (!res.ok) return null
      const data = await res.json()
      const item = data.items?.[0]
      if (!item) return null
      return {
        handle: ch.handle,
        label: ch.label,
        name: item.snippet?.title || ch.label,
        subscribers: parseInt(item.statistics?.subscriberCount || '0'),
        totalViews: parseInt(item.statistics?.viewCount || '0'),
        videoCount: parseInt(item.statistics?.videoCount || '0'),
        thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      }
    })
  )

  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)
}

async function fetchX() {
  const bearerToken = process.env.X_BEARER_TOKEN
  if (!bearerToken) return []

  const usernames = X_ACCOUNTS.map(a => a.username).join(',')
  const url = `https://api.twitter.com/2/users/by?usernames=${usernames}&user.fields=public_metrics,description,profile_image_url`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()

    return (data.data || []).map((user: any) => {
      const config = X_ACCOUNTS.find(a => a.username.toLowerCase() === user.username.toLowerCase())
      return {
        username: user.username,
        label: config?.label || user.name,
        name: user.name,
        followers: user.public_metrics?.followers_count || 0,
        following: user.public_metrics?.following_count || 0,
        tweets: user.public_metrics?.tweet_count || 0,
        listed: user.public_metrics?.listed_count || 0,
        profileImage: user.profile_image_url || '',
        description: user.description || '',
      }
    })
  } catch {
    return []
  }
}

async function fetchFacebook() {
  const token = process.env.FB_PAGE_ACCESS_TOKEN
  const pageId = process.env.FB_PAGE_ID
  if (!token || !pageId) return []

  try {
    const url = `https://graph.facebook.com/v24.0/${pageId}?fields=name,fan_count,followers_count,picture&access_token=${token}`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const data = await res.json()

    return [
      {
        id: pageId,
        label: 'SportsMockery',
        name: data.name || 'SportsMockery',
        followers: data.followers_count || 0,
        likes: data.fan_count || 0,
        picture: data.picture?.data?.url || '',
      },
      { id: 'TruBearsFan', label: 'Tru Bears Fan', name: 'Tru Bears Fan', followers: 0, likes: 0, picture: '', needsToken: true },
      { id: 'ChiBearsRumors', label: 'Chi Bears Rumors', name: 'Chi Bears Rumors', followers: 0, likes: 0, picture: '', needsToken: true },
    ]
  } catch {
    return []
  }
}
