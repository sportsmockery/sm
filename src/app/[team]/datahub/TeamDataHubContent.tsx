'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { type TeamSeasonData } from '@/components/team/TeamSeasonCard'
import TeamSeasonCard from '@/components/team/TeamSeasonCard'
import ARTourButton from '@/components/ar/ARTourButton'

type TeamKey = 'bears' | 'bulls' | 'cubs' | 'whitesox' | 'blackhawks'

interface TeamInfo {
  key: TeamKey
  name: string
  shortName: string
  logo: string
  primaryColor: string
  secondaryColor: string
  league: string
  categorySlug: string
}

const TEAMS: Record<TeamKey, TeamInfo> = {
  bears: {
    key: 'bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83200',
    league: 'NFL',
    categorySlug: 'chicago-bears',
  },
  bulls: {
    key: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    league: 'NBA',
    categorySlug: 'chicago-bulls',
  },
  cubs: {
    key: 'cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    league: 'MLB',
    categorySlug: 'chicago-cubs',
  },
  whitesox: {
    key: 'whitesox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    league: 'MLB',
    categorySlug: 'chicago-white-sox',
  },
  blackhawks: {
    key: 'blackhawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    league: 'NHL',
    categorySlug: 'chicago-blackhawks',
  },
}

interface TeamPost {
  id: number
  slug: string
  title: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: string
  author: {
    displayName: string
  }
  categorySlug: string
}

interface TeamDataHubContentProps {
  teamKey: TeamKey
}

