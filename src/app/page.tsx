import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { HomepageFeed } from '@/components/homepage/HomepageFeed'
import { TeamPickerPrompt } from '@/components/homepage/TeamPickerPrompt'
import { DEFAULT_ENGAGEMENT_PROFILE, sortPostsByScore, type ScoringContext } from '@/lib/scoring-v2'
import '@/styles/homepage.css'

export const revalidate = 60 // Revalidate every 60 seconds

async function getHomepageData() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
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

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || null

  // Fetch editor picks (pinned_slot 1-6)
  const { data: editorPicks } = await supabase
    .from('sm_posts')
    .select('id, title, slug, featured_image, team_slug, pinned_slot')
    .eq('editor_pick', true)
    .gte('pinned_slot', 1)
    .lte('pinned_slot', 6)
    .order('pinned_slot', { ascending: true })
    .limit(6)

  // Fetch trending posts (top 5 by views in last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingPosts } = await supabase
    .from('sm_posts')
    .select('id, title, slug, team_slug, views, published_at, importance_score, content_type, primary_topic, author_id, is_evergreen')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(5)

  // Mark trending posts
  const trendingIds = new Set(trendingPosts?.map(p => p.id) || [])

  // Fetch all recent posts for feed
  const { data: allPosts } = await supabase
    .from('sm_posts')
    .select(`
      id, title, slug, excerpt, featured_image, team_slug,
      published_at, importance_score, content_type, primary_topic,
      author_id, is_evergreen, views,
      author:sm_authors!author_id(display_name)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(100)

  // Add is_trending flag and author_name to posts
  const postsWithFlags = (allPosts || []).map((post: any) => ({
    ...post,
    is_trending: trendingIds.has(post.id),
    author_name: Array.isArray(post.author) ? post.author[0]?.display_name : post.author?.display_name || null
  }))

  // Fetch user engagement profile if logged in
  let userProfile = null
  let userTeamPreference: string | null = null

  if (userId) {
    const { data: profileData } = await supabase
      .from('user_engagement_profile')
      .select('*')
      .eq('user_id', userId)
      .single()

    userProfile = profileData || DEFAULT_ENGAGEMENT_PROFILE

    // Determine preferred team (highest score)
    if (userProfile?.team_scores) {
      const teams = Object.entries(userProfile.team_scores)
      teams.sort((a, b) => (b[1] as number) - (a[1] as number))
      if (teams.length > 0 && (teams[0][1] as number) > 50) {
        userTeamPreference = teams[0][0]
      }
    }
  }

  // Fetch viewed post IDs for logged in user
  const viewedPostIds = new Set<string>()
  if (userId) {
    const { data: viewedData } = await supabase
      .from('user_interactions')
      .select('post_id')
      .eq('user_id', userId)
      .eq('clicked', true)

    viewedData?.forEach((v: any) => viewedPostIds.add(v.post_id))
  }

  // Create scoring context
  const scoringContext: ScoringContext = {
    user: userProfile,
    viewedPostIds,
    isLoggedIn: !!userId
  }

  // Sort posts by score
  const rankedPosts = sortPostsByScore(postsWithFlags as any, scoringContext)

  return {
    editorPicks: editorPicks || [],
    trendingPosts: trendingPosts?.map(p => ({ ...p, is_trending: true })) || [],
    rankedPosts,
    userTeamPreference,
    isLoggedIn: !!userId
  }
}

export default async function HomePage() {
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
}
