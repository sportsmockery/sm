import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'

const WP_API = 'https://www.sportsmockery.com/wp-json/wp/v2'
const WP_EXPORT = 'https://www.sportsmockery.com/wp-json/sm-export/v1'
const WP_SMED = 'https://www.sportsmockery.com/wp-json/smed/v1'
const SEMRUSH_API = 'https://api.semrush.com'
const MAX_PAGES = 10
const PER_PAGE = 100

// ── Social configs ────────────────────────────────────────────────────────────
const YT = [
  { handle: 'sportsmockery', label: 'SportsMockery' },
  { handle: 'untoldchicago', label: 'Untold Chicago Stories' },
  { handle: 'PinwheelsandIvyPodcast', label: 'Pinwheels & Ivy' },
]
const XA = [
  { username: 'sportsmockery', label: 'SportsMockery' },
  { username: 'bfr_pod', label: 'Bears Film Room Pod' },
  { username: 'PinwheelsIvyPod', label: 'Pinwheels & Ivy Pod' },
  { username: 'SSBehavior', label: 'SS Behavior' },
  { username: 'dabearsblog', label: 'DaBearsBlog' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || 'this-month'
  const now = new Date()
  let startDate: Date
  let endDate: Date = now
  switch (range) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'yesterday':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'this-week':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
      break
    case 'this-month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case 'last-month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      break
    case 'ytd':
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    case 'last-year':
      startDate = new Date(now.getFullYear() - 1, 0, 1)
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999)
      break
    case 'custom': {
      const cs = searchParams.get('start')
      const ce = searchParams.get('end')
      startDate = cs ? new Date(cs) : new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = ce ? new Date(ce) : now
      break
    }
    // Legacy keys
    case '7d': startDate = new Date(now.getTime() - 7 * 86400000); break
    case '28d': startDate = new Date(now.getTime() - 28 * 86400000); break
    case '90d': startDate = new Date(now.getTime() - 90 * 86400000); break
    case '1y': startDate = new Date(now.getTime() - 365 * 86400000); break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }
  const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000))
  const prevStart = new Date(startDate.getTime() - days * 86400000)

  try {
    const [editorial, social, seo, paymentSync] = await Promise.all([
      fetchEditorial(startDate, prevStart, endDate, days),
      fetchSocial(),
      fetchSEO(),
      fetchPaymentSyncStatus(),
    ])
    return NextResponse.json({ ...editorial, social, seo, paymentSync, range, days, timestamp: Date.now() })
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
        `&_fields=id,date,date_gmt,slug,title,author,categories,featured_media`
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

  // ── Bulk fetch featured images ──
  const mediaIds = [...new Set(period.filter((p: any) => p.featured_media).map((p: any) => p.featured_media))] as number[]
  const mediaMap = new Map<number, string>()
  if (mediaIds.length > 0) {
    for (let i = 0; i < mediaIds.length; i += 100) {
      const chunk = mediaIds.slice(i, i + 100)
      try {
        const { data: mediaData } = await wpApiFetch(`/media?include=${chunk.join(',')}&per_page=100&_fields=id,source_url`)
        for (const m of (mediaData || [])) {
          mediaMap.set(m.id, m.source_url)
        }
      } catch {}
    }
  }

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
    }
  }).sort((a, b) => b.views - a.views || b.posts - a.posts)

  // ── Daily publishing trend ──
  const dMap = new Map<string, { count: number; views: number }>()
  for (const p of period) {
    const day = (p.date_gmt || p.date)?.split('T')[0]; if (!day) continue
    const e = dMap.get(day) || { count: 0, views: 0 }
    e.count++
    e.views += postViewsMap.get(p.id) || 0
    dMap.set(day, e)
  }
  const publishingTrend = Array.from(dMap.entries())
    .map(([date, { count, views }]) => ({ date, count, views }))
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
  const catStats = new Map<number, { count: number; views: number }>()
  for (const p of period) {
    const pViews = postViewsMap.get(p.id) || 0
    for (const catId of (p.categories || [])) {
      const e = catStats.get(catId) || { count: 0, views: 0 }
      e.count++
      e.views += pViews
      catStats.set(catId, e)
    }
  }
  const categoryBreakdown = Array.from(catStats.entries())
    .map(([id, { count, views }]) => ({ name: getCatName(id), count, views, avgViews: count > 0 ? Math.round(views / count) : 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  // ── Monthly trend ──
  // Aggregate monthly views from SMED author data
  const monthlyViewsMap = new Map<string, number>()
  for (const row of (smedAuthorViews || [])) {
    const m = row.month
    if (m) monthlyViewsMap.set(m, (monthlyViewsMap.get(m) || 0) + parseInt(row.total_views || '0'))
  }
  const monthlyTrend = monthCounts.map(m => ({ ...m, views: monthlyViewsMap.get(m.month) || 0 }))

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
    featured_image: mediaMap.get(p.featured_media) || null,
  })

  // Build cross-reference maps from period posts for topContent
  const postCatMap = new Map<number, string>()
  const postImageMap = new Map<number, string | null>()
  for (const p of period) {
    if (p.categories?.length > 0) {
      postCatMap.set(p.id, getCatName(p.categories[0]))
    }
    if (p.featured_media) {
      postImageMap.set(p.id, mediaMap.get(p.featured_media) || null)
    }
  }

  // Sort top content by views from SMED data
  const topContent = [...(smedTopPosts || [])].slice(0, 15).map((sp: any) => {
    const postId = parseInt(sp.post_id)
    return {
      id: postId,
      title: sp.title || '',
      slug: sp.slug || '',
      published_at: sp.published_at || '',
      author_name: sp.author_name || '',
      category_name: postCatMap.get(postId) || '',
      views: parseInt(sp.views || '0'),
      featured_image: postImageMap.get(postId) || null,
    }
  })
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
  const token = process.env.FB_PAGE_ACCESS_TOKEN, pid = process.env.FB_PAGE_ID
  if (!token || !pid) return [{ id: 'sportsmockery', label: 'SportsMockery', name: 'SportsMockery', followers: 0, likes: 0, picture: '', needsToken: true }]
  try {
    const r = await fetch(`https://graph.facebook.com/v24.0/${pid}?fields=name,fan_count,followers_count,picture&access_token=${token}`, { next: { revalidate: 3600 } })
    if (!r.ok) return []; const d = await r.json()
    return [
      { id: pid, label: 'SportsMockery', name: d.name || 'SportsMockery', followers: d.followers_count || 0, likes: d.fan_count || 0, picture: d.picture?.data?.url || '', needsToken: false },
    ]
  } catch { return [] }
}

