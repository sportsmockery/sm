import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
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
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Left Column: Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Season Snapshot - Mobile Only */}
          <div className="lg:hidden">
            <BearsSeasonCard season={seasonOverview} />
          </div>

          {/* Latest Headlines */}
          <section>
            <SectionHeader title="Latest Bears News" team={team} href="/chicago-bears/news" />
            <div className="space-y-4">
              {teamPosts.slice(0, 6).map((post, index) => (
                <ArticleCard
                  key={post.id}
                  post={post}
                  team={team}
                  isLarge={index === 0}
                />
              ))}
            </div>
          </section>

          {/* More Stories */}
          {teamPosts.length > 6 && (
            <section>
              <SectionHeader title="More Bears Stories" team={team} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {teamPosts.slice(6, 12).map((post) => (
                  <ArticleCard key={post.id} post={post} team={team} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Season Card - Desktop Only */}
          <div className="hidden lg:block">
            <BearsSeasonCard season={seasonOverview} />
          </div>

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

          {/* Ask AI Widget */}
          <AskAIWidget team={team} />

          {/* Fan Chat Widget */}
          <FanChatWidget team={team} />
        </div>
      </div>
    </TeamHubLayout>
  )
}

// Section Header
function SectionHeader({
  title,
  team,
  href,
}: {
  title: string
  team: typeof CHICAGO_TEAMS.bears
  href?: string
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2
        style={{
          fontFamily: "'Montserrat', sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: `3px solid ${team.secondaryColor}`,
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold hover:underline"
          style={{ color: team.secondaryColor }}
        >
          View All
        </Link>
      )}
    </div>
  )
}

// Article Card Component
function ArticleCard({
  post,
  team,
  isLarge = false,
}: {
  post: any
  team: typeof CHICAGO_TEAMS.bears
  isLarge?: boolean
}) {
  const href = post.categorySlug
    ? `/${post.categorySlug}/${post.slug}`
    : `/bears/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article
          className="overflow-hidden transition-all duration-300"
          style={{
            borderRadius: 'var(--sm-radius-lg)',
            backgroundColor: 'var(--sm-card)',
            border: '1px solid var(--sm-border)',
          }}
        >
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image
                  src={post.featuredImage}
                  alt=""
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: team.secondaryColor }}
                />
              </div>
            )}
            <div className="p-5 md:p-6 flex-1">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{ color: team.secondaryColor }}
              >
                {post.category || 'Bears'}
              </span>
              <h3
                className="font-bold mt-2 line-clamp-3 group-hover:underline"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '20px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="mt-3 line-clamp-2"
                  style={{ color: 'var(--sm-text-muted)', fontSize: '15px', lineHeight: '1.6' }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-4 text-xs"
                style={{ color: 'var(--sm-text-dim)' }}
              >
                {post.author && <span className="font-medium">{post.author.name}</span>}
                <span>-</span>
                <span>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article
        className="overflow-hidden flex gap-4 p-3 transition-all duration-200"
        style={{
          borderRadius: 'var(--sm-radius-lg)',
          backgroundColor: 'var(--sm-card)',
          border: '1px solid var(--sm-border)',
        }}
      >
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt=""
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold line-clamp-2 group-hover:underline"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '15px',
              lineHeight: '1.4',
            }}
          >
            {post.title}
          </h3>
          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--sm-text-dim)' }}
          >
            {post.author && <span>{post.author.name}</span>}
            {post.author && <span>-</span>}
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Scout AI Widget
function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.bears }) {
  return (
    <div
      style={{
        borderRadius: 'var(--sm-radius-lg)',
        padding: '24px',
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.secondaryColor}20` }}
        >
          <Image
            src="/downloads/scout-v2.png"
            alt="Scout AI"
            width={20}
            height={20}
            className="w-5 h-5"
          />
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
            }}
          >
            Scout AI
          </h3>
          <p className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>
            Get instant answers about the Bears
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Link
          href="/scout-ai?team=chicago-bears&q=What%20is%20the%20Bears%20record%20this%20season"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--sm-surface)',
            color: 'var(--sm-text-muted)',
            border: '1px solid var(--sm-border)',
          }}
        >
          &quot;What&apos;s the Bears record?&quot;
        </Link>
        <Link
          href="/scout-ai?team=chicago-bears&q=Who%20is%20the%20Bears%20quarterback"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--sm-surface)',
            color: 'var(--sm-text-muted)',
            border: '1px solid var(--sm-border)',
          }}
        >
          &quot;Who is the Bears quarterback?&quot;
        </Link>
      </div>

      <Link
        href="/scout-ai?team=chicago-bears"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          padding: '12px 20px',
          borderRadius: '100px',
          fontWeight: 600,
          fontSize: '14px',
          color: '#fff',
          backgroundColor: team.secondaryColor,
          textDecoration: 'none',
        }}
      >
        Ask Scout
      </Link>
    </div>
  )
}

// Fan Chat Widget
function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.bears }) {
  return (
    <div
      style={{
        borderRadius: 'var(--sm-radius-lg)',
        padding: '24px',
        backgroundColor: 'var(--sm-card)',
        border: '1px solid var(--sm-border)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${team.primaryColor}20` }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: team.primaryColor }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
            />
          </svg>
        </div>
        <div>
          <h3
            className="font-bold"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              color: 'var(--sm-text)',
            }}
          >
            Bears Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--sm-text-dim)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Fans online</span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--sm-text-muted)' }}>
        Join the conversation with fellow Bears fans.
      </p>

      <Link
        href="/fan-chat?channel=bears"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          padding: '12px 20px',
          borderRadius: '100px',
          fontWeight: 600,
          fontSize: '14px',
          color: '#fff',
          backgroundColor: team.primaryColor,
          textDecoration: 'none',
        }}
      >
        Join Bears Chat
      </Link>
    </div>
  )
}
