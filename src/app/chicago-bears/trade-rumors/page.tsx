import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBearsSeparatedRecord } from '@/lib/bearsData'
import { getBearsPosts, getBearsPostsByType } from '@/lib/bears'
import { HubUpdatesFeed, RumorTicker } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago Bears Trade Rumors (Live) | Sports Mockery',
  description:
    'Live Bears trade tracker, rumor mill, cap analysis. Ryan Poles rumors hourly.',
  openGraph: {
    title: 'Chicago Bears Trade Rumors (Live)',
    description:
      'Live Bears trade tracker, rumor mill, cap analysis. Ryan Poles rumors hourly.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Bears Trade Rumors (Live)',
    description:
      'Live Bears trade tracker, rumor mill, cap analysis. Ryan Poles rumors hourly.',
  },
}

export const revalidate = 1800 // 30 min for fresh rumor content

export default async function BearsTradeRumorsPage() {
  const team = CHICAGO_TEAMS.bears

  const [separatedRecord, nextGame, rumorPosts, allPosts] = await Promise.all([
    getBearsSeparatedRecord(2025),
    fetchNextGame('bears'),
    getBearsPostsByType('rumor', 10),
    getBearsPosts(20),
  ])

  const record = {
    wins: separatedRecord.regularSeason.wins,
    losses: separatedRecord.regularSeason.losses,
    ties: separatedRecord.regularSeason.ties > 0 ? separatedRecord.regularSeason.ties : undefined,
    postseason:
      separatedRecord.postseason.wins > 0 || separatedRecord.postseason.losses > 0
        ? separatedRecord.postseason
        : undefined,
    divisionRank: separatedRecord.divisionRank || undefined,
  }

  // Use rumor posts if available, otherwise show all Bears posts
  const displayPosts = rumorPosts.length > 0 ? rumorPosts : allPosts.slice(0, 10)

  const transformedPosts = displayPosts.map((post) => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    featuredImage: post.featuredImage,
    category: 'Trade Rumors',
    categorySlug: post.categorySlug,
    author: {
      name: post.author?.displayName || 'Staff',
      avatar: post.author?.avatarUrl,
    },
    publishedAt: post.publishedAt,
  }))

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="trade-rumors">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: 'var(--sm-gradient-subtle)',
                color: 'var(--sm-red-light)',
                border: '1px solid rgba(188,0,0,0.2)',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--sm-red-light)',
                  animation: 'pulse 2s infinite',
                }}
              />
              Live Updates
            </span>
          </div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--sm-text)',
              letterSpacing: '-1px',
              margin: '0 0 8px 0',
            }}
          >
            Bears Trade Rumors
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Live Chicago Bears trade tracker, rumor mill, cap analysis. Ryan Poles rumors updated hourly.
          </p>
        </div>

        {/* Quick Links */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'Cap Tracker', href: '/chicago-bears/cap-tracker' },
            { label: 'Draft Tracker', href: '/chicago-bears/draft-tracker' },
            { label: 'Depth Chart', href: '/chicago-bears/depth-chart' },
            { label: 'Full Roster', href: '/chicago-bears/roster' },
          ].map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="team-pill"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Rumor Ticker */}
        <RumorTicker teamSlug="chicago-bears" />

        {/* Hub Updates Feed */}
        <HubUpdatesFeed hubSlug="trade-rumors" title="Live Updates" emptyState="No trade updates yet. Check back soon." />

        {/* Rumors Feed */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}
          >
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
              Latest Trade & Rumor Stories
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {transformedPosts.map((post, index) => {
              const href = post.categorySlug
                ? `/${post.categorySlug}/${post.slug}`
                : `/bears/${post.slug}`

              return (
                <Link key={post.id} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                  <article
                    className="glass-card glass-card-sm"
                    style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}
                  >
                    {post.featuredImage && (
                      <div
                        style={{
                          position: 'relative',
                          width: index === 0 ? '120px' : '80px',
                          height: index === 0 ? '120px' : '80px',
                          flexShrink: 0,
                          borderRadius: 'var(--sm-radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span className="sm-tag" style={{ fontSize: '10px', padding: '3px 8px' }}>
                          {post.category}
                        </span>
                        <span className={`rumor-badge ${index === 0 ? 'rumor-badge-hot' : index < 3 ? 'rumor-badge-rumored' : 'rumor-badge-cold'}`}>
                          {index === 0 ? 'HOT' : index < 3 ? 'RUMORED' : 'COLD'}
                        </span>
                      </div>
                      <h3
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          color: 'var(--sm-text)',
                          fontSize: index === 0 ? '18px' : '15px',
                          fontWeight: 600,
                          lineHeight: 1.4,
                          margin: '0 0 4px 0',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.title}
                      </h3>
                      {index === 0 && post.excerpt && (
                        <p
                          style={{
                            color: 'var(--sm-text-muted)',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            margin: '0 0 6px 0',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {post.excerpt}
                        </p>
                      )}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '12px',
                          color: 'var(--sm-text-dim)',
                        }}
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
            })}
          </div>

          {transformedPosts.length === 0 && (
            <div
              className="glass-card glass-card-static"
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px' }}>
                No trade rumors right now. Check back soon for the latest Bears trade news.
              </p>
            </div>
          )}
        </section>

        {/* Ask Scout CTA */}
        <div
          className="glass-card glass-card-static"
          style={{ marginTop: '32px', textAlign: 'center', padding: '32px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} />
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: 'var(--sm-text)',
                fontWeight: 700,
                fontSize: '18px',
                margin: 0,
              }}
            >
              Ask Scout About Trade Rumors
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get instant AI-powered answers about Bears trades, free agency targets, and cap implications.
          </p>
          <Link
            href="/scout-ai?team=chicago-bears&q=What%20are%20the%20latest%20Bears%20trade%20rumors"
            className="btn btn-md btn-primary"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              borderRadius: 'var(--sm-radius-pill)',
            }}
          >
            Ask Scout
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
