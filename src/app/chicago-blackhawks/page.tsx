import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame, fetchLastGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago Blackhawks | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago Blackhawks coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago Blackhawks Hub | Sports Mockery',
    description: 'Your #1 source for Blackhawks news, stats, schedule, and analysis',
    type: 'website',
  },
}

export const revalidate = 3600

async function getBlackhawksPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-blackhawks')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-blackhawks',
      publishedAt: post.published_at,
    }))
  } catch {
    return []
  }
}

export default async function BlackhawksHubPage() {
  const team = CHICAGO_TEAMS.blackhawks

  const [record, nextGame, lastGame, posts] = await Promise.all([
    fetchTeamRecord('blackhawks'),
    fetchNextGame('blackhawks'),
    fetchLastGame('blackhawks'),
    getBlackhawksPosts(12),
  ])

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} lastGame={lastGame} activeTab="overview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '1320px', margin: '0 auto' }}>
        <style>{`@media (min-width: 1024px) { .hub-grid-hawks { grid-template-columns: 2fr 1fr !important; } }`}</style>
        <div className="hub-grid-hawks" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
              <SectionHeader title="Latest Blackhawks News" />
              {posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {posts.slice(0, 6).map((post, index) => (
                    <ArticleCard key={post.id} post={post} isLarge={index === 0} />
                  ))}
                </div>
              ) : (
                <div className="glass-card glass-card-static" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--sm-text-muted)', margin: 0 }}>No Blackhawks articles found. Check back soon!</p>
                </div>
              )}
            </section>

            {posts.length > 6 && (
              <section>
                <SectionHeader title="More Blackhawks Stories" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {posts.slice(6, 12).map((post) => <ArticleCard key={post.id} post={post} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <SeasonSnapshotCard record={record} seasonLabel="2025-26 Season" />
            <QuickLinksCard slug="chicago-blackhawks" />
            <ARTourButton team="chicago-blackhawks" />
            <AskAIWidget teamSlug="chicago-blackhawks" teamLabel="Blackhawks" />
            <FanChatWidget teamLabel="Hawks" channel="blackhawks" />
          </div>
        </div>
      </div>
    </TeamHubLayout>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.5px', paddingBottom: '8px', borderBottom: '3px solid var(--sm-red)', margin: 0 }}>
        {title}
      </h2>
    </div>
  )
}

function ArticleCard({ post, isLarge = false }: { post: any; isLarge?: boolean }) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
        <article className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <style>{`@media (min-width: 768px) { .hawks-hero-row { flex-direction: row !important; } .hawks-hero-img { width: 50% !important; } }`}</style>
            <div className="hawks-hero-row" style={{ display: 'flex', flexDirection: 'column' }}>
              {post.featuredImage && (
                <div className="hawks-hero-img" style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', width: '100%' }}>
                  <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover', transition: 'transform 0.3s' }} priority />
                </div>
              )}
              <div style={{ padding: '24px', flex: 1 }}>
                <span className="sm-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>Blackhawks</span>
                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontSize: '20px', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</h3>
                {post.excerpt && <p style={{ color: 'var(--sm-text-muted)', fontSize: '15px', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
                  <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group" style={{ textDecoration: 'none', display: 'block' }}>
      <article className="glass-card glass-card-sm" style={{ display: 'flex', gap: '16px', overflow: 'hidden' }}>
        {post.featuredImage && (
          <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: 'var(--sm-radius-sm)', overflow: 'hidden' }}>
            <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover', transition: 'transform 0.3s' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontSize: '15px', fontWeight: 600, lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SeasonSnapshotCard({ record, seasonLabel }: { record: { wins: number; losses: number; otLosses?: number } | null; seasonLabel: string }) {
  const formatRecord = () => {
    if (!record) return '--'
    const ot = record.otLosses ? `-${record.otLosses}` : ''
    return `${record.wins}-${record.losses}${ot}`
  }

  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>Season Snapshot</h3>
        <span className="sm-tag">{seasonLabel}</span>
      </div>
      <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--sm-border)' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{formatRecord()}</div>
        <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--sm-text-dim)', fontWeight: 600, marginTop: '4px' }}>Record</div>
      </div>
    </div>
  )
}

function QuickLinksCard({ slug }: { slug: string }) {
  const links = [
    { href: `/${slug}/schedule`, label: 'Schedule' },
    { href: `/${slug}/roster`, label: 'Roster' },
    { href: `/${slug}/stats`, label: 'Team Stats' },
    { href: `/${slug}/scores`, label: 'Scores' },
  ]
  return (
    <div className="glass-card glass-card-static">
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: '0 0 16px 0' }}>Quick Links</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map((link) => (
          <Link key={link.label} href={link.href} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 'var(--sm-radius-sm)', color: 'var(--sm-text)', textDecoration: 'none', fontSize: '14px', fontWeight: 500, background: 'var(--sm-surface)', border: '1px solid var(--sm-border)', transition: 'background 0.2s' }}>
            <span>{link.label}</span>
            <svg width="16" height="16" style={{ color: 'var(--sm-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AskAIWidget({ teamSlug, teamLabel }: { teamSlug: string; teamLabel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sm-gradient-subtle)' }}>
          <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} />
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>Scout AI</h3>
          <p style={{ color: 'var(--sm-text-dim)', fontSize: '12px', margin: 0 }}>Get instant answers about the {teamLabel}</p>
        </div>
      </div>
      <Link href={`/scout-ai?team=${teamSlug}`} className="btn btn-md btn-primary" style={{ display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none', borderRadius: 'var(--sm-radius-pill)' }}>Ask Scout</Link>
    </div>
  )
}

function FanChatWidget({ teamLabel, channel }: { teamLabel: string; channel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sm-gradient-subtle)' }}>
          <svg width="20" height="20" style={{ color: 'var(--sm-red-light)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>{teamLabel} Fan Chat</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--sm-text-dim)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--sm-success)', display: 'inline-block' }} />
            <span>Fans online</span>
          </div>
        </div>
      </div>
      <Link href={`/fan-chat?channel=${channel}`} className="btn btn-md btn-secondary" style={{ display: 'block', width: '100%', textAlign: 'center', textDecoration: 'none', borderRadius: 'var(--sm-radius-pill)' }}>Join {teamLabel} Chat</Link>
    </div>
  )
}
