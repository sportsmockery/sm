import { Metadata } from 'next'
import { TeamHubLayout, QuickStats } from '@/components/team'
import { SectionHeader, ArticleCard } from '@/components/team/shared'
import RecentHubUpdates from '@/components/hub/RecentHubUpdates'
import TeamSeasonCard from '@/components/team/shared/TeamSeasonCard'
import TeamRosterHighlights from '@/components/team/shared/TeamRosterHighlights'
import TeamTrendingTopics from '@/components/team/shared/TeamTrendingTopics'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame, fetchLastGame } from '@/lib/team-config'
import { getTeamSeasonOverview, getTeamKeyPlayers, getTeamTrends } from '@/lib/team-sidebar-data'
import { supabaseAdmin } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Chicago Bulls | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Bulls coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Bulls Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Bulls news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Fetch Bulls posts from database
async function getBullsPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-bulls')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching Bulls posts:', error)
      return []
    }

    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-bulls',
      publishedAt: post.published_at,
    }))
  } catch (error) {
    console.error('Error fetching Bulls posts:', error)
    return []
  }
}

export default async function BullsHubPage() {
  const team = CHICAGO_TEAMS.bulls

  // Fetch all data in parallel
  const [record, nextGame, lastGame, posts, seasonOverview, keyPlayers, trends] = await Promise.all([
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
    fetchLastGame('bulls'),
    getBullsPosts(12),
    getTeamSeasonOverview('bulls'),
    getTeamKeyPlayers('bulls'),
    getTeamTrends('bulls'),
  ])

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      lastGame={lastGame}
      activeTab="overview"
    >
      {/* OrbNav removed — navigation handled by sidebar */}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', maxWidth: '1320px', margin: '0 auto' }}>
        {/* Content Grid */}
        <style>{`@media (min-width: 1024px) { .hub-grid-bulls { grid-template-columns: 2fr 1fr !important; } }`}</style>
        <div className="hub-grid-bulls" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Left Column: Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            {/* Season Snapshot - Mobile Only */}
            <div className="lg:hidden">
              <TeamSeasonCard season={seasonOverview} />
            </div>

            <RecentHubUpdates teamSlug="chicago-bulls" />

            <section>
              <SectionHeader title="Latest Bulls News" />
              {posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {posts.slice(0, 6).map((post, index) => (
                    <ArticleCard key={post.id} post={post} isLarge={index === 0} teamLabel="Bulls" />
                  ))}
                </div>
              ) : (
                <div className="glass-card glass-card-static" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--sm-text-muted)', margin: 0 }}>No Bulls articles found. Check back soon!</p>
                </div>
              )}
            </section>

            {posts.length > 6 && (
              <section>
                <SectionHeader title="More Bulls Stories" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {posts.slice(6, 12).map((post) => (
                    <ArticleCard key={post.id} post={post} teamLabel="Bulls" />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="hidden lg:flex" style={{ flexDirection: 'column', gap: '24px' }}>
            {/* Season Card - Desktop Only */}
            <TeamSeasonCard season={seasonOverview} />

            {/* Quick Stats */}
            <QuickStats teamSlug="chicago-bulls" teamLabel="Bulls" league="NBA" />

            {/* Key Players */}
            {keyPlayers && keyPlayers.length > 0 && (
              <TeamRosterHighlights players={keyPlayers} teamSlug="chicago-bulls" />
            )}

            {/* Trending Topics */}
            {trends && trends.length > 0 && (
              <TeamTrendingTopics trends={trends} teamSlug="chicago-bulls" />
            )}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}
