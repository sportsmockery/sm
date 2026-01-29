import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { HomepageFeed } from '@/components/homepage/HomepageFeed'
import { TeamPickerPrompt } from '@/components/homepage/TeamPickerPrompt'
import { DEFAULT_ENGAGEMENT_PROFILE, sortPostsByScore, type ScoringContext } from '@/lib/scoring-v2'
import { getHomepageDataWithFallbacks, FALLBACK_POSTS, FALLBACK_EDITOR_PICKS } from '@/lib/homepage-fallbacks'
import { supabaseAdmin } from '@/lib/supabase-server'
import '@/styles/homepage.css'

export const revalidate = 60 // Revalidate every 60 seconds

async function getHomepageData() {
  const cookieStore = await cookies()

  // Auth client for user detection (uses anon key with cookies)
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => { cookieStore.set(name, value, options) }) } catch {}
        },
      },
    }
  )

  // Use supabaseAdmin for data queries (bypasses RLS for public content)
  const supabase = supabaseAdmin

  // 1) Get user (if any)
  let userId: string | null = null
  try {
    const { data: { user } } = await authClient.auth.getUser()
    userId = user?.id || null
  } catch {
    userId = null
  }

  // 2) Editor picks (no limit on anonymous vs logged-in)
  const { data: editorPicks = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, featured_image, team_slug, pinned_slot')
    .eq('editor_pick', true)
    .eq('status', 'published')
    .gte('pinned_slot', 1)
    .lte('pinned_slot', 6)
    .order('pinned_slot', { ascending: true })

  // 3) Trending posts (for badges + sidebar)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingPosts = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, team_slug, views, published_at, importance_score, content_type, primary_topic, author_id, is_evergreen')
    .eq('status', 'published')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(20) // we only show top 5 but keep extra for future use

  const trendingIds = new Set((trendingPosts || []).map(p => p.id))

  // 4) MAIN FEED: always fetch a large set of published posts
  // IMPORTANT: this MUST NOT depend on login state
  const { data: allPosts = [] } = await supabase
    .from('sm_posts')
    .select(`
      id, title, slug, excerpt, featured_image, team_slug,
      published_at, importance_score, content_type, primary_topic,
      author_id, is_evergreen, views
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200) // adjust if needed, but must be "all recent public posts"

  const postsWithFlags = (allPosts || []).map((post: any) => ({
    ...post,
    is_trending: trendingIds.has(post.id),
    author_name: null
  }))

  // 5) Personalization data for logged-in users (optional, never filters)
  // Use authClient for user-specific data (respects RLS)
  let userProfile: any = null
  const viewedPostIds = new Set<string>()

  if (userId) {
    const { data: profileData } = await authClient
      .from('user_engagement_profile')
      .select('*')
      .eq('user_id', userId)
      .single()

    userProfile = profileData || null

    const { data: viewedData } = await authClient
      .from('user_interactions')
      .select('post_id')
      .eq('user_id', userId)
      .eq('clicked', true)

    if (viewedData) {
      viewedData.forEach((v: any) => viewedPostIds.add(v.post_id))
    }
  }

  // 6) Scoring: NEVER drop posts, only sort for logged-in users
  const scoringContext: ScoringContext = {
    user: userProfile,
    viewedPostIds,
    isLoggedIn: !!userId
  }

  // Anonymous users: show posts in pure recency order (no scoring)
  // Logged-in users: sort by score
  const rankedPosts = userId
    ? sortPostsByScore(postsWithFlags as any, scoringContext)
    : postsWithFlags // already ordered by published_at DESC

  // 7) Apply fallbacks ONLY if absolutely no posts
  const finalData = getHomepageDataWithFallbacks(
    editorPicks || [],
    rankedPosts,
    (trendingPosts || []).map(p => ({ ...p, is_trending: true }))
  )

  // 8) Optional: preferred team for UI only (does NOT filter content)
  let userTeamPreference: string | null = null
  if (userProfile?.team_scores) {
    const teams = Object.entries(userProfile.team_scores)
    teams.sort((a, b) => (b[1] as number) - (a[1] as number))
    if (teams.length > 0 && (teams[0][1] as number) > 50) {
      userTeamPreference = teams[0][0]
    }
  }

  return {
    editorPicks: finalData.editorPicks,
    trendingPosts: finalData.trendingPosts,
    rankedPosts: finalData.rankedPosts,
    userTeamPreference,
    isLoggedIn: !!userId
  }
}

export default async function HomePage() {
  try {
    const {
      editorPicks,
      trendingPosts,
      rankedPosts,
      userTeamPreference,
      isLoggedIn
    } = await getHomepageData()

    return (
      <>
        <HomepageFeed
          initialPosts={rankedPosts}
          editorPicks={editorPicks}
          trendingPosts={trendingPosts}
          userTeamPreference={userTeamPreference}
          isLoggedIn={isLoggedIn}
        />

        {/* Team Picker for anonymous users */}
        {!isLoggedIn && <TeamPickerPrompt />}
      </>
    )
  } catch (error) {
    console.error('Homepage data fetch error:', error)

    // Return fallback content on any error
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
