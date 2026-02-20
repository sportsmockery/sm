import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBearsSeparatedRecord, getBearsPlayers } from '@/lib/bearsData'

export const metadata: Metadata = {
  title: 'Chicago Bears Salary Cap Tracker 2026 | Sports Mockery',
  description:
    'Chicago Bears 2026 salary cap tracker: live cap space, contract breakdowns, dead money, and cut/trade simulator. Track every Bears cap move.',
  openGraph: {
    title: 'Chicago Bears Salary Cap Tracker 2026',
    description: 'Live Bears cap space, contract details, and cap move projections.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago Bears Salary Cap 2026',
    description: 'Bears cap space, contracts, dead money tracker. Updated live.',
  },
}

export const revalidate = 3600

export default async function BearsCapTrackerPage() {
  const team = CHICAGO_TEAMS.bears

  const [separatedRecord, nextGame, players] = await Promise.all([
    getBearsSeparatedRecord(2025),
    fetchNextGame('bears'),
    getBearsPlayers(),
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

  const rosterCount = players.length

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="cap-tracker">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
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
            Bears Salary Cap Tracker
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Live cap space, contract breakdowns, cut/trade simulator for the 2026 season.
          </p>
        </div>

        {/* Cap Overview Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div className="glass-card glass-card-sm glass-card-static" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--sm-text)',
              }}
            >
              {rosterCount}
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--sm-text-dim)',
                fontWeight: 600,
              }}
            >
              Active Roster
            </div>
          </div>
          <div className="glass-card glass-card-sm glass-card-static" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--sm-success, #22c55e)',
              }}
            >
              --
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--sm-text-dim)',
                fontWeight: 600,
              }}
            >
              Cap Space
            </div>
          </div>
          <div className="glass-card glass-card-sm glass-card-static" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--sm-text)',
              }}
            >
              --
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--sm-text-dim)',
                fontWeight: 600,
              }}
            >
              Dead Money
            </div>
          </div>
          <div className="glass-card glass-card-sm glass-card-static" style={{ textAlign: 'center', padding: '20px' }}>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--sm-text)',
              }}
            >
              --
            </div>
            <div
              style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--sm-text-dim)',
                fontWeight: 600,
              }}
            >
              Total Cap Hit
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
          {[
            { label: 'Trade Rumors', href: '/chicago-bears/trade-rumors' },
            { label: 'Draft Tracker', href: '/chicago-bears/draft-tracker' },
            { label: 'Depth Chart', href: '/chicago-bears/depth-chart' },
            { label: 'Full Roster', href: '/chicago-bears/roster' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="team-pill">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Top Contracts by Position Group */}
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
            Roster by Position
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {(() => {
              const groups: Record<string, number> = {}
              players.forEach((p) => {
                const g = p.positionGroup || p.side || 'Other'
                groups[g] = (groups[g] || 0) + 1
              })
              return Object.entries(groups)
                .sort((a, b) => b[1] - a[1])
                .map(([group, count]) => (
                  <div
                    key={group}
                    className="glass-card glass-card-sm glass-card-static"
                    style={{ padding: '14px', textAlign: 'center' }}
                  >
                    <div
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '22px',
                        fontWeight: 700,
                        color: 'var(--sm-text)',
                      }}
                    >
                      {count}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 600 }}>
                      {group}
                    </div>
                  </div>
                ))
            })()}
          </div>
        </section>

        {/* Placeholder: Cap data coming from DataLab */}
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
            Contract Details
          </h2>
          <div
            className="glass-card glass-card-static"
            style={{ textAlign: 'center', padding: '48px 24px' }}
          >
            <svg
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              style={{ color: 'var(--sm-text-dim)', margin: '0 auto 16px' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: '0 0 8px 0' }}>
              Detailed contract data coming soon
            </p>
            <p style={{ color: 'var(--sm-text-dim)', fontSize: '13px', margin: 0 }}>
              Cap hits, dead money, and contract details will be populated by DataLab.
            </p>
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
              Ask Scout About Cap Space
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get AI-powered insights on Bears cap space, potential cuts, and free agency targets.
          </p>
          <Link
            href="/scout-ai?team=chicago-bears&q=How%20much%20cap%20space%20do%20the%20Bears%20have"
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
