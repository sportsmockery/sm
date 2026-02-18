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
    <div className="sm-hero-bg" style={{ minHeight: '100vh' }}>
      <div className="sm-grid-overlay" />
      {/* Hero header */}
      <header style={{ paddingTop: 96, paddingBottom: 48, position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px' }}>
          <span className="sm-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--sm-success)', animation: 'pulse 2s infinite' }} />
            Live Data
          </span>
          <h1 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 'clamp(1.75rem, 5vw, 3rem)', fontWeight: 800, color: 'var(--sm-text)', textTransform: 'uppercase', marginBottom: 16, letterSpacing: '-0.02em' }}>
            Chicago Sports Data Hub
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', maxWidth: 600, margin: '0 auto' }}>
            Your one-stop destination for live stats, schedules, standings, and comprehensive data
            for all five Chicago professional sports teams.
          </p>
        </div>
      </header>

      {/* Team selection */}
      <main style={{ maxWidth: 'var(--sm-max-width)', margin: '0 auto', padding: '0 16px 48px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', fontWeight: 700, marginBottom: 12, color: 'var(--sm-text)' }}>
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
              className="glass-card group"
              style={{ padding: 0, overflow: 'hidden', position: 'relative' }}
            >
              {/* Top accent bar */}
              <div style={{ height: 3, width: '100%', backgroundColor: team.primaryColor }} />

              {/* Content */}
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  {/* Logo */}
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 'var(--sm-radius-md)',
                      backgroundColor: `${team.primaryColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 8,
                      transition: 'transform 0.3s',
                    }}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      width={48}
                      height={48}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  {/* Team info */}
                  <div style={{ flex: 1 }}>
                    <span
                      className="sm-tag"
                      style={{
                        backgroundColor: `${team.primaryColor}20`,
                        color: team.primaryColor,
                        borderColor: 'transparent',
                        fontSize: 10,
                        marginBottom: 8,
                        display: 'inline-block',
                      }}
                    >
                      {team.league}
                    </span>
                    <h3 style={{ fontFamily: 'var(--sm-font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 4, color: 'var(--sm-text)' }}>
                      {team.name}
                    </h3>
                    <p style={{ fontSize: 14, color: 'var(--sm-text-muted)' }}>
                      {team.description}
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--sm-border)', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {['Live Scores', 'Schedule', 'Roster', 'Stats'].map((feature) => (
                    <span
                      key={feature}
                      className="sm-tag"
                      style={{ fontSize: 11, borderColor: 'transparent', backgroundColor: 'var(--sm-surface)' }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional info */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', flexWrap: 'wrap', justifyContent: 'center', gap: 32, fontSize: 14, color: 'var(--sm-text-muted)' }}>
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
