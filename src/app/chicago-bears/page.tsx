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
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '32px',
          maxWidth: '1320px',
          margin: '0 auto',
        }}
      >
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
          </div>

          {/* Right Column: Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <AskAIWidget teamSlug="chicago-bears" teamLabel="Bears" />

            {/* Fan Chat Widget */}
            <FanChatWidget teamLabel="Bears" channel="bears" />
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

// Section Header - 2030 Design
function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: '3px solid var(--sm-red)',
          margin: 0,
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="btn btn-sm btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          View All
        </Link>
      )}
    </div>
  )
}

// Article Card - 2030 Glass Card
function ArticleCard({ post, isLarge = false }: { post: any; isLarge?: boolean }) {
  const href = post.categorySlug
    ? `/${post.categorySlug}/${post.slug}`
    : `/bears/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
        <article className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <style>{`@media (min-width: 768px) { .article-hero-row { flex-direction: row !important; } .article-hero-img { width: 50% !important; aspectRatio: auto !important; } }`}</style>
            <div className="article-hero-row" style={{ display: 'flex', flexDirection: 'column' }}>
              {post.featuredImage && (
                <div className="article-hero-img" style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', width: '100%' }}>
                  <Image
                    src={post.featuredImage}
                    alt=""
                    fill
                    style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
                    priority
                  />
                </div>
              )}
              <div style={{ padding: '24px', flex: 1 }}>
                <span className="sm-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>
                  {post.category || 'Bears'}
                </span>
                <h3
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: 'var(--sm-text)',
                    fontSize: '20px',
                    fontWeight: 700,
                    lineHeight: 1.3,
                    margin: '0 0 12px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p
                    style={{
                      color: 'var(--sm-text-muted)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      margin: '0 0 12px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.excerpt}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
                  {post.author && <span style={{ fontWeight: 500 }}>{post.author.name}</span>}
                  <span>-</span>
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
      <article className="glass-card glass-card-sm" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {post.featuredImage && (
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--sm-radius-sm)', overflow: 'hidden' }}>
            <Image
              src={post.featuredImage}
              alt=""
              fill
              style={{ objectFit: 'cover', transition: 'transform 0.3s' }}
            />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '15px',
              fontWeight: 600,
              lineHeight: 1.4,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            {post.author && <span>{post.author.name}</span>}
            {post.author && <span>-</span>}
            <span>
              {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}

// Scout AI Widget - 2030
function AskAIWidget({ teamSlug, teamLabel }: { teamSlug: string; teamLabel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--sm-gradient-subtle)',
          }}
        >
          <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>
            Scout AI
          </h3>
          <p style={{ color: 'var(--sm-text-dim)', fontSize: '12px', margin: 0 }}>
            Get instant answers about the {teamLabel}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        <Link
          href={`/scout-ai?team=${teamSlug}&q=What%20is%20the%20${teamLabel}%20record%20this%20season`}
          style={{
            display: 'block',
            padding: '8px 12px',
            borderRadius: 'var(--sm-radius-sm)',
            fontSize: '14px',
            background: 'var(--sm-surface)',
            color: 'var(--sm-text-muted)',
            border: '1px solid var(--sm-border)',
            textDecoration: 'none',
            transition: 'border-color 0.2s',
          }}
        >
          &quot;What&apos;s the {teamLabel} record?&quot;
        </Link>
      </div>

      <Link
        href={`/scout-ai?team=${teamSlug}`}
        className="btn btn-md btn-primary"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--sm-radius-pill)',
        }}
      >
        Ask Scout
      </Link>
    </div>
  )
}

// Fan Chat Widget - 2030
function FanChatWidget({ teamLabel, channel }: { teamLabel: string; channel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--sm-gradient-subtle)',
          }}
        >
          <svg width="20" height="20" style={{ color: 'var(--sm-red-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>
            {teamLabel} Fan Chat
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sm-success)', display: 'inline-block' }} />
            <span>Fans online</span>
          </div>
        </div>
      </div>

      <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
        Join the conversation with fellow {teamLabel} fans.
      </p>

      <Link
        href={`/fan-chat?channel=${channel}`}
        className="btn btn-md btn-secondary"
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          textDecoration: 'none',
          borderRadius: 'var(--sm-radius-pill)',
        }}
      >
        Join {teamLabel} Chat
      </Link>
    </div>
  )
}
