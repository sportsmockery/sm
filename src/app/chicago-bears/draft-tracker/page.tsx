import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBearsSeparatedRecord } from '@/lib/bearsData'
import { getBearsPosts } from '@/lib/bears'

export const metadata: Metadata = {
  title: 'Chicago Bears Draft Tracker & Mock Drafts 2026 | Sports Mockery',
  description:
    'Chicago Bears 2026 NFL Draft tracker: mock drafts, prospect rankings, trade scenarios, big board. Build your Bears mock draft.',
  openGraph: {
    title: 'Chicago Bears Draft Tracker & Mock Drafts 2026',
    description:
      'Build your Bears mock draft. Latest 2026 draft news, prospect rankings, trade scenarios.',
    type: 'website',
  },
  twitter: {
    title: 'Bears 2026 Mock Draft Simulator',
    description:
      'Create your Chicago Bears mock draft. Latest draft news and prospect rankings.',
  },
}

export const revalidate = 3600

export default async function BearsDraftTrackerPage() {
  const team = CHICAGO_TEAMS.bears

  const [separatedRecord, nextGame, posts] = await Promise.all([
    getBearsSeparatedRecord(2025),
    fetchNextGame('bears'),
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

  // Filter draft-related posts
  const draftKeywords = ['draft', 'prospect', 'mock', 'pick', 'combine', 'scouting']
  const draftPosts = posts
    .filter((p) => draftKeywords.some((kw) => p.title.toLowerCase().includes(kw)))
    .slice(0, 8)
  const displayPosts = draftPosts.length > 0 ? draftPosts : posts.slice(0, 6)

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="draft-tracker">
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
              2026 NFL Draft
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
            Bears Draft Tracker
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Bears 2026 draft prospects, mock drafts, trade scenarios. Build your own mock draft.
          </p>
        </div>

        {/* Mock Draft CTA */}
        <div
          className="glass-card glass-card-static"
          style={{
            marginBottom: '32px',
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(11,22,42,0.4), rgba(200,56,3,0.1))',
            borderColor: 'rgba(200,56,3,0.2)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  color: 'var(--sm-text)',
                  fontSize: '20px',
                  fontWeight: 700,
                  margin: '0 0 6px 0',
                }}
              >
                Build Your Bears Mock Draft
              </h2>
              <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: 0 }}>
                Use our interactive mock draft tool to build your ideal Bears draft board.
              </p>
            </div>
            <Link
              href="/mock-draft"
              className="btn btn-md btn-primary"
              style={{
                textDecoration: 'none',
                borderRadius: 'var(--sm-radius-pill)',
                flexShrink: 0,
              }}
            >
              Launch Mock Draft
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" style={{ marginLeft: '6px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {[
            { label: 'Trade Rumors', href: '/chicago-bears/trade-rumors' },
            { label: 'Cap Tracker', href: '/chicago-bears/cap-tracker' },
            { label: 'Depth Chart', href: '/chicago-bears/depth-chart' },
            { label: 'Full Roster', href: '/chicago-bears/roster' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="team-pill">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Draft Needs */}
        <section style={{ marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              paddingBottom: '8px',
              borderBottom: '3px solid var(--sm-red)',
              margin: '0 0 20px 0',
            }}
          >
            2026 Draft Needs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { position: 'OL', priority: 'High', note: 'Protect Caleb' },
              { position: 'EDGE', priority: 'High', note: 'Pass rush depth' },
              { position: 'CB', priority: 'Medium', note: 'Secondary help' },
              { position: 'WR', priority: 'Medium', note: 'Another weapon' },
              { position: 'LB', priority: 'Medium', note: 'Run defense' },
              { position: 'S', priority: 'Low', note: 'Depth piece' },
            ].map((need) => (
              <div
                key={need.position}
                className="glass-card glass-card-sm glass-card-static"
                style={{ padding: '14px 16px', textAlign: 'center' }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--sm-text)',
                    marginBottom: '4px',
                  }}
                >
                  {need.position}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color:
                      need.priority === 'High'
                        ? 'var(--sm-red-light)'
                        : need.priority === 'Medium'
                          ? 'var(--sm-warning, #f59e0b)'
                          : 'var(--sm-text-dim)',
                    marginBottom: '2px',
                  }}
                >
                  {need.priority} Priority
                </div>
                <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)' }}>{need.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Draft News */}
        <section>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: 'var(--sm-text)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.5px',
              paddingBottom: '8px',
              borderBottom: '3px solid var(--sm-red)',
              margin: '0 0 20px 0',
            }}
          >
            Latest Draft News
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayPosts.map((post) => {
              const href = post.categorySlug ? `/${post.categorySlug}/${post.slug}` : `/bears/${post.slug}`
              return (
                <Link key={post.id} href={href} style={{ textDecoration: 'none', display: 'block' }}>
                  <article className="glass-card glass-card-sm" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
                    {post.featuredImage && (
                      <div
                        style={{
                          position: 'relative',
                          width: '80px',
                          height: '80px',
                          flexShrink: 0,
                          borderRadius: 'var(--sm-radius-sm)',
                          overflow: 'hidden',
                        }}
                      >
                        <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover' }} />
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
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '8px',
                          fontSize: '12px',
                          color: 'var(--sm-text-dim)',
                        }}
                      >
                        <span>{post.author?.displayName || 'Staff'}</span>
                        <span>-</span>
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
              Ask Scout About the Draft
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get AI-powered draft analysis, prospect comparisons, and trade value insights.
          </p>
          <Link
            href="/scout-ai?team=chicago-bears&q=What%20should%20the%20Bears%20do%20in%20the%202026%20draft"
            className="btn btn-md btn-primary"
            style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 'var(--sm-radius-pill)' }}
          >
            Ask Scout
          </Link>
        </div>
      </div>
    </TeamHubLayout>
  )
}
