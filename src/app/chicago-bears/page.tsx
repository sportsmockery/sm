import { Metadata } from 'next'
import Image from 'next/image'
import { TeamHubLayout, TeamHubOverview } from '@/components/team'
import {
  BearsSeasonCard,
  BearsRosterHighlights,
  BearsTrendingTopics,
} from '@/components/bears'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
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
    seasonOverview,
    keyPlayers,
    trends,
    posts,
  ] = await Promise.all([
    fetchTeamRecord('bears'),
    fetchNextGame('bears'),
    getBearsSeasonOverview(),
    getBearsKeyPlayers(),
    getBearsTrends(),
    getBearsPosts(12),
  ])

  // Transform posts for TeamHubOverview component
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

  // Build season stats from overview
  const seasonStats = seasonOverview ? {
    record: `${seasonOverview.record?.wins || 0}-${seasonOverview.record?.losses || 0}`,
    standing: seasonOverview.standing,
  } : undefined

  return (
    <TeamHubLayout
      team={team}
      record={record}
      nextGame={nextGame}
      activeTab="overview"
    >
      {/* Main two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column: Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-8">
          {/* Season Snapshot - Mobile Only */}
          <div className="lg:hidden">
            <BearsSeasonCard season={seasonOverview} />
          </div>

          {/* Latest Headlines */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-lg font-bold border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                Latest Bears News
              </h2>
              <a
                href="/chicago-bears/news"
                className="text-sm font-medium hover:underline"
                style={{ color: team.secondaryColor }}
              >
                View All
              </a>
            </div>

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
              <h2
                className="text-lg font-bold mb-4 border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                More Bears Stories
              </h2>
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

// Article Card Component
import Image from 'next/image'
import Link from 'next/link'

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
          className="rounded-xl overflow-hidden transition-shadow hover:shadow-lg"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
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
            <div className="p-4 md:p-5 flex-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: team.secondaryColor }}
              >
                {post.category || 'Bears'}
              </span>
              <h3
                className="font-bold mt-1 line-clamp-3 group-hover:underline"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  lineHeight: '1.3',
                }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p
                  className="text-sm mt-2 line-clamp-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {post.excerpt}
                </p>
              )}
              <div
                className="flex items-center gap-2 mt-3 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                {post.author && <span>{post.author.name}</span>}
                <span>•</span>
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
        className="rounded-xl overflow-hidden flex gap-4 p-3 transition-colors hover:bg-[var(--bg-hover)]"
        style={{ backgroundColor: 'var(--bg-surface)' }}
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
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.4',
            }}
          >
            {post.title}
          </h3>
          <div
            className="flex items-center gap-2 mt-2 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
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
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
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
              color: 'var(--text-primary)',
            }}
          >
            Scout AI
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Get instant answers about the Bears
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <Link
          href="/ask-ai?team=chicago-bears&q=What%20is%20the%20Bears%20record%20this%20season"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          &quot;What&apos;s the Bears record?&quot;
        </Link>
        <Link
          href="/ask-ai?team=chicago-bears&q=Who%20is%20the%20Bears%20quarterback"
          className="block px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
          }}
        >
          &quot;Who is the Bears quarterback?&quot;
        </Link>
      </div>

      <Link
        href="/ask-ai?team=chicago-bears"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.secondaryColor }}
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
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
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
              color: 'var(--text-primary)',
            }}
          >
            Bears Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>247 fans online</span>
          </div>
        </div>
      </div>

      <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
        Join the conversation with fellow Bears fans.
      </p>

      <Link
        href="/fan-chat?channel=bears"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Join Bears Chat
      </Link>
    </div>
  )
}
