import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Chicago Sports Data Hub | Live Stats & Schedules',
  description: 'Your complete Chicago sports data hub. Live stats, schedules, standings, and analysis for Bears, Bulls, Cubs, White Sox, and Blackhawks.',
  openGraph: {
    title: 'Chicago Sports Data Hub | Sports Mockery',
    description: 'Live stats, schedules, and standings for all Chicago sports teams',
    type: 'website',
  },
}

const TEAMS = [
  {
    key: 'bears',
    name: 'Chicago Bears',
    shortName: 'Bears',
    logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
    primaryColor: '#0B162A',
    secondaryColor: '#C83200',
    league: 'NFL',
    description: 'Live scores, schedules, roster, and player stats',
  },
  {
    key: 'bulls',
    name: 'Chicago Bulls',
    shortName: 'Bulls',
    logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png',
    primaryColor: '#CE1141',
    secondaryColor: '#000000',
    league: 'NBA',
    description: 'Game schedules, standings, and team stats',
  },
  {
    key: 'cubs',
    name: 'Chicago Cubs',
    shortName: 'Cubs',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png',
    primaryColor: '#0E3386',
    secondaryColor: '#CC3433',
    league: 'MLB',
    description: 'Scores, schedules, and player statistics',
  },
  {
    key: 'whitesox',
    name: 'Chicago White Sox',
    shortName: 'White Sox',
    logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png',
    primaryColor: '#27251F',
    secondaryColor: '#C4CED4',
    league: 'MLB',
    description: 'Live updates, schedules, and team data',
  },
  {
    key: 'blackhawks',
    name: 'Chicago Blackhawks',
    shortName: 'Blackhawks',
    logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png',
    primaryColor: '#CF0A2C',
    secondaryColor: '#000000',
    league: 'NHL',
    description: 'Scores, schedules, and player stats',
  },
]

export default function DataHubLandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-surface)' }}>
      {/* Hero header */}
      <header className="relative py-12 md:py-20 bg-gradient-to-br from-[#0B162A] via-[#1a2940] to-[#2d3748]">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="max-w-[1200px] mx-auto px-4 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live Data
            </div>
            <h1
              className="text-white text-3xl md:text-5xl font-black uppercase mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Chicago Sports Data Hub
            </h1>
            <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto">
              Your one-stop destination for live stats, schedules, standings, and comprehensive data
              for all five Chicago professional sports teams.
            </p>
          </div>
        </div>
      </header>

      {/* Team selection */}
      <main className="max-w-[1200px] mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
          >
            Select Your Team
          </h2>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            Choose a team to view their complete data hub with live stats, schedules, and more.
          </p>
        </div>

        {/* Team tiles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAMS.map((team) => (
            <Link
              key={team.key}
              href={`/${team.key}/datahub`}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'var(--sm-card)' }}
            >
              {/* Top accent bar */}
              <div
                className="h-2 w-full"
                style={{ backgroundColor: team.primaryColor }}
              />

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: `${team.primaryColor}15` }}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Team info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{
                          backgroundColor: `${team.primaryColor}20`,
                          color: team.primaryColor,
                        }}
                      >
                        {team.league}
                      </span>
                    </div>
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: 'var(--sm-text)', fontFamily: "'Montserrat', sans-serif" }}
                    >
                      {team.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                      {team.description}
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--sm-border)' }}>
                  <div className="flex flex-wrap gap-2">
                    {['Live Scores', 'Schedule', 'Roster', 'Stats'].map((feature) => (
                      <span
                        key={feature}
                        className="text-[11px] px-2 py-1 rounded"
                        style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow indicator */}
                <div
                  className="absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Real-time data from ESPN</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Auto-updating stats</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Comprehensive analytics</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
