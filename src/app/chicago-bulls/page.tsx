import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago Bulls | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Bulls coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Bulls Hub | Sports Mockery',
    description: 'Your #1 source for Chicago Bulls news, stats, schedule, and analysis',
    type: 'website',
  },
}

// Revalidate every hour
export const revalidate = 3600

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
  const [record, nextGame, posts] = await Promise.all([
    fetchTeamRecord('bulls'),
    fetchNextGame('bulls'),
    getBullsPosts(12),
  ])

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
                Latest Bulls News
              </h2>
            </div>

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard
                    key={post.id}
                    post={post}
                    team={team}
                    isLarge={index === 0}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12 rounded-xl"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  No Bulls articles found. Check back soon!
                </p>
              </div>
            )}
          </section>

          {/* More Stories */}
          {posts.length > 6 && (
            <section>
              <h2
                className="text-lg font-bold mb-4 border-b-2 pb-1"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  color: 'var(--text-primary)',
                  borderColor: team.secondaryColor,
                }}
              >
                More Bulls Stories
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => (
                  <ArticleCard key={post.id} post={post} team={team} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Season Snapshot */}
          <SeasonSnapshotCard team={team} record={record} />

          {/* Quick Links */}
          <QuickLinksCard team={team} />

          {/* AR Stadium Tour */}
          <ARTourButton team="chicago-bulls" />

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
function ArticleCard({
  post,
  team,
  isLarge = false,
}: {
  post: any
  team: typeof CHICAGO_TEAMS.bulls
  isLarge?: boolean
}) {
  const href = `/${post.categorySlug}/${post.slug}`

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
                  style={{ backgroundColor: team.primaryColor }}
                />
              </div>
            )}
            <div className="p-4 md:p-5 flex-1">
              <span
                className="text-[10px] font-bold uppercase tracking-wide"
                style={{ color: team.primaryColor }}
              >
                Bulls
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

// Season Snapshot Card
function SeasonSnapshotCard({
  team,
  record,
}: {
  team: typeof CHICAGO_TEAMS.bulls
  record: { wins: number; losses: number } | null
}) {
  const formatRecord = () => {
    if (!record) return '--'
    return `${record.wins}-${record.losses}`
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
        <div className="flex items-center gap-3">
          <Image
            src={team.logo}
            alt={team.name}
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            unoptimized
          />
          <div>
            <h3
              className="font-bold text-white"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Season Snapshot
            </h3>
            <p className="text-xs text-white/70">2025-26 Season</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div
            className="text-4xl font-bold"
            style={{ color: team.primaryColor }}
          >
            {formatRecord()}
          </div>
          <div className="text-sm text-[var(--text-muted)] mt-1">Record</div>
        </div>
      </div>
    </div>
  )
}

// Quick Links Card
function QuickLinksCard({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
      }}
    >
      <h3
        className="font-bold mb-4"
        style={{
          fontFamily: "'Montserrat', sans-serif",
          color: 'var(--text-primary)',
        }}
      >
        Quick Links
      </h3>
      <div className="space-y-2">
        <QuickLink href="/chicago-bulls" label="All Bulls News" team={team} />
      </div>
    </div>
  )
}

function QuickLink({
  href,
  label,
  team,
}: {
  href: string
  label: string
  team: typeof CHICAGO_TEAMS.bulls
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
    >
      <span
        className="text-sm font-medium"
        style={{ color: 'var(--text-primary)' }}
      >
        {label}
      </span>
      <svg
        className="w-4 h-4 ml-auto"
        style={{ color: 'var(--text-muted)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  )
}

// Scout AI Widget
function AskAIWidget({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
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
            Get instant answers about the Bulls
          </p>
        </div>
      </div>

      <Link
        href={`/scout-ai?team=${team.slug}`}
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Ask Scout
      </Link>
    </div>
  )
}

// Fan Chat Widget
function FanChatWidget({ team }: { team: typeof CHICAGO_TEAMS.bulls }) {
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
          <svg
            className="w-5 h-5"
            style={{ color: team.secondaryColor }}
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
            Bulls Fan Chat
          </h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Fans online</span>
          </div>
        </div>
      </div>

      <Link
        href="/fan-chat?channel=bulls"
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm transition-colors text-white"
        style={{ backgroundColor: team.primaryColor }}
      >
        Join Bulls Chat
      </Link>
    </div>
  )
}
