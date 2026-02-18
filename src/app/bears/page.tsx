import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TEAM_INFO } from '@/lib/types'
import {
  getBearsSeasonOverview,
  getBearsKeyPlayers,
  getBearsTrends,
  getBearsPosts,
  getBearsStorylineLinks,
} from '@/lib/bears'
import {
  BearsSeasonCard,
  BearsRosterHighlights,
  BearsTrendingTopics,
  AskBearsAI,
} from '@/components/bears'
import ARTourButton from '@/components/ar/ARTourButton'

export const metadata: Metadata = {
  title: 'Chicago Bears Hub | News, Stats & Analysis',
  description: 'Your complete Chicago Bears destination. Get the latest Bears news, season stats, roster updates, trade rumors, and expert analysis.',
  openGraph: {
    title: 'Chicago Bears Hub | Sports Mockery',
    description: 'Complete Bears coverage - news, stats, roster, and analysis',
    type: 'website',
  },
}

export default async function BearsHubPage() {
  const bearsInfo = TEAM_INFO.bears

  // Fetch all Bears data
  const [seasonOverview, keyPlayers, trends, posts, storylines] = await Promise.all([
    getBearsSeasonOverview(),
    getBearsKeyPlayers(),
    getBearsTrends(),
    getBearsPosts(10),
    Promise.resolve(getBearsStorylineLinks()),
  ])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      {/* Hero header */}
      <header
        className="sm-hero-bg"
        style={{
          position: 'relative',
          padding: '48px 0 64px',
          background: `linear-gradient(135deg, ${bearsInfo.primaryColor} 0%, #1a2940 100%)`,
        }}
      >
        <div className="sm-grid-overlay" />
        <div style={{ position: 'relative', maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Team logo */}
            <div
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 900,
                fontSize: 'var(--text-3xl)',
                backgroundColor: bearsInfo.secondaryColor,
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              B
            </div>

            {/* Team name and tagline */}
            <div>
              <h1 style={{
                color: '#fff',
                fontSize: 'clamp(1.875rem, 4vw, 3rem)',
                fontWeight: 900,
                textTransform: 'uppercase',
                fontFamily: 'var(--sm-font-heading)',
              }}>
                Chicago Bears
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                Your #1 Source for Bears News, Stats & Analysis
              </p>
            </div>
          </div>

          {/* Quick nav */}
          <nav style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {storylines.map((link) => (
              <Link
                key={link.slug}
                href={link.slug}
                className="sm-tag"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none' }}
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '32px 16px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Season overview */}
            <BearsSeasonCard season={seasonOverview} />

            {/* Latest articles */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  paddingBottom: '8px',
                  fontFamily: 'var(--sm-font-heading)',
                  color: 'var(--sm-text)',
                  borderBottom: '3px solid var(--accent-red)',
                }}>
                  Latest Bears News
                </h2>
                <Link
                  href="/chicago-bears"
                  style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-red)', textDecoration: 'none' }}
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(0, 6).map((post, index) => (
                  <article
                    key={post.id}
                    className={`glass-card ${index === 0 ? 'md:col-span-2' : ''}`}
                    style={{ overflow: 'hidden' }}
                  >
                    <Link
                      href={`/${post.categorySlug}/${post.slug}`}
                      className="flex flex-col md:flex-row"
                      style={{ textDecoration: 'none' }}
                    >
                      {/* Image */}
                      <div
                        className={`relative overflow-hidden ${
                          index === 0 ? 'aspect-[16/9] md:aspect-auto md:w-1/2' : 'aspect-[16/10]'
                        }`}
                      >
                        <Image
                          src={post.featuredImage || '/placeholder.jpg'}
                          alt=""
                          fill
                          className="object-cover"
                          priority={index < 2}
                        />
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '3px',
                          height: '100%',
                          backgroundColor: bearsInfo.secondaryColor,
                        }} />
                      </div>

                      {/* Content */}
                      <div style={{ padding: index === 0 ? '24px' : '16px', flex: index === 0 ? undefined : undefined }} className={index === 0 ? 'md:w-1/2' : ''}>
                        <span style={{
                          display: 'inline-block',
                          fontSize: 'var(--text-xs)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          marginBottom: '8px',
                          color: bearsInfo.secondaryColor,
                        }}>
                          Bears
                        </span>
                        <h3 style={{
                          fontWeight: 700,
                          lineHeight: 1.3,
                          fontSize: index === 0 ? 'clamp(1.125rem, 2vw, 1.375rem)' : 'var(--text-base)',
                          fontFamily: 'var(--sm-font-heading)',
                          color: 'var(--sm-text)',
                        }}>
                          {post.title}
                        </h3>
                        {index === 0 && post.excerpt && (
                          <p className="line-clamp-2" style={{ fontSize: 'var(--text-sm)', marginTop: '12px', color: 'var(--sm-text-muted)' }}>
                            {post.excerpt}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: 'var(--text-xs)', color: 'var(--sm-text-dim)' }}>
                          <span>{post.author.displayName}</span>
                          <span>&bull;</span>
                          <span>
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Key players */}
            <BearsRosterHighlights players={keyPlayers} />

            {/* AR Stadium Tour */}
            <ARTourButton team="chicago-bears" />

            {/* Trending topics */}
            <BearsTrendingTopics trends={trends} />

            {/* Ask Bears AI */}
            <AskBearsAI />
          </div>
        </div>
      </main>
    </div>
  )
}
