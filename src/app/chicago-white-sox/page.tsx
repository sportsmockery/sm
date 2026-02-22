import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TeamHubLayout } from '@/components/team'
import ARTourButton from '@/components/ar/ARTourButton'
import { CHICAGO_TEAMS, fetchTeamRecord, fetchNextGame, fetchLastGame } from '@/lib/team-config'
import { supabaseAdmin } from '@/lib/supabase-server'

export const metadata: Metadata = {
  title: 'Chicago White Sox | News, Stats, Schedule & Roster | SportsMockery',
  description: 'Complete Chicago White Sox coverage including latest news, team stats, schedule, roster, and expert analysis.',
  openGraph: {
    title: 'Chicago White Sox Hub | Sports Mockery',
    description: 'Your #1 source for White Sox news, stats, schedule, and analysis',
    type: 'website',
  },
}

export const revalidate = 3600

async function getWhiteSoxPosts(limit: number = 12) {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('sm_posts')
      .select(`
        id, title, slug, excerpt, featured_image, published_at,
        sm_categories!inner(slug, name)
      `)
      .eq('status', 'published')
      .eq('sm_categories.slug', 'chicago-white-sox')
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) return []
    return posts.map((post: any) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featuredImage: post.featured_image,
      categorySlug: post.sm_categories?.slug || 'chicago-white-sox',
      publishedAt: post.published_at,
    }))
  } catch {
    return []
  }
}

export default async function WhiteSoxHubPage() {
  const team = CHICAGO_TEAMS.whitesox

  const [record, nextGame, lastGame, posts] = await Promise.all([
    fetchTeamRecord('whitesox'),
    fetchNextGame('whitesox'),
    fetchLastGame('whitesox'),
    getWhiteSoxPosts(12),
  ])

  return (
    <TeamHubLayout team={team} record={record} nextGame={nextGame} lastGame={lastGame} activeTab="overview">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px', maxWidth: '1320px', margin: '0 auto' }}>
        <style>{`@media (min-width: 1024px) { .hub-grid-sox { grid-template-columns: 2fr 1fr !important; } }`}</style>
        <div className="hub-grid-sox" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="lg:hidden">
              <SeasonSnapshotCard record={record} seasonLabel="2025 Season" />
            </div>

            {/* Feature Cards */}
            <section>
              <style>{`
                .sox-features-grid { display: flex; flex-direction: column; gap: 10px; }
                .sox-feature-card {
                  position: relative; background: var(--sm-card); border: 1px solid var(--sm-border);
                  border-radius: 14px; padding: 16px 20px; overflow: hidden;
                  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                  display: flex; flex-direction: row; align-items: center; gap: 16px;
                }
                .sox-feature-card::before {
                  content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
                  background: linear-gradient(180deg, #27251F, #C4CED4); opacity: 0.7; transition: opacity 0.4s;
                }
                .sox-feature-card:hover { transform: translateX(4px); border-color: rgba(39,37,31,0.3); background: var(--sm-card-hover); }
                .sox-feature-card:hover::before { opacity: 1; }
                .sox-feature-btn {
                  display: inline-flex; align-items: center; gap: 6px; padding: 8px 18px;
                  border-radius: 100px; font-family: 'Space Grotesk', sans-serif; font-size: 13px;
                  font-weight: 600; text-decoration: none; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
                }
              `}</style>
              <div className="sox-features-grid">
                <SoxFeatureCard href="/chicago-white-sox/trade-rumors" icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>} title="Trade Rumors" description="Live White Sox trade tracker and rebuild news." buttonText="Latest Rumors" />
                <SoxFeatureCard href="/chicago-white-sox/draft-tracker" icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>} title="Draft Tracker" description="2026 MLB draft prospects, mock drafts, and scouting reports." buttonText="Mock Draft" />
                <SoxFeatureCard href="/chicago-white-sox/cap-tracker" icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} title="Payroll Tracker" description="Payroll breakdown, contracts, luxury tax status." buttonText="Payroll" />
                <SoxFeatureCard href="/chicago-white-sox/depth-chart" icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>} title="Depth Chart" description="Interactive roster with lineup positions." buttonText="Lineup" />
                <SoxFeatureCard href="/chicago-white-sox/game-center" icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>} title="Game Center" description="Live scores, play-by-play, previews." buttonText="Next Game" />
              </div>
            </section>

            <section>
              <SectionHeader title="Latest White Sox News" />
              {posts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {posts.slice(0, 6).map((post, index) => (
                    <ArticleCard key={post.id} post={post} isLarge={index === 0} />
                  ))}
                </div>
              ) : (
                <div className="glass-card glass-card-static" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <p style={{ color: 'var(--sm-text-muted)', margin: 0 }}>No White Sox articles found. Check back soon!</p>
                </div>
              )}
            </section>

            {posts.length > 6 && (
              <section>
                <SectionHeader title="More White Sox Stories" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {posts.slice(6, 12).map((post) => <ArticleCard key={post.id} post={post} />)}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="hidden lg:block">
              <SeasonSnapshotCard record={record} seasonLabel="2025 Season" />
            </div>
            <QuickLinksCard slug="chicago-white-sox" />
            <ARTourButton team="chicago-white-sox" />
            <AskAIWidget teamSlug="chicago-white-sox" teamLabel="White Sox" />
            <FanChatWidget teamLabel="Sox" channel="whitesox" />
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
            <style>{`@media (min-width: 768px) { .sox-hero-row { flex-direction: row !important; } .sox-hero-img { width: 50% !important; } }`}</style>
            <div className="sox-hero-row" style={{ display: 'flex', flexDirection: 'column' }}>
              {post.featuredImage && (
                <div className="sox-hero-img" style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', width: '100%' }}>
                  <Image src={post.featuredImage} alt="" fill style={{ objectFit: 'cover', transition: 'transform 0.3s' }} priority />
                </div>
              )}
              <div style={{ padding: '24px', flex: 1 }}>
                <span className="sm-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>White Sox</span>
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

function SoxFeatureCard({ href, icon, title, description, buttonText }: { href: string; icon: React.ReactNode; title: string; description: string; buttonText: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="sox-feature-card">
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(39,37,31,0.3), rgba(196,206,212,0.15))', border: '1px solid rgba(39,37,31,0.2)', color: 'var(--sm-text)', flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontSize: '15px', fontWeight: 700, letterSpacing: '-0.2px', margin: '0 0 2px 0' }}>{title}</h3>
          <p style={{ color: 'var(--sm-text-muted)', fontSize: '12px', lineHeight: 1.4, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{description}</p>
        </div>
        <span className="sox-feature-btn" style={{ backgroundColor: '#27251F', color: '#ffffff' }}>
          {buttonText}
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
        </span>
      </div>
    </Link>
  )
}

function SeasonSnapshotCard({ record, seasonLabel }: { record: { wins: number; losses: number } | null; seasonLabel: string }) {
  return (
    <div className="glass-card glass-card-static">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", color: 'var(--sm-text)', fontWeight: 700, fontSize: '16px', margin: 0 }}>Season Snapshot</h3>
        <span className="sm-tag">{seasonLabel}</span>
      </div>
      <div style={{ textAlign: 'center', padding: '16px 0', borderTop: '1px solid var(--sm-border)' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--sm-text)', fontFamily: "'Space Grotesk', sans-serif" }}>{record ? `${record.wins}-${record.losses}` : '--'}</div>
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
