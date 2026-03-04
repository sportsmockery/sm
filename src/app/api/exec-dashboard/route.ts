import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

// ── Social configs ────────────────────────────────────────────────────────────
const YT = [
  { handle: 'sportsmockery', label: 'SportsMockery' },
  { handle: 'bearsfilmroom', label: 'Bears Film Room' },
  { handle: 'untoldchicagostories', label: 'Untold Chicago Stories' },
  { handle: 'PinwheelsandIvyPodcast', label: 'Pinwheels & Ivy' },
]
const XA = [
  { username: 'sportsmockery', label: 'SportsMockery' },
  { username: 'bfr_pod', label: 'Bears Film Room Pod' },
  { username: 'PinwheelsIvyPod', label: 'Pinwheels & Ivy Pod' },
  { username: 'SSBehavior', label: 'SS Behavior' },
]

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
      fetchEditorial(startDate.toISOString(), prevStart.toISOString(), now.toISOString(), days),
      fetchSocial(),
    ])
    return NextResponse.json({ ...editorial, social, range, days, timestamp: Date.now() })
  } catch (error) {
    console.error('Exec dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

async function fetchEditorial(sinceStr: string, prevStr: string, nowStr: string, days: number) {
  const [
    totalRes, allViewsRes, periodRes, prevRes, authorsRes, catsRes,
    recentRes, topRes, trendRes, authorPostsRes,
    allPostsRes, // for deeper analytics
  ] = await Promise.all([
    supabaseAdmin.from('sm_posts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('sm_posts').select('views'),
    supabaseAdmin.from('sm_posts').select('id, views, published_at, category_id, author_id, read_time_estimate, content_type, primary_topic, importance_score').gte('published_at', sinceStr).lte('published_at', nowStr),
    supabaseAdmin.from('sm_posts').select('id, views').gte('published_at', prevStr).lt('published_at', sinceStr),
    supabaseAdmin.from('sm_authors').select('*'),
    supabaseAdmin.from('sm_categories').select('*').order('post_count', { ascending: false }).limit(30),
    supabaseAdmin.from('sm_posts').select('id, title, slug, views, published_at, author_id, category_id, featured_image, content_type, primary_topic, read_time_estimate, importance_score').order('published_at', { ascending: false }).limit(25),
    supabaseAdmin.from('sm_posts').select('id, title, slug, views, published_at, author_id, category_id').gte('published_at', sinceStr).order('views', { ascending: false }).limit(15),
    supabaseAdmin.from('sm_posts').select('published_at, views').gte('published_at', sinceStr).order('published_at', { ascending: true }),
    supabaseAdmin.from('sm_posts').select('author_id, views, category_id, read_time_estimate, importance_score, content_type').gte('published_at', sinceStr),
    supabaseAdmin.from('sm_posts').select('published_at, views, author_id, category_id, content_type, read_time_estimate, importance_score').gte('published_at', new Date(Date.now() - 365 * 86400000).toISOString()).order('published_at', { ascending: true }),
  ])

  const totalPosts = totalRes.count || 0
  const allViews = (allViewsRes.data || []).reduce((s: number, p: any) => s + (p.views || 0), 0)
  const period = periodRes.data || []
  const prev = prevRes.data || []
  const authors = authorsRes.data || []
  const cats = catsRes.data || []
  const recent = recentRes.data || []
  const top = topRes.data || []
  const daily = trendRes.data || []
  const aPosts = authorPostsRes.data || []
  const yearPosts = allPostsRes.data || []

  const periodViews = period.reduce((s: number, p: any) => s + (p.views || 0), 0)
  const prevViews = prev.reduce((s: number, p: any) => s + (p.views || 0), 0)
  const aMap = new Map(authors.map((a: any) => [a.id, a]))
  const cMap = new Map(cats.map((c: any) => [c.id, c]))

  // ── Writer stats ──
  const wMap = new Map<number, { posts: number; views: number; categories: Set<string>; readTimes: number[]; scores: number[] }>()
  for (const p of aPosts) {
    const a = (p as any).author_id; if (!a) continue
    const e = wMap.get(a) || { posts: 0, views: 0, categories: new Set<string>(), readTimes: [], scores: [] }
    e.posts++; e.views += (p as any).views || 0
    const catName = (cMap.get((p as any).category_id) as any)?.name
    if (catName) e.categories.add(catName)
    if ((p as any).read_time_estimate) e.readTimes.push((p as any).read_time_estimate)
    if ((p as any).importance_score) e.scores.push((p as any).importance_score)
    wMap.set(a, e)
  }

  const writers = Array.from(wMap.entries()).map(([id, s]) => {
    const a = aMap.get(id) as any
    return {
      id, name: a?.display_name || 'Unknown', avatar: a?.avatar_url || null, email: a?.email || '', role: a?.role || '',
      posts: s.posts, views: s.views, avgViews: s.posts > 0 ? Math.round(s.views / s.posts) : 0,
      topCategories: Array.from(s.categories).slice(0, 3),
      avgReadTime: s.readTimes.length > 0 ? Math.round(s.readTimes.reduce((a, b) => a + b, 0) / s.readTimes.length) : 0,
      avgScore: s.scores.length > 0 ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0,
    }
  }).sort((a, b) => b.views - a.views)

  // ── Daily trend ──
  const dMap = new Map<string, { count: number; views: number }>()
  for (const p of daily) {
    const day = (p as any).published_at?.split('T')[0] || ''; if (!day) continue
    const e = dMap.get(day) || { count: 0, views: 0 }; e.count++; e.views += (p as any).views || 0; dMap.set(day, e)
  }
  const publishingTrend = Array.from(dMap.entries()).map(([date, s]) => ({ date, ...s })).sort((a, b) => a.date.localeCompare(b.date))

  // ── Monthly trend (last 12 months) ──
  const mMap = new Map<string, { count: number; views: number }>()
  for (const p of yearPosts) {
    const d = (p as any).published_at; if (!d) continue
    const key = d.substring(0, 7) // YYYY-MM
    const e = mMap.get(key) || { count: 0, views: 0 }; e.count++; e.views += (p as any).views || 0; mMap.set(key, e)
  }
  const monthlyTrend = Array.from(mMap.entries()).map(([month, s]) => ({ month, ...s })).sort((a, b) => a.month.localeCompare(b.month))

  // ── Day of week distribution ──
  const dow = [0, 0, 0, 0, 0, 0, 0] // Sun-Sat
  for (const p of period) {
    const d = (p as any).published_at; if (!d) continue
    dow[new Date(d).getDay()]++
  }
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, i) => ({ name, count: dow[i] }))

  // ── Hour distribution ──
  const hours = new Array(24).fill(0)
  for (const p of period) {
    const d = (p as any).published_at; if (!d) continue
    hours[new Date(d).getHours()]++
  }
  const hourDistribution = hours.map((count, hour) => ({ hour, count }))

  // ── Category breakdown ──
  const catStats = new Map<number, { count: number; views: number }>()
  for (const p of period) {
    const c = (p as any).category_id; if (!c) continue
    const e = catStats.get(c) || { count: 0, views: 0 }; e.count++; e.views += (p as any).views || 0; catStats.set(c, e)
  }
  const categoryBreakdown = Array.from(catStats.entries())
    .map(([id, s]) => ({ name: (cMap.get(id) as any)?.name || 'Uncategorized', ...s, avgViews: s.count > 0 ? Math.round(s.views / s.count) : 0 }))
    .sort((a, b) => b.count - a.count).slice(0, 12)

  // ── Content type distribution ──
  const ctMap = new Map<string, number>()
  for (const p of period) { const t = (p as any).content_type || 'article'; ctMap.set(t, (ctMap.get(t) || 0) + 1) }
  const contentTypes = Array.from(ctMap.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)

  // ── Read time distribution ──
  const rtBuckets = { '< 2 min': 0, '2-4 min': 0, '5-7 min': 0, '8-10 min': 0, '10+ min': 0 }
  for (const p of period) {
    const rt = (p as any).read_time_estimate || 4
    if (rt < 2) rtBuckets['< 2 min']++
    else if (rt <= 4) rtBuckets['2-4 min']++
    else if (rt <= 7) rtBuckets['5-7 min']++
    else if (rt <= 10) rtBuckets['8-10 min']++
    else rtBuckets['10+ min']++
  }
  const readTimeDistribution = Object.entries(rtBuckets).map(([range, count]) => ({ range, count }))

  // ── Views distribution buckets ──
  const vBuckets = { '0': 0, '1-10': 0, '11-50': 0, '51-100': 0, '100+': 0 }
  for (const p of period) {
    const v = (p as any).views || 0
    if (v === 0) vBuckets['0']++
    else if (v <= 10) vBuckets['1-10']++
    else if (v <= 50) vBuckets['11-50']++
    else if (v <= 100) vBuckets['51-100']++
    else vBuckets['100+']++
  }
  const viewsDistribution = Object.entries(vBuckets).map(([range, count]) => ({ range, count }))

  // ── Importance score distribution ──
  const scoreBuckets = { 'Low (0-25)': 0, 'Medium (26-50)': 0, 'High (51-75)': 0, 'Very High (76-100)': 0, 'Unscored': 0 }
  for (const p of period) {
    const s = (p as any).importance_score
    if (s == null) scoreBuckets['Unscored']++
    else if (s <= 25) scoreBuckets['Low (0-25)']++
    else if (s <= 50) scoreBuckets['Medium (26-50)']++
    else if (s <= 75) scoreBuckets['High (51-75)']++
    else scoreBuckets['Very High (76-100)']++
  }
  const scoreDistribution = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }))

  // ── Topic distribution ──
  const topicMap = new Map<string, number>()
  for (const p of period) { const t = (p as any).primary_topic; if (t) topicMap.set(t, (topicMap.get(t) || 0) + 1) }
  const topicBreakdown = Array.from(topicMap.entries()).map(([topic, count]) => ({ topic, count })).sort((a, b) => b.count - a.count).slice(0, 15)

  // ── Author monthly trend (top 5 writers) ──
  const top5 = writers.slice(0, 5).map(w => w.id)
  const authorMonthly = new Map<number, Map<string, number>>()
  for (const p of yearPosts) {
    const aid = (p as any).author_id; if (!aid || !top5.includes(aid)) continue
    const m = (p as any).published_at?.substring(0, 7); if (!m) continue
    if (!authorMonthly.has(aid)) authorMonthly.set(aid, new Map())
    const aMap2 = authorMonthly.get(aid)!
    aMap2.set(m, (aMap2.get(m) || 0) + 1)
  }
  const months = Array.from(new Set(yearPosts.map((p: any) => p.published_at?.substring(0, 7)).filter(Boolean))).sort()
  const writerTrends = top5.map(id => {
    const aData = authorMonthly.get(id) || new Map()
    return {
      id, name: (aMap.get(id) as any)?.display_name || 'Unknown',
      data: months.map(m => ({ month: m, count: aData.get(m) || 0 })),
    }
  })

  const enrichPost = (p: any) => ({
    ...p,
    author_name: (aMap.get(p.author_id) as any)?.display_name || 'Unknown',
    category_name: (cMap.get(p.category_id) as any)?.name || 'Uncategorized',
  })

  const avgViews = period.length > 0 ? Math.round(periodViews / period.length) : 0
  const velocity = days > 0 ? (period.length / (days / 7)).toFixed(1) : '0'

  return {
    overview: {
      totalPosts, allTimeViews: allViews,
      periodPosts: period.length, prevPeriodPosts: prev.length,
      periodViews, prevPeriodViews: prevViews,
      totalAuthors: authors.length, totalCategories: cats.length,
      avgReadTime: Math.round(period.reduce((s: number, p: any) => s + (p.read_time_estimate || 4), 0) / (period.length || 1)),
      avgViews, velocity,
      avgScore: Math.round(period.reduce((s: number, p: any) => s + (p.importance_score || 0), 0) / (period.filter((p: any) => p.importance_score).length || 1)),
    },
    writers, writerTrends, writerMonths: months,
    categories: categoryBreakdown, contentTypes, topicBreakdown,
    recentPosts: recent.map(enrichPost), topContent: top.map(enrichPost),
    publishingTrend, monthlyTrend, dayOfWeek, hourDistribution,
    readTimeDistribution, viewsDistribution, scoreDistribution,
  }
}

