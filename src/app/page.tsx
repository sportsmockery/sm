import { createClient } from '@supabase/supabase-js'
import { HomepageFeed } from '@/components/homepage/HomepageFeed'
import { getHomepageDataWithFallbacks, FALLBACK_POSTS, FALLBACK_EDITOR_PICKS } from '@/lib/homepage-fallbacks'
import '@/styles/homepage.css'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Helper to extract team_slug from category
function getTeamSlug(category: any): string | null {
  const cat = Array.isArray(category) ? category[0] : category
  const slug = cat?.slug?.toLowerCase() || ''
  if (slug.includes('bears')) return 'bears'
  if (slug.includes('bulls')) return 'bulls'
  if (slug.includes('blackhawks')) return 'blackhawks'
  if (slug.includes('cubs')) return 'cubs'
  if (slug.includes('whitesox') || slug.includes('white-sox')) return 'whitesox'
  return null
}

async function getHomepageData() {
  // Create admin client inline to ensure env vars are available at runtime
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1) Editor picks (pinned_slot 1–6)
  // Use category_id join instead of team_slug (which doesn't exist)
  const { data: editorPicksRaw = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, featured_image, pinned_slot, category:sm_categories!category_id(slug)')
    .eq('editor_pick', true)
    .eq('status', 'published')
    .gte('pinned_slot', 1)
    .lte('pinned_slot', 6)
    .order('pinned_slot', { ascending: true })

  // Map to include team_slug derived from category
  const editorPicks = (editorPicksRaw || []).map((post: any) => ({
    ...post,
    team_slug: getTeamSlug(post.category)
  }))

  // 2) Trending posts (based strictly on views in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingPostsRaw = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, views, published_at, importance_score, content_type, primary_topic, author_id, is_evergreen, category:sm_categories!category_id(slug)')
    .eq('status', 'published')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(20)

  const trendingPosts = (trendingPostsRaw || []).map((post: any) => ({
    ...post,
    team_slug: getTeamSlug(post.category)
  }))

  const trendingIds = new Set(trendingPosts.map(p => p.id))

  // 3) Main feed: ALL recent published posts, recency only
  const { data: allPostsRaw = [] } = await supabase
    .from('sm_posts')
    .select(`
      id, title, slug, excerpt, featured_image,
      published_at, importance_score, content_type, primary_topic,
      author_id, is_evergreen, views,
      category:sm_categories!category_id(slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200)

  // 4) Add team_slug and flags for UI (no scoring)
  const postsWithFlags = (allPostsRaw || []).map((post: any) => ({
    ...post,
    team_slug: getTeamSlug(post.category),
    is_trending: trendingIds.has(post.id),
    author_name: null
  }))

  // 5) Apply fallbacks only if there is truly no data
  const finalData = getHomepageDataWithFallbacks(
    editorPicks,
    postsWithFlags,
    trendingPosts
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
