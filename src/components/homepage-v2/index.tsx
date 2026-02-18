'use client'

import { useEffect, useState } from 'react'
import { Montserrat } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'

// Import all homepage components
import OracleScoresBar from './OracleScoresBar'
import HeroSection from './HeroSection'
import HeadlineStack from './HeadlineStack'
import ArticleGrid from './ArticleGrid'
import TrendingSidebar from './TrendingSidebar'
import UpcomingGames from './UpcomingGames'
import TeamSection from './TeamSection'
import NewsletterCTA from './NewsletterCTA'
import AROverlay from './AROverlay'

const montserrat = Montserrat({ subsets: ['latin'], weight: ['700'] })

/**
 * Homepage V2 - SportsMockery Redesign
 *
 * Features:
 * - Oracle Scores Bar (sticky, real-time)
 * - Hero Section (text-only, 200px)
 * - Headline Stack (ESPN-style)
 * - Article Grid (text-dominant)
 * - Team Sections (horizontal flex)
 * - Trending Sidebar
 * - Upcoming Games
 * - Newsletter CTA
 * - AR Overlay (Elite only)
 */

interface HomepageData {
  featured: {
    id: string
    slug: string
    title: string
    excerpt: string
    category: { name: string; slug: string }
    author?: { name: string }
    published_at: string
  } | null
  headlines: Array<{
    id: string
    slug: string
    title: string
    category: { name: string; slug: string }
    published_at: string
    isHot?: boolean
  }>
  articles: Array<{
    id: string
    slug: string
    title: string
    excerpt: string
    featured_image?: string
    category: { name: string; slug: string }
    author?: { name: string }
    published_at: string
  }>
  trending: Array<{
    id: string
    slug: string
    title: string
    category: { name: string; slug: string }
    views?: number
    mockeryScore?: number
  }>
  games: Array<{
    id: string
    team: string
    teamLogo?: string
    opponent: string
    opponentLogo?: string
    date: string
    time: string
    venue: string
    broadcast?: string
    mockeryPrediction?: string
  }>
  teams: Array<{
    name: string
    slug: string
    articles: Array<{
      id: string
      slug: string
      title: string
      excerpt: string
      category: { name: string; slug: string }
      published_at: string
    }>
    record?: string
    nextGame?: string
  }>
}