// ── SEMRush SEO data ─────────────────────────────────────────────────────────
function parseSemrushCSV(csv: string): any[] {
  const lines = csv.trim().split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []
  const headers = lines[0].split(';')
  return lines.slice(1).map(line => {
    const vals = line.split(';')
    const obj: any = {}
    headers.forEach((h, i) => obj[h] = vals[i] || '')
    return obj
  })
}

async function fetchSEO() {
  const key = process.env.SEMRUSH_API_KEY; if (!key) return null
  const domain = 'sportsmockery.com'
  try {
    const [overviewRes, keywordsRes, competitorsRes] = await Promise.allSettled([
      fetch(`${SEMRUSH_API}/?type=domain_rank&key=${key}&export_columns=Db,Dn,Rk,Or,Ot,Oc,Ad,At,Ac&domain=${domain}&database=us`, { next: { revalidate: 3600 } }),
      fetch(`${SEMRUSH_API}/?type=domain_organic&key=${key}&export_columns=Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr&domain=${domain}&database=us&display_limit=20&display_sort=tr_desc`, { next: { revalidate: 3600 } }),
      fetch(`${SEMRUSH_API}/?type=domain_organic_organic&key=${key}&export_columns=Dn,Cr,Np,Or,Ot,Oc,Ad&domain=${domain}&database=us&display_limit=10`, { next: { revalidate: 3600 } }),
    ])

    let overview = null
    if (overviewRes.status === 'fulfilled' && overviewRes.value.ok) {
      const rows = parseSemrushCSV(await overviewRes.value.text())
      if (rows.length > 0) {
        const r = rows[0]
        overview = {
          rank: parseInt(r['Rank'] || '0'),
          organicKeywords: parseInt(r['Organic Keywords'] || '0'),
          organicTraffic: parseInt(r['Organic Traffic'] || '0'),
          organicCost: parseInt(r['Organic Cost'] || '0'),
          adwordsKeywords: parseInt(r['Adwords Keywords'] || '0'),
          adwordsTraffic: parseInt(r['Adwords Traffic'] || '0'),
        }
      }
    }

    let keywords: any[] = []
    if (keywordsRes.status === 'fulfilled' && keywordsRes.value.ok) {
      const rows = parseSemrushCSV(await keywordsRes.value.text())
      keywords = rows.map(r => ({
        keyword: r['Keyword'] || '',
        position: parseInt(r['Position'] || '0'),
        previousPosition: parseInt(r['Previous Position'] || '0'),
        searchVolume: parseInt(r['Search Volume'] || '0'),
        cpc: parseFloat(r['CPC'] || '0'),
        url: r['Url'] || '',
        trafficPct: parseFloat(r['Traffic (%)'] || '0'),
        competition: parseFloat(r['Competition'] || '0'),
      }))
    }

    let competitors: any[] = []
    if (competitorsRes.status === 'fulfilled' && competitorsRes.value.ok) {
      const rows = parseSemrushCSV(await competitorsRes.value.text())
      competitors = rows.map(r => ({
        domain: r['Domain'] || '',
        relevance: parseFloat(r['Competitor Relevance'] || '0'),
        commonKeywords: parseInt(r['Common Keywords'] || '0'),
        organicKeywords: parseInt(r['Organic Keywords'] || '0'),
        organicTraffic: parseInt(r['Organic Traffic'] || '0'),
      }))
    }

    return { overview, keywords, competitors }
  } catch (e) {
    console.error('[Exec] SEMRush error:', e)
    return null
  }
}