export default function TeamDataHubContent({ teamKey }: TeamDataHubContentProps) {
  const [seasonData, setSeasonData] = useState<TeamSeasonData | null>(null)
  const [posts, setPosts] = useState<TeamPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const team = TEAMS[teamKey]
  const otherTeams = Object.values(TEAMS).filter((t) => t.key !== teamKey)

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/team-data?team=${teamKey}`)
        if (!response.ok) throw new Error('Failed to fetch team data')
        const data = await response.json()
        setSeasonData(data.seasonData)
        setPosts(data.posts || [])
      } catch (err) {
        console.error('Error fetching team data:', err)
        setError('Failed to load team data')
        setSeasonData({
          season: new Date().getFullYear(),
          record: { wins: 0, losses: 0 },
          standing: team.league,
          nextGame: null,
          lastGame: null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [teamKey, team.league])

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0a0a0b]">
      {/* Hero header */}
      <header
        className="relative py-8 md:py-12"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor} 0%, #1a2940 100%)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Team logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 p-3 flex items-center justify-center">
              <Image
                src={team.logo}
                alt={team.name}
                width={72}
                height={72}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Team name and tagline */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-white/20 rounded text-white">
                  {team.league}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-green-500/20 rounded text-green-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Live Data
                </span>
              </div>
              <h1
                className="text-white text-2xl md:text-4xl font-black uppercase"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {team.name} Data Hub
              </h1>
              <p className="text-white/70 text-sm md:text-base mt-1">
                Live stats, schedules, standings & analysis
              </p>
            </div>
          </div>

          {/* Quick team switcher */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-white/50 text-sm whitespace-nowrap">Switch team:</span>
            {otherTeams.map((otherTeam) => (
              <Link
                key={otherTeam.key}
                href={`/${otherTeam.key}/datahub`}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors whitespace-nowrap"
              >
                <Image
                  src={otherTeam.logo}
                  alt={otherTeam.shortName}
                  width={20}
                  height={20}
                  className="w-5 h-5"
                />
                <span className="text-white text-sm">{otherTeam.shortName}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Accent bar */}
      <div
        className="h-1"
        style={{ backgroundColor: team.secondaryColor }}
      />

      {/* Main content */}
      <main className="max-w-[1200px] mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Season overview */}
            {isLoading ? (
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
            ) : seasonData ? (
              <TeamSeasonCard team={team} season={seasonData} />
            ) : null}

            {/* Latest articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-[18px] font-bold text-[#222] dark:text-white uppercase pb-2 border-b-[3px]"
                  style={{ borderColor: team.secondaryColor, fontFamily: "'Montserrat', sans-serif" }}
                >
                  Latest {team.shortName} News
                </h2>
                <Link
                  href={`/${team.categorySlug}`}
                  className="text-sm hover:underline"
                  style={{ color: team.primaryColor }}
                >
                  View All
                </Link>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {posts.slice(0, 6).map((post, index) => (
                    <article
                      key={post.id}
                      className={`group bg-white dark:bg-[#111] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${
                        index === 0 ? 'md:col-span-2' : ''
                      }`}
                    >
                      <Link
                        href={`/${post.categorySlug}/${post.slug}`}
                        className={`flex ${index === 0 ? 'flex-col md:flex-row' : 'flex-col'}`}
                      >
                        {/* Image */}
                        <div
                          className={`relative overflow-hidden ${
                            index === 0 ? 'aspect-[16/9] md:aspect-auto md:w-1/2 md:h-auto md:min-h-[200px]' : 'aspect-[16/10]'
                          }`}
                        >
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt=""
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes={index === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
                            />
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ backgroundColor: `${team.primaryColor}20` }}
                            >
                              <Image
                                src={team.logo}
                                alt=""
                                width={60}
                                height={60}
                                className="opacity-30"
                              />
                            </div>
                          )}
                          <div
                            className="absolute top-0 left-0 w-1 h-full"
                            style={{ backgroundColor: team.secondaryColor }}
                          />
                        </div>

                        {/* Content */}
                        <div className={`p-4 ${index === 0 ? 'md:w-1/2 md:p-6' : ''}`}>
                          <span
                            className="inline-block text-[10px] font-bold uppercase tracking-wide mb-2"
                            style={{ color: team.secondaryColor }}
                          >
                            {team.shortName}
                          </span>
                          <h3
                            className={`font-bold text-[#222] dark:text-white leading-tight group-hover:opacity-80 transition-colors ${
                              index === 0 ? 'text-[18px] md:text-[22px] line-clamp-3' : 'text-[15px] line-clamp-2'
                            }`}
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {post.title}
                          </h3>
                          {index === 0 && post.excerpt && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3 text-[11px] text-gray-400">
                            <span>{post.author.displayName}</span>
                            <span>•</span>
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
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p>No recent articles found for {team.shortName}</p>
                  <Link
                    href={`/${team.categorySlug}`}
                    className="inline-block mt-4 px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: team.primaryColor }}
                  >
                    Browse {team.shortName} Coverage
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick links */}
            <div className="bg-white dark:bg-[#111] rounded-xl p-6 shadow-sm">
              <h3
                className="text-[16px] font-bold text-[#222] dark:text-white uppercase mb-4 pb-2 border-b-2"
                style={{ borderColor: team.secondaryColor, fontFamily: "'Montserrat', sans-serif" }}
              >
                Quick Links
              </h3>
              <nav className="space-y-2">
                <Link
                  href={`/${team.categorySlug}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl">📰</span>
                  <span className="font-medium text-[#222] dark:text-white">All {team.shortName} News</span>
                </Link>
                <Link
                  href={`/${team.categorySlug}/schedule`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl">📅</span>
                  <span className="font-medium text-[#222] dark:text-white">Schedule</span>
                </Link>
                <Link
                  href={`/${team.categorySlug}/roster`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl">👥</span>
                  <span className="font-medium text-[#222] dark:text-white">Roster</span>
                </Link>
                <Link
                  href={`/${team.categorySlug}/stats`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-2xl">📊</span>
                  <span className="font-medium text-[#222] dark:text-white">Stats</span>
                </Link>
              </nav>
            </div>

            {/* AR Stadium Tour */}
            <ARTourButton team={team.categorySlug} />

            {/* Other teams */}
            <div className="bg-white dark:bg-[#111] rounded-xl p-6 shadow-sm">
              <h3
                className="text-[16px] font-bold text-[#222] dark:text-white uppercase mb-4 pb-2 border-b-2 border-gray-200 dark:border-gray-700"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Other Teams
              </h3>
              <div className="space-y-2">
                {otherTeams.map((otherTeam) => (
                  <Link
                    key={otherTeam.key}
                    href={`/${otherTeam.key}/datahub`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Image
                      src={otherTeam.logo}
                      alt={otherTeam.name}
                      width={28}
                      height={28}
                      className="w-7 h-7"
                    />
                    <span className="font-medium text-[#222] dark:text-white">{otherTeam.shortName}</span>
                    <span className="text-xs text-gray-400 ml-auto">{otherTeam.league}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Back to all teams */}
            <Link
              href="/datahub"
              className="flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="font-medium text-gray-600 dark:text-gray-400">View All Teams</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
