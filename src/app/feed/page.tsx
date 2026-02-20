import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { HomepageFeed } from '@/components/homepage/HomepageFeed'
import { FeedPersonalization } from '@/components/feed/FeedPersonalization'
import { sortPostsByScore, type ScoringContext } from '@/lib/scoring-v2'
import { getHomepageDataWithFallbacks } from '@/lib/homepage-fallbacks'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: { absolute: 'Sports Mockery | Feed' },
  description: 'Your personalized Chicago sports feed — Bears, Bulls, Cubs, White Sox, Blackhawks.',
  openGraph: {
    title: 'Sports Mockery | Feed',
    description: 'Your personalized Chicago sports feed — Bears, Bulls, Cubs, White Sox, Blackhawks.',
  },
}

export const revalidate = 60

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

async function getFeedData() {
  const cookieStore = await cookies()

  // Auth client for user detection
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )

  // 1) Require logged-in user
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    redirect('/') // no feed for anonymous users
  }
  const userId = user.id

  // Use supabaseAdmin to bypass RLS for public post queries
  const supabase = supabaseAdmin

  // 2) Editor picks - use top posts by importance_score as a proxy
  const { data: editorPicksRaw = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, featured_image, author:sm_authors!author_id(display_name, avatar_url), category:sm_categories!category_id(slug)')
    .eq('status', 'published')
    .order('importance_score', { ascending: false })
    .limit(6)

  const editorPicks = (editorPicksRaw || []).map((post: any, index: number) => {
    const cat = Array.isArray(post.category) ? post.category[0] : post.category
    const auth = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      ...post,
      team_slug: getTeamSlug(post.category),
      category_slug: cat?.slug || null,
      author_name: auth?.display_name || null,
      author_avatar_url: auth?.avatar_url || null,
      pinned_slot: index + 1
    }
  })

  // 3) Trending posts (same view-based logic as homepage)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: trendingPostsRaw = [] } = await supabase
    .from('sm_posts')
    .select('id, title, slug, views, published_at, importance_score, content_type, primary_topic, author:sm_authors!author_id(display_name, avatar_url), category:sm_categories!category_id(slug)')
    .eq('status', 'published')
    .gte('published_at', sevenDaysAgo.toISOString())
    .order('views', { ascending: false })
    .limit(20)

  const trendingPosts = (trendingPostsRaw || []).map((post: any) => {
    const cat = Array.isArray(post.category) ? post.category[0] : post.category
    const auth = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      ...post,
      team_slug: getTeamSlug(post.category),
      category_slug: cat?.slug || null,
      author_name: auth?.display_name || null,
      author_avatar_url: auth?.avatar_url || null,
      is_evergreen: false
    }
  })

  const trendingIds = new Set(trendingPosts.map(p => p.id))

  // 4) Main feed posts: full set
  const { data: allPostsRaw = [] } = await supabase
    .from('sm_posts')
    .select(`
      id, title, slug, excerpt, featured_image,
      published_at, importance_score, content_type, primary_topic,
      views,
      author:sm_authors!author_id(display_name, avatar_url),
      category:sm_categories!category_id(slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200)

  const postsWithFlags = (allPostsRaw || []).map((post: any) => {
    const cat = Array.isArray(post.category) ? post.category[0] : post.category
    const auth = Array.isArray(post.author) ? post.author[0] : post.author
    return {
      ...post,
      team_slug: getTeamSlug(post.category),
      category_slug: cat?.slug || null,
      is_trending: trendingIds.has(post.id),
      is_evergreen: false,
      author_name: auth?.display_name || null,
      author_avatar_url: auth?.avatar_url || null,
    }
  })

  // 5) Load personalization data
  const { data: profileData } = await authClient
    .from('user_engagement_profile')
    .select('*')
    .eq('user_id', userId)
    .single()

  const userProfile = profileData || null

  const viewedPostIds = new Set<string>()
  const { data: viewedData } = await authClient
    .from('user_interactions')
    .select('post_id')
    .eq('user_id', userId)
    .eq('clicked', true)

  if (viewedData) {
    viewedData.forEach((v: any) => viewedPostIds.add(v.post_id))
  }

  // 6) Scoring context and ranking
  const scoringContext: ScoringContext = {
    user: userProfile,
    viewedPostIds,
    isLoggedIn: true
  }

  const rankedPosts = sortPostsByScore(postsWithFlags as any, scoringContext)

  // 7) Fallbacks
  const finalData = getHomepageDataWithFallbacks(
    editorPicks || [],
    rankedPosts,
    trendingPosts || []
  )

  // 8) Determine preferred team for UI highlighting
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
    userId,
    userProfile,
  }
}

export default async function FeedPage() {
  const {
    editorPicks,
    trendingPosts,
    rankedPosts,
    userTeamPreference,
    userId,
    userProfile,
  } = await getFeedData()

  return (
    <>
      <div className="sm-container">
        <div className="feed-page-header">
          <h2>
            <span className="gradient-text">For You</span>
          </h2>
          <p className="feed-subheader">
            Personalized based on your team interests and reading habits
          </p>
        </div>

        <FeedPersonalization
          userId={userId}
          initialTeamScores={userProfile?.team_scores || undefined}
          initialFormatPrefs={userProfile?.format_prefs || undefined}
        />
      </div>

      <HomepageFeed
        initialPosts={rankedPosts}
        editorPicks={editorPicks}
        trendingPosts={trendingPosts}
        userTeamPreference={userTeamPreference}
        isLoggedIn={true}
      />
    </>
  )
}
