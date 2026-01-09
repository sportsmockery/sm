'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useOracleFeed } from '@/hooks/useOracleFeed'

// Team configuration
const teams = [
  { name: 'Bears', slug: 'chicago-bears', color: '#C83200', bgColor: '#0B162A', sport: 'NFL' },
  { name: 'Bulls', slug: 'chicago-bulls', color: '#ffffff', bgColor: '#CE1141', sport: 'NBA' },
  { name: 'Blackhawks', slug: 'chicago-blackhawks', color: '#FFD100', bgColor: '#CF0A2C', sport: 'NHL' },
  { name: 'Cubs', slug: 'chicago-cubs', color: '#CC3433', bgColor: '#0E3386', sport: 'MLB' },
  { name: 'White Sox', slug: 'chicago-white-sox', color: '#C4CED4', bgColor: '#27251F', sport: 'MLB' },
]

// Team badge colors
const teamColors: Record<string, { bg: string; text: string }> = {
  bears: { bg: '#0B162A', text: '#C83200' },
  bulls: { bg: '#CE1141', text: '#ffffff' },
  blackhawks: { bg: '#CF0A2C', text: '#ffffff' },
  cubs: { bg: '#0E3386', text: '#ffffff' },
  whitesox: { bg: '#27251F', text: '#C4CED4' },
}

// Mock live scores - replace with real API
const liveScores = [
  { id: 1, status: 'LIVE', home: 'Bears', away: 'Packers', homeScore: 24, awayScore: 17, quarter: '4th', time: '2:34' },
  { id: 2, status: 'FINAL', home: 'Bulls', away: 'Heat', homeScore: 112, awayScore: 108 },
  { id: 3, status: '7:30 PM', home: 'Blackhawks', away: 'Blues', homeScore: null, awayScore: null },
  { id: 4, status: 'FINAL', home: 'Cubs', away: 'Cardinals', homeScore: 5, awayScore: 3 },
]

// Format team name for display
const formatTeamName = (team: string) => {
  if (team === 'whitesox') return 'White Sox'
  return team.charAt(0).toUpperCase() + team.slice(1)
}