export default function HomepageV2() {
  const [data, setData] = useState<HomepageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAR, setShowAR] = useState(false)
  const [isElite, setIsElite] = useState(false)

  // Fetch homepage data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/feed')
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(transformFeedData(json))
      } catch (err) {
        console.error('Homepage fetch error:', err)
        setError('Unable to load content')
        // Use mock data for development
        setData(getMockData())
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Check elite status
    const checkElite = async () => {
      try {
        const res = await fetch('/api/user/status')
        if (res.ok) {
          const { isElite } = await res.json()
          setIsElite(isElite)
        }
      } catch {
        setIsElite(false)
      }
    }
    checkElite()
  }, [])

  const handleARClick = () => {
    setShowAR(true)
  }

  const handleUpgrade = () => {
    window.location.href = '/subscribe?plan=elite'
  }

  if (loading) {
    return <HomepageLoading />
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--sm-card)' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: 'var(--sm-text-muted)' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className={`px-6 py-3 bg-red-600 text-white font-bold hover:bg-red-700 ${montserrat.className}`}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Oracle Scores Bar - Sticky top */}
      <OracleScoresBar />

      {/* Main content */}
      <main className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Section - Small text-only */}
        <HeroSection
          article={data?.featured || null}
          onARClick={handleARClick}
          isElite={isElite}
          className="my-6"
        />

        {/* Two-column layout: Main + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Latest Articles Grid */}
            <ArticleGrid
              articles={data?.articles || []}
              title="Latest News"
              showThumbnails={true}
            />

            {/* Upcoming Games */}
            <UpcomingGames
              games={data?.games || []}
              title="Upcoming Games"
            />

            {/* Team Sections */}
            <TeamSection
              teams={data?.teams || []}
            />

            {/* Newsletter CTA */}
            <NewsletterCTA className="my-8" />
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Top Headlines */}
            <HeadlineStack
              headlines={data?.headlines || []}
              title="Top Headlines"
            />

            {/* Trending Mockery */}
            <TrendingSidebar
              items={data?.trending || []}
              title="Trending Mockery"
            />

            {/* AR Button in sidebar */}
            <div className="p-4 border border-red-600" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <h3 className={`text-white text-lg mb-3 ${montserrat.className}`}>
                AR Experience
              </h3>
              <p className="text-sm mb-4 font-serif" style={{ color: 'var(--sm-text-muted)' }}>
                Tour Chicago stadiums in augmented reality.
              </p>
              <button
                onClick={handleARClick}
                className={`w-full px-4 py-3 bg-red-600 text-white font-bold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 ${montserrat.className}`}
              >
                {isElite ? '🎮 View in AR' : '🔒 Unlock AR Mockery - Elite Only'}
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* AR Overlay Modal */}
      <AnimatePresence>
        {showAR && (
          <AROverlay
            team="chicago-bears"
            isElite={isElite}
            onClose={() => setShowAR(false)}
            onUpgrade={handleUpgrade}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Loading state
function HomepageLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-card)' }}>
      {/* Skeleton scores bar */}
      <div className="sticky top-0 z-50 border-b border-red-600 p-2" style={{ backgroundColor: 'var(--sm-card)' }}>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-40 h-8 rounded animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          ))}
        </div>
      </div>

      {/* Skeleton content */}
      <div className="max-w-[1320px] mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[200px] my-6 animate-pulse"
          style={{ backgroundColor: 'var(--sm-surface)' }}
        />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse" style={{ backgroundColor: 'var(--sm-surface)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Transform API feed data to homepage format
function transformFeedData(feed: Record<string, unknown>): HomepageData {
  return {
    featured: feed.featured as HomepageData['featured'],
    headlines: (feed.topHeadlines || []) as HomepageData['headlines'],
    articles: (feed.latestNews || []) as HomepageData['articles'],
    trending: (feed.trending || []) as HomepageData['trending'],
    games: (feed.games || []) as HomepageData['games'],
    teams: Object.entries(feed.teamSections || {}).map(([key, articles]) => ({
      name: formatTeamName(key),
      slug: formatTeamSlug(key),
      articles: articles as HomepageData['teams'][0]['articles'],
    })),
  }
}

function formatTeamName(key: string): string {
  const names: Record<string, string> = {
    bears: 'Chicago Bears',
    bulls: 'Chicago Bulls',
    blackhawks: 'Chicago Blackhawks',
    cubs: 'Chicago Cubs',
    'white sox': 'Chicago White Sox',
    whitesox: 'Chicago White Sox',
  }
  return names[key.toLowerCase()] || key
}

function formatTeamSlug(key: string): string {
  const slugs: Record<string, string> = {
    bears: 'chicago-bears',
    bulls: 'chicago-bulls',
    blackhawks: 'chicago-blackhawks',
    cubs: 'chicago-cubs',
    'white sox': 'chicago-white-sox',
    whitesox: 'chicago-white-sox',
  }
  return slugs[key.toLowerCase()] || key
}

