import { Metadata } from 'next'
import { TeamHubLayout, OrbNav, ToolGrid, QuickStats } from '@/components/team'
import { SectionHeader, ArticleCard, AskAIWidget, FanChatWidget } from '@/components/team/shared'
import {
  BearsSeasonCard,
  BearsRosterHighlights,
  BearsTrendingTopics,
} from '@/components/bears'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame, fetchLastGame } from '@/lib/team-config'
import {
  getBearsSeasonOverview,
  getBearsKeyPlayers,
  getBearsTrends,
  getBearsPosts,
} from '@/lib/bears'

export const metadata: Metadata = {
  title: 'Chicago Bears | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Bears coverage including latest news, team stats, schedule, roster, player profiles, and expert analysis.',
  openGraph: {
    title: 'Chicago Bears Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Bears news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Revalidate every hour
export const revalidate = 3600

export default async function BearsHubPage() {
  const team = CHICAGO_TEAMS.bears

  // Fetch all Bears data in parallel
  const [
    record,
    nextGame,
    lastGame,
    seasonOverview,
    keyPlayers,
    trends,
    posts,
  ] = await Promise.all([
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
    fetchLastGame('bears'),
    getBearsSeasonOverview(),
    getBearsKeyPlayers(),
    getBearsTrends(),
    getBearsPosts(12),
  ])

  // Transform posts for display
  const teamPosts = posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    category: 'Bears',
    categorySlug: post.categorySlug,
    author: {
      name: post.author?.displayName || 'Staff',
      avatar: post.author?.avatarUrl,
    },
    publishedAt: post.publishedAt,
  }))

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      lastGame={lastGame}
      activeTab="overview"
    >
      {/* OrbNav - fixed position tool launcher */}
      <OrbNav teamSlug="chicago-bears" accentColor="#C83200" />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '48px',
          maxWidth: '1320px',
          margin: '0 auto',
        }}
      >
        {/* Tool Grid */}
        <ToolGrid teamSlug="chicago-bears" accentColor="#C83200" secondaryColor="#0B162A" />

        {/* Responsive 2-column at lg */}
        <style>{`
          @media (min-width: 1024px) {
            .hub-grid { grid-template-columns: 2fr 1fr !important; }
          }
        `}</style>
        <div className="hub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Left Column: Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Season Snapshot - Mobile Only */}
            <div className="lg:hidden">
              <BearsSeasonCard season={seasonOverview} />
            </div>

            {/* Latest Headlines */}
            <section>
              <SectionHeader title="Latest Bears News" href="/chicago-bears/news" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {teamPosts.slice(0, 6).map((post, index) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    isLarge={index === 0}
                  />
                ))}
              </div>
            </section>

            {/* More Stories */}
            {teamPosts.length > 6 && (
              <section>
                <SectionHeader title="More Bears Stories" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {teamPosts.slice(6, 12).map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Ask AI & Fan Chat - in main column */}
            <AskAIWidget teamSlug="chicago-bears" teamLabel="Bears" />
            <FanChatWidget teamLabel="Bears" channel="bears" />
          </div>

          {/* Right Column: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Season Card - Desktop Only */}
            <div className="hidden lg:block">
              <BearsSeasonCard season={seasonOverview} />
            </div>

            {/* Quick Stats */}
            <QuickStats teamSlug="chicago-bears" teamLabel="Bears" league="NFL" />

            {/* Key Players */}
            {keyPlayers && keyPlayers.length > 0 && (
              <BearsRosterHighlights players={keyPlayers} />
            )}

            {/* AR Stadium Tour */}
            <ARTourButton team="chicago-bears" />

            {/* Trending Topics */}
            {trends && trends.length > 0 && (
              <BearsTrendingTopics trends={trends} />
            )}
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}
