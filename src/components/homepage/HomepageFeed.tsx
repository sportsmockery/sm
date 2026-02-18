// src/components/homepage/HomepageFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EditorPicksHero } from './EditorPicksHero';
import { TeamFilterTabs } from './TeamFilterTabs';
import { ForYouFeed } from './ForYouFeed';
import { TrendingSection } from './TrendingSection';

interface HomepageFeedProps {
  initialPosts: any[];
  editorPicks: any[];
  trendingPosts: any[];
  userTeamPreference: string | null;
  isLoggedIn: boolean;
}

const TEAM_SLUG_ABBREV: Record<string, string> = {
  'chicago-bears': 'CHI',
  'chicago-bulls': 'CHI',
  'chicago-cubs': 'CHC',
  'chicago-white-sox': 'CWS',
  'chicago-blackhawks': 'CHI',
  bears: 'CHI',
  bulls: 'CHI',
  cubs: 'CHC',
  'white-sox': 'CWS',
  blackhawks: 'CHI',
};

const PLATFORM_FEATURES = [
  {
    title: 'Scout AI',
    href: '/scout-ai',
    description: 'AI-powered sports intelligence for every question',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 1 8 8c0 3.4-2.1 6.3-5 7.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.5C6.1 16.3 4 13.4 4 10a8 8 0 0 1 8-8z" />
        <line x1="10" y1="22" x2="14" y2="22" />
      </svg>
    ),
  },
  {
    title: 'GM Trade Simulator',
    href: '/gm',
    description: 'Build trades and get instant AI grades',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 8 3 12 7 16" />
        <polyline points="17 8 21 12 17 16" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Mock Draft Engine',
    href: '/mock-draft',
    description: 'Simulate full drafts with real prospect data',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="9" y1="14" x2="15" y2="14" />
        <line x1="9" y1="18" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    title: 'Fan Hub',
    href: '/fan-zone',
    description: "Join the conversation with Chicago's most passionate fans",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Data Cosmos',
    href: '/datahub',
    description: 'Deep stats and analytics for every team',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'Original Shows',
    href: '/bears-film-room',
    description: 'Expert breakdowns and analysis shows',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

const TEAM_LOGOS = [
  { src: '/team-logos/bears.png', alt: 'Chicago Bears' },
  { src: '/team-logos/bulls.png', alt: 'Chicago Bulls' },
  { src: '/team-logos/cubs.png', alt: 'Chicago Cubs' },
  { src: '/team-logos/whitesox.png', alt: 'Chicago White Sox' },
  { src: '/team-logos/blackhawks.png', alt: 'Chicago Blackhawks' },
];

export function HomepageFeed({
  initialPosts = [],
  editorPicks = [],
  trendingPosts = [],
  userTeamPreference = null,
  isLoggedIn = false,
}: HomepageFeedProps) {
  const [activeTeam, setActiveTeam] = useState<string>('all');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (userTeamPreference && userTeamPreference !== 'all') {
      setActiveTeam(userTeamPreference);
    }
  }, [userTeamPreference]);

  // Ensure arrays are safe
  const safePosts = Array.isArray(initialPosts) ? initialPosts : [];
  const safeEditorPicks = Array.isArray(editorPicks) ? editorPicks : [];
  const safeTrendingPosts = Array.isArray(trendingPosts) ? trendingPosts : [];

  const filteredPosts =
    activeTeam === 'all'
      ? safePosts
      : safePosts.filter((post) => post.team_slug === activeTeam);

  // Build ticker items from trending posts
  const tickerSource = safeTrendingPosts.slice(0, 8);
  const tickerItems = tickerSource.map((post, i) => {
    const abbrev = TEAM_SLUG_ABBREV[post.team_slug] || 'CHI';
    return (
      <div className="ticker-item" key={`ticker-${i}`}>
        <span className="ticker-team">{abbrev}</span> {post.title}
      </div>
    );
  });

  return (
    <div className="homepage-feed">
      {/* ===== Row 1: Hero ===== */}
      <section className="sm-hero-bg homepage-hero">
        <div className="sm-grid-overlay" />
        <div className="glow-orb glow-red" style={{ top: '-100px', right: '-100px' }} />
        <div className="glow-orb glow-white" style={{ bottom: '-150px', left: '-150px' }} />

        <div className="sm-container hero-content">
          <div className="sm-tag animate-fade-in-up">
            <span className="pulse-dot" /> The Future of Chicago Sports
          </div>

          <h1 className="animate-fade-in-up delay-100">
            Your AI-powered
            <br />
            <span className="gradient-text">sports command center</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-200">
            AI-powered intelligence. Real-time scores. Immersive simulators. The
            most advanced Chicago sports platform ever built.
          </p>

          <div className="hero-buttons animate-fade-in-up delay-300">
            <Link href="/scout-ai" className="btn-primary">
              Explore Tools
            </Link>
            <a href="#feed" className="btn-secondary">
              Latest News &darr;
            </a>
          </div>

          <div className="hero-teams animate-fade-in-up delay-400">
            {TEAM_LOGOS.map((logo) =>
              imgErrors[logo.src] ? (
                <span
                  key={logo.alt}
                  style={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    opacity: 0.6,
                  }}
                >
                  {logo.alt.replace('Chicago ', '')}
                </span>
              ) : (
                <Image
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  width={48}
                  height={48}
                  onError={() =>
                    setImgErrors((prev) => ({ ...prev, [logo.src]: true }))
                  }
                />
              )
            )}
          </div>
        </div>
      </section>

      {/* ===== Row 2: Live Ticker ===== */}
      {tickerItems.length > 0 && (
        <div className="live-ticker">
          <div className="ticker-track">
            {tickerItems}
            {/* Duplicate set for seamless loop */}
            {tickerSource.map((post, i) => {
              const abbrev = TEAM_SLUG_ABBREV[post.team_slug] || 'CHI';
              return (
                <div className="ticker-item" key={`ticker-dup-${i}`}>
                  <span className="ticker-team">{abbrev}</span> {post.title}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Row 3: Featured Content (Editor Picks) ===== */}
      <section className="homepage-section">
        <div className="sm-container">
          <EditorPicksHero picks={safeEditorPicks} />
        </div>
      </section>

      {/* ===== Row 4: Latest Feed ===== */}
      <section id="feed" className="homepage-section">
        <div className="sm-container">
          <div className="section-header">
            <div className="sm-tag">Latest</div>
            <h2>Chicago Sports News</h2>
          </div>

          <TeamFilterTabs
            activeTeam={activeTeam}
            onTeamChange={setActiveTeam}
            userPreferredTeam={userTeamPreference}
          />

          <div className="homepage-content-grid">
            <main className="main-feed-column">
              <ForYouFeed
                posts={filteredPosts}
                isLoggedIn={isLoggedIn}
                isMobile={isMobile}
                showTrendingInline={isMobile}
                trendingPosts={safeTrendingPosts}
              />
            </main>

            {!isMobile && safeTrendingPosts.length > 0 && (
              <aside className="trending-sidebar">
                <TrendingSection posts={safeTrendingPosts} />
              </aside>
            )}
          </div>
        </div>
      </section>

      {/* ===== Row 5: Platform Features ===== */}
      <section className="homepage-section sm-hero-bg">
        <div className="sm-container">
          <div className="section-header" style={{ textAlign: 'center' }}>
            <div className="sm-tag">Platform</div>
            <h2>Everything. One ecosystem.</h2>
            <p className="section-subtitle">
              Every tool a Chicago sports fan needs — powered by AI, built for
              obsessives.
            </p>
          </div>

          <div className="platform-grid">
            {PLATFORM_FEATURES.map((feature) => (
              <div className="glass-card platform-card" key={feature.title}>
                <div className="platform-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <Link href={feature.href} className="platform-link">
                  Explore &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Row 6: CTA Block ===== */}
      <section className="homepage-section homepage-cta">
        <div className="sm-tag">Get Started</div>
        <h2>Ready for the future?</h2>
        <p>
          Join the most advanced Chicago sports platform ever built. AI
          intelligence, real-time data, and a community that lives and breathes
          the city.
        </p>
        <div className="cta-buttons">
          <Link href="/pricing" className="btn-primary">
            View Plans
          </Link>
          <Link href="/scout-ai" className="btn-secondary">
            Try Scout AI
          </Link>
        </div>
      </section>
    </div>
  );
}