// Mock data for development
function getMockData(): HomepageData {
  return {
    featured: {
      id: '1',
      slug: 'bears-playoff-hopes',
      title: 'Bears Playoff Hopes Rest on Defense That Can\'t Stop Anyone',
      excerpt: 'Analysis of how Chicago\'s porous defense threatens to derail what could have been a promising season.',
      category: { name: 'Bears', slug: 'chicago-bears' },
      author: { name: 'John Doe' },
      published_at: new Date().toISOString(),
    },
    headlines: [
      { id: '1', slug: 'fields-injury', title: 'Justin Fields Questionable for Sunday\'s Matchup', category: { name: 'Bears', slug: 'chicago-bears' }, published_at: new Date().toISOString(), isHot: true },
      { id: '2', slug: 'bulls-trade', title: 'Bulls Trade Deadline: 3 Moves That Make Sense', category: { name: 'Bulls', slug: 'chicago-bulls' }, published_at: new Date().toISOString() },
      { id: '3', slug: 'cubs-pitching', title: 'Cubs Pitching Staff Overhaul Begins', category: { name: 'Cubs', slug: 'chicago-cubs' }, published_at: new Date().toISOString() },
      { id: '4', slug: 'hawks-rebuild', title: 'Blackhawks Rebuild Timeline Revealed', category: { name: 'Blackhawks', slug: 'chicago-blackhawks' }, published_at: new Date().toISOString() },
      { id: '5', slug: 'sox-struggles', title: 'White Sox Continue to Disappoint Fans', category: { name: 'White Sox', slug: 'chicago-white-sox' }, published_at: new Date().toISOString(), isHot: true },
    ],
    articles: [
      { id: '1', slug: 'bears-draft', title: 'Bears Draft Analysis: Top 5 Prospects', excerpt: 'Breaking down the best fits for Chicago\'s roster needs.', category: { name: 'Bears', slug: 'chicago-bears' }, author: { name: 'Jane Smith' }, published_at: new Date().toISOString() },
      { id: '2', slug: 'bulls-lineup', title: 'Bulls Starting Lineup Changes Coming?', excerpt: 'Sources indicate major rotation changes are imminent.', category: { name: 'Bulls', slug: 'chicago-bulls' }, author: { name: 'Mike Johnson' }, published_at: new Date().toISOString() },
      { id: '3', slug: 'cubs-free-agency', title: 'Cubs Free Agency Targets Revealed', excerpt: 'The front office has their eyes on several big names.', category: { name: 'Cubs', slug: 'chicago-cubs' }, author: { name: 'Sarah Lee' }, published_at: new Date().toISOString() },
    ],
    trending: [
      { id: '1', slug: 'bears-meltdown', title: 'Bears Fourth Quarter Meltdown: A Visual Guide', category: { name: 'Bears', slug: 'chicago-bears' }, views: 15000, mockeryScore: 92 },
      { id: '2', slug: 'bulls-tank', title: 'Is Tanking the Only Option for the Bulls?', category: { name: 'Bulls', slug: 'chicago-bulls' }, views: 8500, mockeryScore: 78 },
    ],
    games: [
      { id: '1', team: 'Bears', opponent: 'Packers', date: '2025-01-19', time: '12:00 PM CT', venue: 'Soldier Field', broadcast: 'FOX', mockeryPrediction: 'Pain Incoming' },
      { id: '2', team: 'Bulls', opponent: 'Lakers', date: '2025-01-20', time: '7:00 PM CT', venue: 'United Center', broadcast: 'NBCSCH', mockeryPrediction: 'Tank Battle' },
    ],
    teams: [
      {
        name: 'Chicago Bears',
        slug: 'chicago-bears',
        articles: [
          { id: '1', slug: 'bears-news-1', title: 'Bears Injury Report: Full Breakdown', excerpt: 'Who\'s in, who\'s out for Sunday.', category: { name: 'Bears', slug: 'chicago-bears' }, published_at: new Date().toISOString() },
        ],
        record: '5-11',
        nextGame: 'vs GB Sun 12PM',
      },
      {
        name: 'Chicago Bulls',
        slug: 'chicago-bulls',
        articles: [
          { id: '2', slug: 'bulls-news-1', title: 'LaVine Trade Rumors Heat Up', excerpt: 'Multiple teams showing interest.', category: { name: 'Bulls', slug: 'chicago-bulls' }, published_at: new Date().toISOString() },
        ],
        record: '18-29',
        nextGame: 'vs LAL Mon 7PM',
      },
    ],
  }
}
