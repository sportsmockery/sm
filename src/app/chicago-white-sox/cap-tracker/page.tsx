import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame } from '@/lib/team-config'
import { datalabAdmin } from '@/lib/supabase-datalab'
import { HubUpdatesFeed } from '@/components/hub'

export const metadata: Metadata = {
  title: 'Chicago White Sox Payroll Tracker 2026 | Sports Mockery',
  description:
    'Live payroll, contracts, spending breakdown.',
  openGraph: {
    title: 'Chicago White Sox Payroll Tracker 2026',
    description: 'Live payroll, contracts, spending breakdown.',
    type: 'website',
  },
  twitter: {
    title: 'Chicago White Sox Payroll Tracker 2026',
    description: 'Live payroll, contracts, spending breakdown.',
  },
}

// Revalidate every hour
export const revalidate = 3600

function formatMoney(n: number | null | undefined): string {
  if (n == null) return '--'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}K`
  return `${sign}$${abs}`
}

function getPositionGroup(pos: string): string {
  const pitchers = ['P', 'SP', 'RP', 'CL']
  const catchers = ['C']
  const infielders = ['1B', '2B', '3B', 'SS', 'IF']
  const outfielders = ['LF', 'CF', 'RF', 'OF', 'DH']
  if (pitchers.includes(pos)) return 'Pitchers'
  if (catchers.includes(pos)) return 'Catchers'
  if (infielders.includes(pos)) return 'Infielders'
  if (outfielders.includes(pos)) return 'Outfielders'
  return 'Other'
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const hours = Math.round((now.getTime() - date.getTime()) / 3600000)
  if (hours < 1) return 'Updated just now'
  if (hours === 1) return 'Updated 1 hour ago'
  if (hours < 24) return `Updated ${hours} hours ago`
  const days = Math.round(hours / 24)
  if (days === 1) return 'Updated yesterday'
  return `Updated ${days} days ago`
}

interface CapSummary {
  total_cap: number
  total_committed: number
  cap_space: number
  dead_money: number
  updated_at: string
}

interface ContractRow {
  player_id: string
  player_name: string
  position: string
  age: number | null
  cap_hit: number | null
  base_salary: number | null
  dead_cap: number | null
  contract_years: number | null
  free_agent_year: number | null
}

export default async function WhiteSoxPayrollTrackerPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [record, nextGame, capResult, contractsResult, headshotsResult] = await Promise.all([
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
    datalabAdmin
      .from('whitesox_salary_cap')
      .select('*')
      .eq('season', 2026)
      .single(),
    datalabAdmin
      .from('whitesox_contracts')
      .select('player_id, player_name, position, age, cap_hit, base_salary, dead_cap, contract_years, free_agent_year')
      .eq('season', 2026)
      .order('cap_hit', { ascending: false }),
    datalabAdmin
      .from('whitesox_players')
      .select('espn_id, headshot_url'),
  ])

  const cap: CapSummary | null = capResult.data
  const rows: ContractRow[] = (contractsResult.data || []) as ContractRow[]

  // Build headshot map: ESPN ID -> headshot URL
  const headshotMap = new Map<string, string>()
  if (headshotsResult.data) {
    for (const p of headshotsResult.data as { espn_id: string; headshot_url: string }[]) {
      if (p.espn_id && p.headshot_url) headshotMap.set(String(p.espn_id), p.headshot_url)
    }
  }

  const topFive = rows.slice(0, 5)
  const maxHit = topFive[0]?.cap_hit || 1
  const isOverThreshold = cap ? cap.cap_space < 0 : false
  const totalCommitted = cap?.total_committed || 0
  const totalCap = cap?.total_cap || 0
  const usedPct = totalCap > 0 && totalCommitted > 0 ? (totalCommitted / totalCap) * 100 : 0
  const deadPct = cap ? (cap.dead_money / (cap.total_cap || 1)) * 100 : 0

  // Position group breakdown
  const groupTotals = rows.reduce((acc, r) => {
    const group = getPositionGroup(r.position)
    acc[group] = (acc[group] || 0) + (r.cap_hit || 0)
    return acc
  }, {} as Record<string, number>)

  const hasCapData = cap !== null
  const hasContracts = rows.length > 0

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="cap-tracker">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
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
              White Sox Payroll Tracker
            </h1>
            {cap && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--sm-text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {timeAgo(cap.updated_at)}
              </div>
            )}
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Live payroll, contract breakdowns, and position spending for the 2026 season. MLB has no hard salary cap, but luxury tax thresholds apply.
          </p>
        </div>

        {/* Payroll Overview Banner */}
        {hasCapData ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <CapCard label="Total Payroll" value={formatMoney(cap!.total_committed)} />
            <CapCard
              label="Payroll Space"
              value={formatMoney(cap!.cap_space)}
              subtitle={cap!.cap_space && cap!.cap_space < 0 ? 'OVER THRESHOLD' : 'UNDER THRESHOLD'}
              color={cap!.cap_space && cap!.cap_space < 0 ? 'var(--sm-error, #ef4444)' : 'var(--sm-success, #22c55e)'}
            />
            <CapCard label="Dead Money" value={formatMoney(cap!.dead_money)} color="var(--sm-text-muted)" />
            <CapCard label="Luxury Tax Threshold" value={formatMoney(cap!.total_cap)} />
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <CapCard label="Total Payroll" value="--" />
            <CapCard label="Payroll Space" value="--" />
            <CapCard label="Dead Money" value="--" />
            <CapCard label="Committed" value="--" />
          </div>
        )}

        {/* Payroll Usage Gauge */}
        {hasCapData && totalCap > 0 && (
          <div
            className="glass-card glass-card-sm glass-card-static"
            style={{ padding: '16px 20px', marginBottom: '24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sm-text)' }}>
                Luxury Tax Usage
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: isOverThreshold ? 'var(--sm-error, #ef4444)' : 'var(--sm-success, #22c55e)' }}>
                {usedPct.toFixed(1)}%
              </span>
            </div>
            <div className="cap-bar-container">
              {/* Dead money segment */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${Math.min(deadPct, 100)}%`,
                  backgroundColor: 'rgba(239, 68, 68, 0.3)',
                  borderRadius: '7px 0 0 7px',
                }}
              />
              {/* Total committed */}
              <div
                className="cap-bar-used"
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${Math.min(usedPct, 100)}%`,
                  ...(isOverThreshold ? { background: 'var(--sm-error, #ef4444)' } : {}),
                  opacity: 0.85,
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'var(--sm-text-dim)' }}>
              <span>$0</span>
              <span>{formatMoney(totalCap)} threshold</span>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {[
            { label: 'Trade Rumors', href: '/chicago-white-sox/trade-rumors' },
            { label: 'Draft Tracker', href: '/chicago-white-sox/draft-tracker' },
            { label: 'Depth Chart', href: '/chicago-white-sox/depth-chart' },
            { label: 'Full Roster', href: '/chicago-white-sox/roster' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="team-pill">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Hub Updates Feed */}
        <HubUpdatesFeed hubSlug="cap-tracker" teamSlug="chicago-white-sox" title="Payroll Moves" emptyState="No payroll updates yet." />

        {/* Top 5 Payroll Hits */}
        {hasContracts && topFive.length > 0 && (
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
              Top Contracts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topFive.map((p, idx) => {
                const barWidth = ((p.cap_hit || 0) / maxHit) * 100
                return (
                  <div
                    key={p.player_id}
                    className="glass-card glass-card-sm glass-card-static"
                    style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <span
                      style={{
                        width: '20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: idx === 0 ? '#27251F' : 'var(--sm-text-dim)',
                        flexShrink: 0,
                        textAlign: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <PlayerAvatar playerId={p.player_id} name={p.player_name} size={32} headshotMap={headshotMap} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '14px',
                            fontWeight: 600,
                            color: 'var(--sm-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {p.player_name}
                          {p.position && (
                            <span style={{ color: 'var(--sm-text-dim)', fontWeight: 400, marginLeft: '6px', fontSize: '12px' }}>
                              {p.position}
                            </span>
                          )}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: '14px',
                            fontWeight: 700,
                            color: '#27251F',
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}
                        >
                          {formatMoney(p.cap_hit)}
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: 'var(--sm-surface)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${barWidth}%`,
                            backgroundColor: '#27251F',
                            borderRadius: '3px',
                            opacity: 1 - idx * 0.12,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Position Group Breakdown */}
        {hasContracts && Object.keys(groupTotals).length > 0 && (
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
              Payroll by Position Group
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {Object.entries(groupTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([group, total]) => {
                  const pct = cap ? ((total / cap.total_committed) * 100).toFixed(1) : '0'
                  return (
                    <div
                      key={group}
                      className="glass-card glass-card-sm glass-card-static"
                      style={{ padding: '16px', textAlign: 'center' }}
                    >
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '22px',
                          fontWeight: 700,
                          color: 'var(--sm-text)',
                        }}
                      >
                        {formatMoney(total)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--sm-text-muted)', fontWeight: 600, marginTop: '2px' }}>
                        {group}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--sm-text-dim)', marginTop: '2px' }}>
                        {pct}% of total
                      </div>
                    </div>
                  )
                })}
            </div>
          </section>
        )}

        {/* Full Contracts Table */}
        {hasContracts ? (
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
              Contract Details
            </h2>
            <div
              style={{
                background: 'var(--sm-card)',
                border: '1px solid var(--sm-border)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {/* Table Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.7fr 0.7fr',
                  padding: '12px 16px',
                  backgroundColor: 'var(--sm-surface)',
                  borderBottom: '1px solid var(--sm-border)',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--sm-text-dim)',
                  gap: '8px',
                }}
              >
                <div>Player</div>
                <div>Pos</div>
                <div style={{ textAlign: 'right' }}>Luxury Tax</div>
                <div style={{ textAlign: 'right' }}>Base Salary</div>
                <div style={{ textAlign: 'center' }}>Years</div>
                <div style={{ textAlign: 'center' }}>FA Year</div>
              </div>

              {/* Table Rows */}
              {rows.map((row, idx) => (
                <div
                  key={row.player_id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 0.5fr 1fr 1fr 0.7fr 0.7fr',
                    padding: '10px 16px',
                    borderBottom: idx < rows.length - 1 ? '1px solid var(--sm-border)' : 'none',
                    alignItems: 'center',
                    fontSize: '13px',
                    gap: '8px',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  }}
                >
                  {/* Player */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <PlayerAvatar playerId={row.player_id} name={row.player_name} size={28} headshotMap={headshotMap} />
                    <span
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        color: 'var(--sm-text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.player_name}
                    </span>
                  </div>
                  {/* Position */}
                  <div style={{ color: 'var(--sm-text-muted)', fontSize: '12px' }}>{row.position}</div>
                  {/* Luxury Tax Value */}
                  <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    {formatMoney(row.cap_hit)}
                  </div>
                  {/* Base Salary */}
                  <div style={{ textAlign: 'right', color: 'var(--sm-text-muted)' }}>
                    {formatMoney(row.base_salary)}
                  </div>
                  {/* Years Left */}
                  <div style={{ textAlign: 'center', color: 'var(--sm-text-muted)' }}>
                    {row.contract_years != null ? `${row.contract_years} yr` : '--'}
                  </div>
                  {/* FA Year */}
                  <div style={{ textAlign: 'center', color: 'var(--sm-text-muted)' }}>
                    {row.free_agent_year ?? '--'}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--sm-text-dim)', marginTop: '8px' }}>
              {rows.length} player{rows.length !== 1 ? 's' : ''} under contract
            </div>
          </section>
        ) : (
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
                Contract data loading...
              </p>
              <p style={{ color: 'var(--sm-text-dim)', fontSize: '13px', margin: 0 }}>
                Payroll and contract details are synced from Spotrac hourly.
              </p>
            </div>
          </section>
        )}

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
              Ask Scout About Payroll
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get AI-powered insights on White Sox payroll, potential signings, and rebuild budget.
          </p>
          <Link
            href="/scout-ai?team=chicago-white-sox&q=How%20much%20payroll%20space%20do%20the%20White%20Sox%20have"
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

function PlayerAvatar({ playerId, name, size, headshotMap }: { playerId: string; name: string; size: number; headshotMap: Map<string, string> }) {
  const url = headshotMap.get(playerId)
  const iconSize = size >= 32 ? 16 : 14
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        border: size >= 32 ? '2px solid var(--sm-border)' : '1px solid var(--sm-border)',
        background: 'var(--sm-surface)',
      }}
    >
      {url ? (
        <Image src={url} alt={name} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={iconSize} height={iconSize} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ color: 'var(--sm-text-dim)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
          </svg>
        </div>
      )}
    </div>
  )
}

function CapCard({
  label,
  value,
  subtitle,
  color,
}: {
  label: string
  value: string
  subtitle?: string
  color?: string
}) {
  return (
    <div className="glass-card glass-card-sm glass-card-static" style={{ textAlign: 'center', padding: '20px' }}>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          color: color || 'var(--sm-text)',
        }}
      >
        {value}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: color || 'var(--sm-text-dim)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '2px',
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--sm-text-dim)',
          fontWeight: 600,
          marginTop: subtitle ? '4px' : '0',
        }}
      >
        {label}
      </div>
    </div>
  )
}
