'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string
  category: {
    name: string
    slug: string
  }
  author?: {
    name: string
  }
  views?: number
  readTime?: number
}

interface Game {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  status: 'pre' | 'live' | 'final'
  statusText: string
  time?: string
  venue?: string
}

interface HomepageData {
  heroPost: Post | null
  supportPosts: Post[]
  topHeadlines: Post[]
  tonightGames: Game[]
  featuredPosts: Post[]
  latestPosts: Post[]
  seasonalPosts: { team: string; posts: Post[] }[]
  evergreenPosts: Post[]
}

/**
 * HomepageV3 - Chicago Tonight Layout
 *
 * A modern, text-first homepage with:
 * - Above-the-fold info deck (no giant hero image)
 * - Primary story + 2 support cards
 * - Top 10 Headlines
 * - Tonight in Chicago (live scores)
 * - Featured Shell (6 slots)
 * - Latest Stream (15 items)
 * - Seasonal Focus
 * - Evergreen Classics
 */
export default function HomepageV3() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHomepageData()
  }, [])

  const fetchHomepageData = async () => {
    try {
      const res = await fetch('/api/homepage')
      const json = await res.json()

      // Transform API response to our format
      const heroPost = json.heroPost || json.latestPosts?.[0] || null
      const supportPosts = json.supportPosts || json.latestPosts?.slice(1, 3) || []
      const topHeadlines = json.topHeadlines || json.latestPosts?.slice(0, 10) || []
      const featuredPosts = json.featuredPosts || json.latestPosts?.slice(0, 6) || []
      const latestPosts = json.latestPosts || []
      const seasonalPosts = json.seasonalPosts || []
      const evergreenPosts = json.evergreenPosts || json.latestPosts?.slice(-4) || []

      // Mock tonight games (would come from /api/bears/ticker or similar)
      const tonightGames: Game[] = [
        {
          id: '1',
          homeTeam: 'BEARS',
          awayTeam: 'PACKERS',
          homeScore: 20,
          awayScore: 17,
          status: 'live',
          statusText: 'Live',
          time: '4th - 3:21',
        },
        {
          id: '2',
          homeTeam: 'BULLS',
          awayTeam: 'KNICKS',
          homeScore: null,
          awayScore: null,
          status: 'pre',
          statusText: 'Tip 9:00 PM',
        },
        {
          id: '3',
          homeTeam: 'CUBS',
          awayTeam: 'CARDINALS',
          homeScore: 7,
          awayScore: 3,
          status: 'final',
          statusText: 'Final',
        },
      ]

      setData({
        heroPost,
        supportPosts,
        topHeadlines,
        tonightGames,
        featuredPosts,
        latestPosts,
        seasonalPosts,
        evergreenPosts,
      })
    } catch (error) {
      console.error('Homepage data error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="sm-main">
        <div className="sm-container" style={{ padding: '60px 16px', textAlign: 'center' }}>
          <div className="sm-loading-spinner" />
          <p style={{ color: 'var(--text-subtle)', marginTop: 16 }}>Loading Chicago sports...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="sm-main">
      {/* SECTION 1: ABOVE-THE-FOLD INFO DECK */}
      <section id="hero-region" className="sm-section sm-hero-region">
        <div className="sm-container sm-container--deck">
          <header className="sm-section-header">
            <h2 className="sm-section-title">Chicago Tonight</h2>
            <p className="sm-section-subtitle">Scores, stories, and stress levels - all in one glance.</p>
          </header>

          <div className="sm-info-deck">
            {/* COLUMN 1: PRIMARY STORY */}
            <section className="sm-deck-col sm-deck-col--primary">
              {data?.heroPost && (
                <article className="sm-primary-card" data-slot="hero-main">
                  <div className="sm-primary-card-header">
                    <span className={`sm-tag sm-tag--${getTeamClass(data.heroPost.category.name)}`}>
                      {data.heroPost.category.name.toUpperCase()}
                    </span>
                    <span className="sm-primary-meta">
                      {data.heroPost.readTime || 5} min read
                    </span>
                  </div>
                  <Link href={`/${data.heroPost.category.slug}/${data.heroPost.slug}`}>
                    <h1 className="sm-primary-headline">{data.heroPost.title}</h1>
                  </Link>
                  {data.heroPost.excerpt && (
                    <p className="sm-primary-dek">{data.heroPost.excerpt}</p>
                  )}
                  <div className="sm-primary-footer">
                    <span className="sm-primary-author">
                      By {data.heroPost.author?.name || 'Sports Mockery Staff'}
                    </span>
                    <span className="sm-primary-time">
                      Updated {formatDistanceToNow(new Date(data.heroPost.published_at), { addSuffix: true })}
                    </span>
                  </div>

                  {data.heroPost.featured_image && (
                    <div className="sm-primary-media">
                      <div className="sm-primary-thumb">
                        <Image
                          src={data.heroPost.featured_image}
                          alt=""
                          fill
                          className="sm-primary-thumb-img"
                        />
                      </div>
                      <Link href={`/${data.heroPost.category.slug}/${data.heroPost.slug}`} className="sm-chip sm-chip--ghost">
                        Read full story
                      </Link>
                    </div>
                  )}
                </article>
              )}

              {/* TWO SUPPORTING MICRO-CARDS */}
              <div className="sm-support-row">
                {data?.supportPosts.slice(0, 2).map((post, index) => (
                  <article key={post.id} className={`sm-support-card sm-support-card--${getTeamClass(post.category.name)}`}>
                    <header className="sm-support-header">
                      <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
                        {post.category.name.toUpperCase()}
                      </span>
                      <span className="sm-support-meta">{post.readTime || 3} min read</span>
                    </header>
                    <Link href={`/${post.category.slug}/${post.slug}`}>
                      <h3 className="sm-support-title">{post.title}</h3>
                    </Link>
                  </article>
                ))}
              </div>
            </section>

            {/* COLUMN 2: TOP HEADLINES BOX */}
            <section id="top-headlines" className="sm-deck-col sm-deck-col--headlines sm-top-headlines">
              <header className="sm-section-header sm-section-header--compact">
                <h2 className="sm-section-title">Top Headlines</h2>
                <p className="sm-section-subtitle">Not just the newest - the most Chicago.</p>
              </header>

              <div className="sm-headlines-box">
                <ol className="sm-headlines-list">
                  {data?.topHeadlines.slice(0, 10).map((post, index) => (
                    <li
                      key={post.id}
                      className="sm-headline-row"
                      data-source={getHeadlineSource(index)}
                    >
                      <span className={`sm-headline-tag sm-headline-tag-${getTeamTagClass(post.category.name)}`}>
                        {getCategoryAbbrev(post.category.name)}
                      </span>
                      <Link className="sm-headline-link" href={`/${post.category.slug}/${post.slug}`}>
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* COLUMN 3: TONIGHT IN CHICAGO */}
            <section className="sm-deck-col sm-deck-col--tonight">
              <header className="sm-section-header sm-section-header--compact">
                <h2 className="sm-section-title">Tonight in Chicago</h2>
                <p className="sm-section-subtitle">What's on, who's playing, and how nervous to be.</p>
              </header>

              <ul className="sm-tonight-list">
                {data?.tonightGames.map((game) => (
                  <li key={game.id} className={`sm-tonight-item sm-tonight-item--${game.homeTeam.toLowerCase()}`}>
                    <div className="sm-tonight-main">
                      <span className="sm-tonight-team sm-tonight-team--home">{game.homeTeam}</span>
                      <span className="sm-tonight-vs">{game.status === 'pre' ? 'vs' : '@'}</span>
                      <span className="sm-tonight-team">{game.awayTeam}</span>
                    </div>
                    <div className="sm-tonight-status">
                      <span className={`sm-status-pill ${game.status === 'live' ? 'sm-status-pill--live' : ''}`}>
                        {game.statusText}{game.time ? ` - ${game.time}` : ''}
                      </span>
                      <span className={`sm-tonight-score ${game.homeScore === null ? 'sm-tonight-score--placeholder' : ''}`}>
                        {game.homeScore ?? 0} - {game.awayScore ?? 0}
                      </span>
                    </div>
                    <p className="sm-tonight-take">{getGameTake(game)}</p>
                  </li>
                ))}
              </ul>

              <div className="sm-tonight-footer">
                <div className="sm-today-count">
                  <span className="sm-dot-indicator"></span>
                  <span className="sm-today-label">{data?.latestPosts.length || 0} new posts across Chicago today</span>
                </div>
                <Link href="/chicago-bears/schedule" className="sm-chip sm-chip--ghost">See full schedule</Link>
              </div>
            </section>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURED SHELL / CHICAGO FRONT PAGE */}
      <section id="featured-shell" className="sm-section sm-featured-shell">
        <div className="sm-container">
          <header className="sm-section-header">
            <h2 className="sm-section-title">Chicago Front Page</h2>
            <p className="sm-section-subtitle">The stories that still matter after the final whistle.</p>
          </header>

          <div className="sm-featured-grid">
            {data?.featuredPosts.slice(0, 6).map((post, index) => (
              <article key={post.id} className={`sm-featured-slot sm-featured-slot-${index + 1}`} data-slot={`FEATURE_${index + 1}`}>
                <FeaturedCard post={post} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: LATEST STREAM */}
      <section id="latest-stream" className="sm-section sm-latest-stream">
        <div className="sm-container">
          <header className="sm-section-header">
            <h2 className="sm-section-title">Latest From Chicago</h2>
            <p className="sm-section-subtitle">Every new post, in order. No favorites played.</p>
          </header>

          <div className="sm-latest-list" data-max-items="15">
            {data?.latestPosts.slice(0, 15).map((post) => (
              <LatestCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SEASONAL FOCUS BAND */}
      <section id="seasonal-focus" className="sm-section sm-seasonal-focus">
        <div className="sm-container">
          <header className="sm-section-header">
            <h2 className="sm-section-title">In Season Right Now</h2>
            <p className="sm-section-subtitle">Who's playing for your attention this month.</p>
          </header>

          <div className="sm-seasonal-grid">
            {getActiveSeasons().map((team) => {
              const teamPosts = data?.latestPosts.filter(p =>
                p.category.slug.includes(team.slug)
              ).slice(0, 3) || []

              if (teamPosts.length === 0) return null

              return (
                <div key={team.slug} className="sm-seasonal-team">
                  <h3 className="sm-seasonal-team-name">{team.name}</h3>
                  <div className="sm-seasonal-posts">
                    {teamPosts.map((post, idx) => (
                      <Link
                        key={post.id}
                        href={`/${post.category.slug}/${post.slug}`}
                        className={`sm-seasonal-link ${idx === 0 ? 'sm-seasonal-link--main' : ''}`}
                      >
                        {post.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 5: EVERGREEN SAFETY NET */}
      <section id="evergreen-safety-net" className="sm-section sm-evergreen">
        <div className="sm-container">
          <header className="sm-section-header">
            <h2 className="sm-section-title">Chicago Classics</h2>
            <p className="sm-section-subtitle">Pieces that still hit, no matter the score.</p>
          </header>

          <div className="sm-evergreen-grid">
            {data?.evergreenPosts.slice(0, 4).map((post) => (
              <EvergreenCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

// Featured Card Component
function FeaturedCard({ post }: { post: Post }) {
  return (
    <Link href={`/${post.category.slug}/${post.slug}`} className="sm-featured-card">
      {post.featured_image && (
        <div className="sm-featured-image">
          <Image
            src={post.featured_image}
            alt=""
            fill
            className="sm-featured-img"
          />
        </div>
      )}
      <div className="sm-featured-content">
        <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
          {post.category.name.toUpperCase()}
        </span>
        <h3 className="sm-featured-title">{post.title}</h3>
        <p className="sm-featured-meta">
          {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
        </p>
      </div>
    </Link>
  )
}

// Latest Card Component
function LatestCard({ post }: { post: Post }) {
  return (
    <article className="sm-latest-card">
      <div className="sm-latest-content">
        <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
          {post.category.name.toUpperCase()}
        </span>
        <Link href={`/${post.category.slug}/${post.slug}`}>
          <h3 className="sm-latest-title">{post.title}</h3>
        </Link>
        <p className="sm-latest-meta">
          {post.author?.name || 'Staff'} - {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
        </p>
      </div>
      {post.featured_image && (
        <div className="sm-latest-thumb">
          <Image
            src={post.featured_image}
            alt=""
            fill
            className="sm-latest-img"
          />
        </div>
      )}
    </article>
  )
}

// Evergreen Card Component
function EvergreenCard({ post }: { post: Post }) {
  return (
    <Link href={`/${post.category.slug}/${post.slug}`} className="sm-evergreen-card">
      <span className={`sm-tag sm-tag--${getTeamClass(post.category.name)}`}>
        {post.category.name.toUpperCase()}
      </span>
      <h3 className="sm-evergreen-title">{post.title}</h3>
      {post.excerpt && <p className="sm-evergreen-excerpt">{post.excerpt}</p>}
    </Link>
  )
}

// Helper Functions
function getTeamClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'bears'
  if (name.includes('bulls')) return 'bulls'
  if (name.includes('cubs')) return 'cubs'
  if (name.includes('white sox') || name.includes('sox')) return 'whitesox'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'blackhawks'
  return 'citywide'
}

function getTeamTagClass(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'BEARS'
  if (name.includes('bulls')) return 'BULLS'
  if (name.includes('cubs')) return 'CUBS'
  if (name.includes('white sox') || name.includes('sox')) return 'WHITE-SOX'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'BLACKHAWKS'
  return 'CITYWIDE'
}

function getCategoryAbbrev(categoryName: string): string {
  const name = categoryName.toLowerCase()
  if (name.includes('bears')) return 'BEARS'
  if (name.includes('bulls')) return 'BULLS'
  if (name.includes('cubs')) return 'CUBS'
  if (name.includes('white sox') || name.includes('sox')) return 'SOX'
  if (name.includes('blackhawks') || name.includes('hawks')) return 'HAWKS'
  return 'CHI'
}

function getHeadlineSource(index: number): string {
  if (index < 3) return 'LATEST_GLOBAL'
  if (index < 6) return 'EDITOR_PICK'
  if (index < 8) return 'SEASON_ACTIVE'
  if (index === 8) return 'EVERGREEN_TOP'
  return 'PERSONALIZED_OR_BALANCE'
}

function getGameTake(game: Game): string {
  const takes: Record<string, string[]> = {
    live: [
      "If they win this, I'm forgiving the last fifteen years until at least Tuesday.",
      "Every play feels like it's shaving years off my life.",
      "This is either the start of something or the end of my sanity.",
    ],
    pre: [
      "Over/under on 'this team again?' texts by halftime: 7.5.",
      "Hope springs eternal. So does heartbreak, but let's not think about that.",
      "Time to pretend I'm not nervous until tipoff.",
    ],
    final: [
      "Wind blowing out, vibes blowing up. A classic Chicago night.",
      "Another one in the books. Chicago sports never disappoint at disappointing.",
      "That's a wrap. Time to overanalyze everything for the next 48 hours.",
    ],
  }
  const gameTakes = takes[game.status] || takes.final
  return gameTakes[Math.floor(Math.random() * gameTakes.length)]
}

function getActiveSeasons(): { name: string; slug: string }[] {
  const month = new Date().getMonth() + 1 // 1-12

  const teams: { name: string; slug: string; months: number[] }[] = [
    { name: 'Bears', slug: 'chicago-bears', months: [1, 2, 9, 10, 11, 12] },
    { name: 'Bulls', slug: 'chicago-bulls', months: [1, 2, 3, 4, 5, 6, 10, 11, 12] },
    { name: 'Blackhawks', slug: 'chicago-blackhawks', months: [1, 2, 3, 4, 5, 6, 10, 11, 12] },
    { name: 'Cubs', slug: 'chicago-cubs', months: [4, 5, 6, 7, 8, 9, 10] },
    { name: 'White Sox', slug: 'chicago-white-sox', months: [4, 5, 6, 7, 8, 9, 10] },
  ]

  return teams.filter(t => t.months.includes(month)).slice(0, 3)
}
