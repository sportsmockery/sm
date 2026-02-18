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
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Hero header */}
      <header
        className="relative py-12 md:py-16"
        style={{
          background: `linear-gradient(135deg, ${bearsInfo.primaryColor} 0%, #1a2940 100%)`,
        }}
      >
        <div className="max-w-[1110px] mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Team logo */}
            <div
              className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white font-black text-3xl md:text-4xl shadow-lg"
              style={{ backgroundColor: bearsInfo.secondaryColor }}
            >
              B
            </div>

            {/* Team name and tagline */}
            <div>
              <h1
                className="text-white text-3xl md:text-5xl font-black uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Chicago Bears
              </h1>
              <p className="text-white/70 text-sm md:text-base mt-1">
                Your #1 Source for Bears News, Stats & Analysis
              </p>
            </div>
          </div>

          {/* Quick nav */}
          <nav className="mt-8 flex flex-wrap gap-3">
            {storylines.map((link) => (
              <Link
                key={link.slug}
                href={link.slug}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-[1110px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Season overview */}
            <BearsSeasonCard season={seasonOverview} />

            {/* Latest articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-[18px] font-bold uppercase pb-2"
                  style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)', borderBottom: '3px solid #bc0000' }}
                >
                  Latest Bears News
                </h2>
                <Link
                  href="/chicago-bears"
                  className="text-sm hover:underline"
                  style={{ color: '#bc0000' }}
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(0, 6).map((post, index) => (
                  <article
                    key={post.id}
                    className={`group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                      index === 0 ? 'md:col-span-2' : ''
                    }`}
                    style={{ backgroundColor: 'var(--sm-card)' }}
                  >
                    <Link
                      href={`/${post.categorySlug}/${post.slug}`}
                      className="flex flex-col md:flex-row"
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
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={index < 2}
                        />
                        <div
                          className="absolute top-0 left-0 w-1 h-full"
                          style={{ backgroundColor: bearsInfo.secondaryColor }}
                        />
                      </div>

                      {/* Content */}
                      <div className={`p-4 ${index === 0 ? 'md:w-1/2 md:p-6' : ''}`}>
                        <span
                          className="inline-block text-[10px] font-bold uppercase tracking-wide mb-2"
                          style={{ color: bearsInfo.secondaryColor }}
                        >
                          Bears
                        </span>
                        <h3
                          className={`font-bold leading-tight transition-colors ${
                            index === 0 ? 'text-[18px] md:text-[22px] line-clamp-3' : 'text-[15px] line-clamp-2'
                          }`}
                          style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}
                        >
                          {post.title}
                        </h3>
                        {index === 0 && post.excerpt && (
                          <p className="text-sm mt-3 line-clamp-2" style={{ color: 'var(--sm-text-muted)' }}>
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3 text-[11px]" style={{ color: 'var(--sm-text-dim)' }}>
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
