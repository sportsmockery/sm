import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { TeamHubLayout } from '@/components/team'
import { CHICAGO_TEAMS, fetchNextGame } from '@/lib/team-config'
import { getBearsSeparatedRecord } from '@/lib/bearsData'
import { getBearsPosts } from '@/lib/bears'
import { datalabAdmin } from '@/lib/supabase-datalab'
import DraftTrackerTabs from './DraftTrackerTabs'
import type { HubItem } from '@/types/hub'

export const metadata: Metadata = {
  title: 'Chicago Bears Draft Tracker & Mock Drafts 2026 | Sports Mockery',
  description:
    'Bears 2026 draft prospects, mock drafts, trade scenarios. Build your draft.',
  keywords: 'Chicago Bears mock draft, Bears draft prospects 2026, NFL Draft Bears picks, Bears draft news',
  openGraph: {
    title: 'Chicago Bears Draft Tracker & Mock Drafts 2026',
    description:
      'Build your Bears mock draft. Latest 2026 draft news, prospect rankings, trade scenarios.',
    type: 'website',
  },
  twitter: {
    title: 'Bears 2026 Mock Draft Simulator',
    description:
      'Create your Chicago Bears mock draft. Latest draft news and prospect rankings.',
  },
}

export const revalidate = 3600

export default async function BearsDraftTrackerPage() {
  const team = CHICAGO_TEAMS.bears

  const [separatedRecord, nextGame, posts, hubItemsResult] = await Promise.all([
    getBearsSeparatedRecord(2025),
    fetchNextGame('bears'),
    getBearsPosts(20),
    datalabAdmin
      .from('hub_items')
      .select('*')
      .eq('team_slug', 'chicago-bears')
      .eq('hub_slug', 'draft-tracker')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('timestamp', { ascending: false })
      .limit(10)
      .then(res => res.data || []) as Promise<HubItem[]>,
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

  // Filter draft-related posts
  const draftKeywords = ['draft', 'prospect', 'mock', 'pick', 'combine', 'scouting']
  const draftPosts = posts
    .filter((p) => draftKeywords.some((kw) => p.title.toLowerCase().includes(kw)))
    .slice(0, 8)
  const displayPosts = draftPosts.length > 0 ? draftPosts : posts.slice(0, 6)

  // Serialize posts for client component
  const serializedPosts = displayPosts.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    categorySlug: p.categorySlug || undefined,
    featuredImage: p.featuredImage || null,
    publishedAt: p.publishedAt,
    author: p.author ? { displayName: p.author.displayName } : null,
  }))

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} activeTab="draft-tracker">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Page Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                background: 'var(--sm-gradient-subtle)',
                color: 'var(--sm-red-light)',
                border: '1px solid rgba(188,0,0,0.2)',
              }}
            >
              2026 NFL Draft
            </span>
          </div>
          <h1
            style={{
              fontFamily: "Barlow, sans-serif",
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--sm-text)',
              letterSpacing: '-1px',
              margin: '0 0 8px 0',
            }}
          >
            Bears Draft Tracker
          </h1>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '16px', margin: 0, lineHeight: 1.6 }}>
            Bears 2026 draft prospects, mock drafts, trade scenarios. Build your own mock draft.
          </p>
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {[
            { label: 'Trade Rumors', href: '/chicago-bears/trade-rumors' },
            { label: 'Cap Tracker', href: '/chicago-bears/cap-tracker' },
            { label: 'Depth Chart', href: '/chicago-bears/depth-chart' },
            { label: 'Full Roster', href: '/chicago-bears/roster' },
          ].map((link) => (
            <Link key={link.label} href={link.href} className="team-pill">
              {link.label}
            </Link>
          ))}
        </div>

        {/* Tabs */}
        <Suspense fallback={null}>
          <DraftTrackerTabs
            hubItems={hubItemsResult as HubItem[]}
            displayPosts={serializedPosts}
          />
        </Suspense>

        {/* Ask Scout CTA */}
        <div
          className="glass-card glass-card-static"
          style={{ marginTop: '32px', textAlign: 'center', padding: '32px 24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={28} height={28} />
            <h3
              style={{
                fontFamily: "Barlow, sans-serif",
                color: 'var(--sm-text)',
                fontWeight: 700,
                fontSize: '18px',
                margin: 0,
              }}
            >
              Ask Scout About the Draft
            </h3>
          </div>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '14px', margin: '0 0 16px 0' }}>
            Get AI-powered draft analysis, prospect comparisons, and trade value insights.
          </p>
          <Link
            href="/scout-ai?team=chicago-bears&q=What%20should%20the%20Bears%20do%20in%20the%202026%20draft"
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
