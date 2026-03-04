import { NextResponse } from 'next/server'

const WP_API = 'https://www.sportsmockery.com/wp-json/wp/v2'
const WP_EXPORT = 'https://www.sportsmockery.com/wp-json/sm-export/v1'
const WP_SMED = 'https://www.sportsmockery.com/wp-json/smed/v1'
const MAX_PAGES = 10
const PER_PAGE = 100

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
      fetchEditorial(startDate, prevStart, now, days),
      fetchSocial(),
    ])
    return NextResponse.json({ ...editorial, social, range, days, timestamp: Date.now() })
  } catch (error) {
    console.error('Exec dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// ── WordPress REST API helpers ───────────────────────────────────────────────
async function wpApiFetch(path: string): Promise<{ data: any; total: number }> {
  const res = await fetch(`${WP_API}${path}`, { next: { revalidate: 900 } })
  if (!res.ok) {
    if (res.status === 400) return { data: [], total: 0 }
    throw new Error(`WP API ${res.status}: ${res.statusText}`)
  }
  const data = await res.json()
  const total = parseInt(res.headers.get('X-WP-Total') || '0')
  return { data, total }
}

async function wpFetchAllPosts(after: Date, before: Date): Promise<{ posts: any[]; total: number }> {
  const posts: any[] = []
  let total = 0
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const { data, total: t } = await wpApiFetch(
        `/posts?per_page=${PER_PAGE}&page=${page}&orderby=date&order=desc&status=publish` +
        `&after=${after.toISOString()}&before=${before.toISOString()}` +
        `&_fields=id,date,date_gmt,slug,title,author,categories`
      )
      if (page === 1) total = t
      if (!Array.isArray(data) || data.length === 0) break
      posts.push(...data)
      if (data.length < PER_PAGE) break
    } catch (e) {
      console.error(`[Exec] WP posts page ${page}:`, e)
      break
    }
  }
  return { posts, total }
}