// ── Social media ──────────────────────────────────────────────────────────────
async function fetchSocial() {
  const [youtube, x, facebook] = await Promise.allSettled([fetchYouTube(), fetchX(), fetchFacebook()])
  return {
    youtube: youtube.status === 'fulfilled' ? youtube.value : [],
    x: x.status === 'fulfilled' ? x.value : [],
    facebook: facebook.status === 'fulfilled' ? facebook.value : [],
  }
}

async function fetchYouTube() {
  const k = process.env.YOUTUBE_API_KEY; if (!k) return []
  const res = await Promise.allSettled(YT.map(async ch => {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(ch.handle)}&key=${k}`, { next: { revalidate: 3600 } })
    if (!r.ok) return null; const d = await r.json(); const i = d.items?.[0]; if (!i) return null
    return { handle: ch.handle, label: ch.label, name: i.snippet?.title || ch.label,
      subscribers: parseInt(i.statistics?.subscriberCount || '0'), totalViews: parseInt(i.statistics?.viewCount || '0'),
      videoCount: parseInt(i.statistics?.videoCount || '0'), thumbnail: i.snippet?.thumbnails?.medium?.url || '' }
  }))
  return res.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && r.value !== null).map(r => r.value)
}

async function fetchX() {
  const t = process.env.X_BEARER_TOKEN; if (!t) return []
  try {
    const r = await fetch(`https://api.twitter.com/2/users/by?usernames=${XA.map(a => a.username).join(',')}&user.fields=public_metrics,description,profile_image_url`, { headers: { Authorization: `Bearer ${t}` }, next: { revalidate: 3600 } })
    if (!r.ok) return []; const d = await r.json()
    return (d.data || []).map((u: any) => {
      const c = XA.find(a => a.username.toLowerCase() === u.username.toLowerCase())
      return { username: u.username, label: c?.label || u.name, name: u.name,
        followers: u.public_metrics?.followers_count || 0, following: u.public_metrics?.following_count || 0,
        tweets: u.public_metrics?.tweet_count || 0, listed: u.public_metrics?.listed_count || 0,
        profileImage: u.profile_image_url || '' }
    })
  } catch { return [] }
}

async function fetchFacebook() {
  const token = process.env.FB_PAGE_ACCESS_TOKEN, pid = process.env.FB_PAGE_ID; if (!token || !pid) return []
  try {
    const r = await fetch(`https://graph.facebook.com/v24.0/${pid}?fields=name,fan_count,followers_count,picture&access_token=${token}`, { next: { revalidate: 3600 } })
    if (!r.ok) return []; const d = await r.json()
    return [
      { id: pid, label: 'SportsMockery', name: d.name || 'SportsMockery', followers: d.followers_count || 0, likes: d.fan_count || 0, picture: d.picture?.data?.url || '' },
      { id: 'TruBearsFan', label: 'Tru Bears Fan', name: 'Tru Bears Fan', followers: 0, likes: 0, picture: '', needsToken: true },
      { id: 'ChiBearsRumors', label: 'Chi Bears Rumors', name: 'Chi Bears Rumors', followers: 0, likes: 0, picture: '', needsToken: true },
    ]
  } catch { return [] }
}