// Loading skeleton for articles
function ArticleSkeleton({ large = false }: { large?: boolean }) {
  return (
    <div className={`bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] overflow-hidden animate-pulse ${large ? 'md:col-span-2 lg:col-span-2' : ''}`}>
      <div className={`bg-gray-200 dark:bg-[#27272a] ${large ? 'aspect-[2/1]' : 'aspect-video'}`} />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-[#27272a] rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-[#27272a] rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-[#27272a] rounded w-1/4" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const { feed, loading, error, trackView, isUnseen, refresh } = useOracleFeed({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  })

  const [heroIndex, setHeroIndex] = useState(0)

  // Rotate featured article every 8 seconds
  useEffect(() => {
    if (!feed?.topHeadlines?.length) return

    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % Math.min(feed.topHeadlines.length, 3))
    }, 8000)

    return () => clearInterval(interval)
  }, [feed?.topHeadlines?.length])

  // Get current featured article (rotating)
  const featuredArticle = feed?.featured || (feed?.topHeadlines?.[heroIndex])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0b] transition-colors duration-300">

      {/* ========== SCORES BAR ========== */}
      <div className="bg-white dark:bg-[#111113] border-b border-gray-200 dark:border-[#27272a]">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center h-12 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 px-2">
              {liveScores.map((game) => (
                <div
                  key={game.id}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1c1c1f] cursor-pointer transition-colors min-w-fit"
                >
                  <div className="flex items-center gap-1.5">
                    {game.status === 'LIVE' && (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-red-500">LIVE</span>
                      </>
                    )}
                    {game.status === 'FINAL' && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">FINAL</span>
                    )}
                    {game.status !== 'LIVE' && game.status !== 'FINAL' && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{game.status}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{game.away}</span>
                    {game.awayScore !== null && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{game.awayScore}</span>
                    )}
                    <span className="text-xs text-gray-400">@</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{game.home}</span>
                    {game.homeScore !== null && (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{game.homeScore}</span>
                    )}
                  </div>
                  {game.quarter && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {game.quarter} {game.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="ml-auto pr-4 flex items-center gap-3 border-l border-gray-200 dark:border-[#27272a] pl-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* ========== MAIN CONTENT ========== */}
      <main className="max-w-[1400px] mx-auto px-4 py-6">

        {/* ========== HERO SECTION ========== */}
        <section className="mb-8">
          <div className="grid lg:grid-cols-5 gap-4">

            {/* Featured Article - Rotating */}
            {loading ? (
              <div className="lg:col-span-3 bg-gray-200 dark:bg-[#27272a] rounded-2xl aspect-[16/9] animate-pulse" />
            ) : featuredArticle ? (
              <article className="lg:col-span-3 relative group">
                <Link
                  href={`/${featuredArticle.team}/${featuredArticle.slug}`}
                  onClick={() => trackView(featuredArticle)}
                  className="block"
                >
                  <div className="relative aspect-[16/10] lg:aspect-[16/9] rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                    <Image
                      src={featuredArticle.featured_image || '/placeholder.jpg'}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      priority
                    />

                    {/* Unseen badge */}
                    {isUnseen(featuredArticle.id) && (
                      <span className="absolute top-4 right-4 z-20 px-2 py-1 bg-[#bc0000] text-white text-xs font-bold rounded">
                        NEW
                      </span>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                      <span
                        className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide mb-3"
                        style={{
                          backgroundColor: teamColors[featuredArticle.team]?.bg || '#27272a',
                          color: teamColors[featuredArticle.team]?.text || '#ffffff',
                        }}
                      >
                        {formatTeamName(featuredArticle.team)}
                      </span>
                      <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-3 group-hover:text-[#bc0000] transition-colors">
                        {featuredArticle.title}
                      </h1>
                      <div className="flex items-center gap-3 text-sm text-gray-300">
                        <span className="font-medium">{featuredArticle.sm_authors?.name || 'Staff'}</span>
                        <span>•</span>
                        <span>{new Date(featuredArticle.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Hero rotation indicators */}
                {feed?.topHeadlines && feed.topHeadlines.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-30 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${heroIndex === i ? 'bg-white' : 'bg-white/40'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </article>
            ) : null}

            {/* Top Headlines - ESPN Style */}
            <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-2xl border border-gray-200 dark:border-[#27272a] overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-[#27272a] flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                  Top Headlines
                </h2>
                <button
                  onClick={refresh}
                  className="text-xs text-gray-500 hover:text-[#bc0000] transition-colors"
                  title="Refresh feed"
                >
                  ↻
                </button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-[#27272a]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="px-4 py-3 animate-pulse">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-gray-200 dark:bg-[#27272a] rounded" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-[#27272a] rounded w-full" />
                          <div className="h-3 bg-gray-200 dark:bg-[#27272a] rounded w-2/3" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  feed?.topHeadlines?.map((article, index) => (
                    <Link
                      key={article.id}
                      href={`/${article.team}/${article.slug}`}
                      onClick={() => trackView(article)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1c1c1f] transition-colors group"
                    >
                      <span className="text-2xl font-black text-gray-200 dark:text-[#27272a] leading-none mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                            style={{
                              backgroundColor: teamColors[article.team]?.bg || '#27272a',
                              color: teamColors[article.team]?.text || '#ffffff',
                            }}
                          >
                            {formatTeamName(article.team)}
                          </span>
                          {isUnseen(article.id) && (
                            <span className="w-2 h-2 bg-[#bc0000] rounded-full" title="New for you" />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-[#bc0000] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                          {new Date(article.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========== TEAM QUICK NAV ========== */}
        <section className="mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {teams.map((team) => (
              <Link
                key={team.slug}
                href={`/teams/${team.slug}`}
                className="flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-200 hover:scale-105 whitespace-nowrap"
                style={{ borderColor: team.bgColor }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.bgColor }} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{team.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ========== LATEST NEWS GRID ========== */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest News</h2>
            <Link href="/search" className="text-sm font-medium text-[#bc0000] hover:underline">View All →</Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading ? (
              <>
                <ArticleSkeleton large />
                <ArticleSkeleton />
                <ArticleSkeleton />
                <ArticleSkeleton />
              </>
            ) : (
              feed?.latestNews?.map((article, index) => (
                <article
                  key={article.id}
                  className={`bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] overflow-hidden group hover:shadow-lg transition-all duration-300 ${index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                    }`}
                >
                  <Link href={`/${article.team}/${article.slug}`} onClick={() => trackView(article)}>
                    <div className={`relative ${index === 0 ? 'aspect-[2/1]' : 'aspect-video'} overflow-hidden`}>
                      <Image
                        src={article.featured_image || '/placeholder.jpg'}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span
                        className="absolute top-3 left-3 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide"
                        style={{
                          backgroundColor: teamColors[article.team]?.bg || '#27272a',
                          color: teamColors[article.team]?.text || '#ffffff',
                        }}
                      >
                        {formatTeamName(article.team)}
                      </span>
                      {isUnseen(article.id) && (
                        <span className="absolute top-3 right-3 w-2 h-2 bg-[#bc0000] rounded-full" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold text-gray-900 dark:text-white leading-snug group-hover:text-[#bc0000] transition-colors mb-2 ${index === 0 ? 'text-xl' : 'text-base'
                        }`}>
                        {article.title}
                      </h3>
                      {index === 0 && article.excerpt && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{article.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">{article.sm_authors?.name || 'Staff'}</span>
                        <span>•</span>
                        <span>{new Date(article.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>

        {/* ========== TEAM SECTIONS ========== */}
        {teams.slice(0, 3).map((team) => (
          <section key={team.slug} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ backgroundColor: team.bgColor }} />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{team.name} News</h2>
              </div>
              <Link href={`/teams/${team.slug}`} className="text-sm font-medium text-[#bc0000] hover:underline">
                More {team.name} →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <ArticleSkeleton key={i} />)
              ) : (
                feed?.teamSections?.[team.name.toLowerCase()]?.map((article) => (
                  <article
                    key={article.id}
                    className="bg-white dark:bg-[#111113] rounded-xl border border-gray-200 dark:border-[#27272a] overflow-hidden group hover:shadow-lg transition-all duration-300"
                  >
                    <Link href={`/${article.team}/${article.slug}`} onClick={() => trackView(article)}>
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={article.featured_image || '/placeholder.jpg'}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {isUnseen(article.id) && (
                          <span className="absolute top-2 right-2 w-2 h-2 bg-[#bc0000] rounded-full" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-[#bc0000] transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                          {new Date(article.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}

        {/* ========== LOAD MORE ========== */}
        <div className="text-center py-8">
          <button className="px-8 py-3 bg-[#bc0000] hover:bg-[#a00000] text-white font-semibold rounded-lg transition-colors">
            Load More Articles
          </button>
        </div>
      </main>
    </div>
  )
}
