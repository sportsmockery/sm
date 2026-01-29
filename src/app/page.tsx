import { createClient } from '@supabase/supabase-js'
import { HomepageFeed } from '@/components/homepage/HomepageFeed'
import { getHomepageDataWithFallbacks, FALLBACK_POSTS, FALLBACK_EDITOR_PICKS } from '@/lib/homepage-fallbacks'
import '@/styles/homepage.css'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

async function getHomepageData() {
  console.log('[Homepage] Starting getHomepageData')
  console.log('[Homepage] Env check:', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  // Create admin client inline to ensure env vars are available at runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Editor picks (pinned_slot 1–6)
  console.log('[Homepage] Fetching editor picks...')
  const { data: editorPicks = [], error: edError } = await supabase
    .from('sm_posts')
    .select('id, title, slug, featured_image, team_slug, pinned_slot')
    .eq('editor_pick', true)
    .eq('status', 'published')
    .gte('pinned_slot', 1)
    .lte('pinned_slot', 6)
    .order('pinned_slot', { ascending: true })
  console.log('[Homepage] Editor picks:', { count: editorPicks?.length, error: edError?.message })

  // 2) Trending posts (based strictly on views in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingPosts = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, team_slug, views, published_at, importance_score, content_type, primary_topic, author_id, is_evergreen')
    .eq('status', 'published')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(20) // top 20 for flexibility; UI will show top 5

  const trendingIds = new Set((trendingPosts || []).map(p => p.id))

  // 3) Main feed: ALL recent published posts, recency only
  console.log('[Homepage] Fetching all posts...')
  const { data: allPosts = [], error: postsError } = await supabase
    .from('sm_posts')
    .select(`
      id, title, slug, excerpt, featured_image, team_slug,
      published_at, importance_score, content_type, primary_topic,
      author_id, is_evergreen, views
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200) // All recent posts for homepage
  console.log('[Homepage] All posts:', { count: allPosts?.length, error: postsError?.message })

  // 4) Add flags for UI (no scoring)
  const postsWithFlags = (allPosts || []).map(post => ({
    ...post,
    is_trending: trendingIds.has(post.id),
    author_name: null
  }))

  // 5) Apply fallbacks only if there is truly no data
  const finalData = getHomepageDataWithFallbacks(
    editorPicks || [],
    postsWithFlags,
    trendingPosts || []
  )

  return {
    editorPicks: finalData.editorPicks,
    trendingPosts: finalData.trendingPosts,
    // IMPORTANT: homepage uses recency, not scoring
    rankedPosts: finalData.rankedPosts,
    isLoggedIn: false,
    userTeamPreference: null
  }
}

export default async function HomePage() {
  try {
    const {
      editorPicks,
      trendingPosts,
      rankedPosts,
      isLoggedIn,
      userTeamPreference
    } = await getHomepageData()

    return (
      <HomepageFeed
        initialPosts={rankedPosts}
        editorPicks={editorPicks}
        trendingPosts={trendingPosts}
        userTeamPreference={userTeamPreference}
        isLoggedIn={isLoggedIn}
      />
    )
  } catch (error: any) {
    console.error('[Homepage] CAUGHT ERROR:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack?.split('\n').slice(0, 5).join('\n')
    })
    return (
      <HomepageFeed
        initialPosts={FALLBACK_POSTS}
        editorPicks={FALLBACK_EDITOR_PICKS}
        trendingPosts={[]}
        userTeamPreference={null}
        isLoggedIn={false}
      />
    )
  }
}