// ── Payment sync status + data ───────────────────────────────────────────────
async function fetchPaymentSyncStatus() {
  try {
    // Fetch latest sync status
    const { data: syncData } = await supabaseAdmin
      .from('writer_payment_syncs')
      .select('*')
      .order('synced_at', { ascending: false })
      .limit(1)
      .single()

    // Fetch current period payments
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString().split('T')[0]

    const { data: payments } = await supabaseAdmin
      .from('writer_payments')
      .select('*')
      .eq('period_start', periodStart)
      .eq('period_end', periodEnd)
      .order('calculated_pay', { ascending: false })

    // Fetch payment formulas
    const { data: formulas } = await supabaseAdmin
      .from('writer_payment_formulas')
      .select('*')
      .eq('is_active', true)

    // Fetch payment history (last 12 months)
    const { data: history } = await supabaseAdmin
      .from('writer_payments')
      .select('*')
      .lt('period_start', periodStart)
      .order('period_start', { ascending: false })
      .limit(200)

    return {
      sync: syncData ? {
        status: syncData.status,
        lastSync: syncData.synced_at,
        errorMessage: syncData.error_message,
        writersSynced: syncData.writers_synced,
        totalViewsSynced: syncData.total_views_synced,
      } : { status: 'unknown', lastSync: null },
      payments: payments || [],
      formulas: (formulas || []).map((f: any) => ({
        id: f.id,
        name: f.writer_name,
        desc: f.formula_description,
        formula: f.formula_code,
        effectiveDate: f.effective_from,
        writerId: f.writer_id,
      })),
      history: history || [],
    }
  } catch {
    return { sync: { status: 'unknown', lastSync: null }, payments: [], formulas: [], history: [] }
  }
}