// ── Editorial data ───────────────────────────────────────────────────────────
async function fetchEditorial(startDate: Date, prevStart: Date, now: Date, days: number) {
  const startStr = startDate.toISOString().split('T')[0]
  const prevStr = prevStart.toISOString().split('T')[0]
  const nowStr = now.toISOString().split('T')[0]

  // Parallel fetch: period posts, prev count, total count, authors, categories, monthly trends, SMED views
  const [periodResult, prevCountRes, totalCountRes, authorsRaw, categoriesRes, monthCounts, smedOverview, smedPrevOverview, smedAuthorViews, smedTopPosts] = await Promise.all([
    wpFetchAllPosts(startDate, now),
    wpApiFetch(`/posts?per_page=1&status=publish&after=${prevStart.toISOString()}&before=${startDate.toISOString()}`),
    wpApiFetch(`/posts?per_page=1&status=publish`),
    fetch(`${WP_EXPORT}/authors`, { next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : []).catch(() => []),
    wpApiFetch(`/categories?per_page=100&orderby=count&order=desc&_fields=id,name,slug,count`),
    // Monthly post counts for last 12 months (parallel lightweight queries)
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const ms = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
        const me = new Date(now.getFullYear(), now.getMonth() - 10 + i, 1)
        return wpApiFetch(`/posts?per_page=1&status=publish&after=${ms.toISOString()}&before=${me.toISOString()}`)
          .then(({ total }) => ({ month: `${ms.getFullYear()}-${String(ms.getMonth() + 1).padStart(2, '0')}`, count: total }))
          .catch(() => ({ month: `${ms.getFullYear()}-${String(ms.getMonth() + 1).padStart(2, '0')}`, count: 0 }))
      })
    ),
    // SMED plugin views endpoints (will 404 gracefully until plugin is updated)
    fetch(`${WP_SMED}/views/overview?start=${startStr}&end=${nowStr}`, { next: { revalidate: 900 } }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${WP_SMED}/views/overview?start=${prevStr}&end=${startStr}`, { next: { revalidate: 900 } }).then(r => r.ok ? r.json() : null).catch(() => null),
    fetch(`${WP_SMED}/views/authors?months=12`, { next: { revalidate: 900 } }).then(r => r.ok ? r.json() : []).catch(() => []),
    fetch(`${WP_SMED}/views/posts?start=${startStr}&end=${nowStr}&limit=50`, { next: { revalidate: 900 } }).then(r => r.ok ? r.json() : []).catch(() => []),
  ])

  const period = periodResult.posts
  const totalPosts = totalCountRes.total
  const prevPeriodPosts = prevCountRes.total
  const authors: any[] = authorsRaw || []
  const categories: any[] = categoriesRes.data || []

  // Build lookup maps
  const aMap = new Map(authors.map((a: any) => [a.id, a]))
  const cMap = new Map(categories.map((c: any) => [c.id, c]))

  const getAuthorName = (id: number) => (aMap.get(id) as any)?.display_name || (aMap.get(id) as any)?.name || `Author ${id}`
  const getAuthorAvatar = (id: number) => (aMap.get(id) as any)?.avatar_url || null
  const getCatName = (id: number) => (cMap.get(id) as any)?.name || 'Uncategorized'

  // ── Writer stats ──
  const wMap = new Map<number, { posts: number; categories: Set<string> }>()
  for (const p of period) {
    const aid = p.author; if (!aid) continue
    const e = wMap.get(aid) || { posts: 0, categories: new Set<string>() }
    e.posts++
    for (const catId of (p.categories || [])) {
      e.categories.add(getCatName(catId))
    }
    wMap.set(aid, e)
  }

  // ── Merge SMED author views into writer stats ──
  // smedAuthorViews is [{display_name, author_id, month, total_posts, total_views}, ...]
  // Aggregate views per author for the selected period months
  const smedAuthorViewsMap = new Map<number, number>()
  const periodMonthSet = new Set<string>()
  for (const p of period) {
    const m = (p.date_gmt || p.date)?.substring(0, 7); if (m) periodMonthSet.add(m)
  }
  for (const row of (smedAuthorViews || [])) {
    const aid = parseInt(row.author_id)
    if (periodMonthSet.has(row.month)) {
      smedAuthorViewsMap.set(aid, (smedAuthorViewsMap.get(aid) || 0) + parseInt(row.total_views || '0'))
    }
  }

  // Build post-level views map from smedTopPosts
  const postViewsMap = new Map<number, number>()
  for (const row of (smedTopPosts || [])) {
    postViewsMap.set(parseInt(row.post_id), parseInt(row.views || '0'))
  }

  const writers = Array.from(wMap.entries()).map(([id, s]) => {
    const views = smedAuthorViewsMap.get(id) || 0
    return {
      id,
      name: getAuthorName(id),
      avatar: getAuthorAvatar(id),
      role: (aMap.get(id) as any)?.role || '',
      posts: s.posts,
      views,
      avgViews: s.posts > 0 ? Math.round(views / s.posts) : 0,
      topCategories: Array.from(s.categories).slice(0, 3),
      avgReadTime: 0,
      avgScore: 0,
    }
  }).sort((a, b) => b.views - a.views || b.posts - a.posts)

  // ── Daily publishing trend ──
  const dMap = new Map<string, number>()
  for (const p of period) {
    const day = (p.date_gmt || p.date)?.split('T')[0]; if (!day) continue
    dMap.set(day, (dMap.get(day) || 0) + 1)
  }
  const publishingTrend = Array.from(dMap.entries())
    .map(([date, count]) => ({ date, count, views: 0 }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // ── Day of week ──
  const dow = [0, 0, 0, 0, 0, 0, 0]
  for (const p of period) {
    const d = p.date_gmt || p.date; if (!d) continue
    dow[new Date(d).getDay()]++
  }
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((name, i) => ({ name, count: dow[i] }))

  // ── Hour distribution ──
  const hours = new Array(24).fill(0)
  for (const p of period) {
    const d = p.date_gmt || p.date; if (!d) continue
    hours[new Date(d).getHours()]++
  }
  const hourDistribution = hours.map((count, hour) => ({ hour, count }))

  // ── Category breakdown ──
  const catStats = new Map<number, number>()
  for (const p of period) {
    for (const catId of (p.categories || [])) {
      catStats.set(catId, (catStats.get(catId) || 0) + 1)
    }
  }
  const categoryBreakdown = Array.from(catStats.entries())
    .map(([id, count]) => ({ name: getCatName(id), count, views: 0, avgViews: 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  // ── Monthly trend ──
  const monthlyTrend = monthCounts.map(m => ({ ...m, views: 0 }))

  // ── Writer trends (from period data only) ──
  const top5Ids = writers.slice(0, 5).map(w => w.id)
  const authorMonthly = new Map<number, Map<string, number>>()
  for (const p of period) {
    const aid = p.author; if (!aid || !top5Ids.includes(aid)) continue
    const m = (p.date_gmt || p.date)?.substring(0, 7); if (!m) continue
    if (!authorMonthly.has(aid)) authorMonthly.set(aid, new Map())
    const am = authorMonthly.get(aid)!
    am.set(m, (am.get(m) || 0) + 1)
  }
  const periodMonths = Array.from(new Set(period.map((p: any) => (p.date_gmt || p.date)?.substring(0, 7)).filter(Boolean))).sort()
  const writerTrends = top5Ids.map(id => ({
    id,
    name: getAuthorName(id),
    data: periodMonths.map(m => ({ month: m, count: authorMonthly.get(id)?.get(m) || 0 })),
  }))

  // ── Enrich posts with views ──
  const enrichPost = (p: any) => ({
    id: p.id,
    title: typeof p.title === 'object' ? p.title.rendered : p.title,
    slug: p.slug,
    published_at: p.date_gmt || p.date,
    author_name: getAuthorName(p.author),
    category_name: getCatName(p.categories?.[0]),
    views: postViewsMap.get(p.id) || 0,
    featured_image: null,
  })

  // Sort top content by views from SMED data
  const topContent = [...(smedTopPosts || [])].slice(0, 15).map((sp: any) => ({
    id: parseInt(sp.post_id),
    title: sp.title || '',
    slug: sp.slug || '',
    published_at: sp.published_at || '',
    author_name: sp.author_name || '',
    category_name: '',
    views: parseInt(sp.views || '0'),
    featured_image: null,
  }))
  // Fall back to period posts if SMED data unavailable
  const recentPosts = period.slice(0, 25).map(enrichPost)

  const periodViews = smedOverview?.total_views ? parseInt(smedOverview.total_views) : 0
  const prevPeriodViews = smedPrevOverview?.total_views ? parseInt(smedPrevOverview.total_views) : 0
  const allTimeViews = smedOverview?.all_time_views ? parseInt(smedOverview.all_time_views) : 0
  const avgViews = period.length > 0 && periodViews > 0 ? Math.round(periodViews / period.length) : 0

  const velocity = days > 0 ? (period.length / (days / 7)).toFixed(1) : '0'
  const activeWriterRoles = ['author', 'editor', 'administrator']
  const totalAuthors = authors.filter((a: any) => activeWriterRoles.includes(a.role)).length

  // ── Views distribution buckets ──
  const vBuckets = { '0': 0, '1-100': 0, '101-500': 0, '501-1K': 0, '1K-10K': 0, '10K+': 0 }
  for (const sp of (smedTopPosts || [])) {
    const v = parseInt(sp.views || '0')
    if (v === 0) vBuckets['0']++
    else if (v <= 100) vBuckets['1-100']++
    else if (v <= 500) vBuckets['101-500']++
    else if (v <= 1000) vBuckets['501-1K']++
    else if (v <= 10000) vBuckets['1K-10K']++
    else vBuckets['10K+']++
  }
  const viewsDistribution = Object.entries(vBuckets).map(([range, count]) => ({ range, count }))

  return {
    overview: {
      totalPosts,
      allTimeViews,
      periodPosts: period.length,
      prevPeriodPosts: prevPeriodPosts,
      periodViews,
      prevPeriodViews,
      totalAuthors,
      totalCategories: categories.length,
      avgViews,
      velocity,
    },
    writers,
    writerTrends,
    writerMonths: periodMonths,
    categories: categoryBreakdown,
    viewsDistribution,
    recentPosts,
    topContent,
    publishingTrend,
    monthlyTrend,
    dayOfWeek,
    hourDistribution,
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
      { id: pid, label: 'SportsMockery', name: d.name || 'SportsMockery', followers: d.followers_count || 0, likes: d.fan_count || 0, picture: d.picture?.data?.url || '', needsToken: false },
      { id: 'TruBearsFan', label: 'Tru Bears Fan', name: 'Tru Bears Fan', followers: 0, likes: 0, picture: '', needsToken: true },
      { id: 'ChiBearsRumors', label: 'Chi Bears Rumors', name: 'Chi Bears Rumors', followers: 0, likes: 0, picture: '', needsToken: true },
    ]
  } catch { return [] }
}
