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
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionHeader title="Latest Blackhawks News" team={team} />

            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.slice(0, 6).map((post, index) => (
                  <ArticleCard key={post.id} post={post} team={team} isLarge={index === 0} />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-12"
                style={{
                  borderRadius: 'var(--sm-radius-lg)',
                  backgroundColor: 'var(--sm-card)',
                  border: '1px solid var(--sm-border)',
                }}
              >
                <p style={{ color: 'var(--sm-text-muted)' }}>No Blackhawks articles found. Check back soon!</p>
              </div>
            )}
          </section>

          {posts.length > 6 && (
            <section>
              <SectionHeader title="More Blackhawks Stories" team={team} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.slice(6, 12).map((post) => <ArticleCard key={post.id} post={post} team={team} />)}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <SeasonSnapshotCard team={team} record={record} seasonLabel="2025-26 Season" />
          <QuickLinksCard team={team} teamSlug="chicago-blackhawks" />
          <ARTourButton team="chicago-blackhawks" />
          <AskAIWidget team={team} teamLabel="Blackhawks" />
          <FanChatWidget team={team} teamLabel="Hawks" channel="blackhawks" />
        </div>
      </div>
    </TeamHubLayout>
  )
}

function SectionHeader({ title, team }: { title: string; team: typeof CHICAGO_TEAMS.blackhawks }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2
        style={{
          fontFamily: "'Montserrat', sans-serif",
          color: 'var(--sm-text)',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          paddingBottom: '8px',
          borderBottom: `3px solid ${team.primaryColor}`,
        }}
      >
        {title}
      </h2>
    </div>
  )
}

function ArticleCard({ post, team, isLarge = false }: { post: any; team: typeof CHICAGO_TEAMS.blackhawks; isLarge?: boolean }) {
  const href = `/${post.categorySlug}/${post.slug}`

  if (isLarge) {
    return (
      <Link href={href} className="group block">
        <article
          className="overflow-hidden transition-all duration-300"
          style={{ borderRadius: 'var(--sm-radius-lg)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
        >
          <div className="flex flex-col md:flex-row">
            {post.featuredImage && (
              <div className="relative aspect-[16/9] md:aspect-auto md:w-1/2 overflow-hidden">
                <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.primaryColor }} />
              </div>
            )}
            <div className="p-5 md:p-6 flex-1">
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: team.primaryColor }}>Blackhawks</span>
              <h3
                className="font-bold mt-2 line-clamp-3 group-hover:underline"
                style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)', fontSize: '20px', lineHeight: '1.3' }}
              >
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="mt-3 line-clamp-2" style={{ color: 'var(--sm-text-muted)', fontSize: '15px', lineHeight: '1.6' }}>{post.excerpt}</p>
              )}
              <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--sm-text-dim)' }}>
                <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <article
        className="overflow-hidden flex gap-4 p-3 transition-all duration-200"
        style={{ borderRadius: 'var(--sm-radius-lg)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}
      >
        {post.featuredImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
            <Image src={post.featuredImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-2 group-hover:underline" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)', fontSize: '15px', lineHeight: '1.4' }}>{post.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--sm-text-dim)' }}>
            <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        </div>
      </article>
    </Link>
  )
}

function SeasonSnapshotCard({ team, record, seasonLabel }: { team: typeof CHICAGO_TEAMS.blackhawks; record: { wins: number; losses: number; otLosses?: number } | null; seasonLabel: string }) {
  const formatRecord = () => {
    if (!record) return '--'
    const ot = record.otLosses ? `-${record.otLosses}` : ''
    return `${record.wins}-${record.losses}${ot}`
  }

  return (
    <div className="overflow-hidden" style={{ borderRadius: 'var(--sm-radius-lg)', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      <div className="px-5 py-4" style={{ backgroundColor: team.primaryColor }}>
        <div className="flex items-center gap-3">
          <Image src={team.logo} alt={team.name} width={40} height={40} className="w-10 h-10 object-contain" unoptimized />
          <div>
            <h3 className="font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>Season Snapshot</h3>
            <p className="text-xs text-white/70">{seasonLabel}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="text-center pb-4" style={{ borderBottom: '1px solid var(--sm-border)' }}>
          <div className="text-4xl font-bold" style={{ color: team.primaryColor }}>{formatRecord()}</div>
          <div className="text-sm mt-1" style={{ color: 'var(--sm-text-muted)' }}>Record</div>
        </div>
      </div>
    </div>
  )
}

function QuickLinksCard({ team, teamSlug }: { team: typeof CHICAGO_TEAMS.blackhawks; teamSlug: string }) {
  const links = [
    { href: `/${teamSlug}/schedule`, label: 'Schedule' },
    { href: `/${teamSlug}/roster`, label: 'Roster' },
    { href: `/${teamSlug}/stats`, label: 'Team Stats' },
    { href: `/${teamSlug}/scores`, label: 'Scores' },
  ]

  return (
    <div style={{ borderRadius: 'var(--sm-radius-lg)', padding: '24px', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      <h3 className="font-bold mb-4" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>Quick Links</h3>
      <div className="space-y-2">
        {links.map((link) => (
          <Link key={link.label} href={link.href} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors" style={{ color: 'var(--sm-text)' }}>
            <span className="text-sm font-medium">{link.label}</span>
            <svg className="w-4 h-4 ml-auto" style={{ color: 'var(--sm-text-dim)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

function AskAIWidget({ team, teamLabel }: { team: typeof CHICAGO_TEAMS.blackhawks; teamLabel: string }) {
  return (
    <div style={{ borderRadius: 'var(--sm-radius-lg)', padding: '24px', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <Image src="/downloads/scout-v2.png" alt="Scout AI" width={20} height={20} className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>Scout AI</h3>
          <p className="text-xs" style={{ color: 'var(--sm-text-dim)' }}>Get instant answers about the {teamLabel}</p>
        </div>
      </div>
      <Link href={`/scout-ai?team=${team.slug}`} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px 20px', borderRadius: '100px', fontWeight: 600, fontSize: '14px', color: '#fff', backgroundColor: team.primaryColor, textDecoration: 'none' }}>Ask Scout</Link>
    </div>
  )
}

function FanChatWidget({ team, teamLabel, channel }: { team: typeof CHICAGO_TEAMS.blackhawks; teamLabel: string; channel: string }) {
  return (
    <div style={{ borderRadius: 'var(--sm-radius-lg)', padding: '24px', backgroundColor: 'var(--sm-card)', border: '1px solid var(--sm-border)' }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${team.primaryColor}20` }}>
          <svg className="w-5 h-5" style={{ color: team.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
        </div>
        <div>
          <h3 className="font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: 'var(--sm-text)' }}>{teamLabel} Fan Chat</h3>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--sm-text-dim)' }}>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span>Fans online</span>
          </div>
        </div>
      </div>
      <Link href={`/fan-chat?channel=${channel}`} style={{ display: 'block', width: '100%', textAlign: 'center', padding: '12px 20px', borderRadius: '100px', fontWeight: 600, fontSize: '14px', color: '#fff', backgroundColor: team.primaryColor, textDecoration: 'none' }}>Join {teamLabel} Chat</Link>
    </div>
  )
}
