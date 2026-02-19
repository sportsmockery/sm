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

const PLATFORM_TOOLS = [
  {
    title: 'Scout AI',
    href: '/scout-ai',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a8 8 0 0 1 8 8c0 3.4-2.1 6.3-5 7.5V20a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.5C6.1 16.3 4 13.4 4 10a8 8 0 0 1 8-8z" />
        <line x1="10" y1="22" x2="14" y2="22" />
      </svg>
    ),
  },
  {
    title: 'Trade Sim',
    href: '/gm',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 8 3 12 7 16" />
        <polyline points="17 8 21 12 17 16" />
        <line x1="3" y1="12" x2="21" y2="12" />
      </svg>
    ),
  },
  {
    title: 'Mock Draft',
    href: '/mock-draft',
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
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Data Hub',
    href: '/datahub',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: 'SM+',
    href: '/pricing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
];

const TEAM_LOGOS = [
  { slug: 'chicago-bears', src: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', alt: 'Chicago Bears' },
  { slug: 'chicago-bulls', src: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', alt: 'Chicago Bulls' },
  { slug: 'chicago-cubs', src: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', alt: 'Chicago Cubs' },
  { slug: 'chicago-white-sox', src: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', alt: 'Chicago White Sox' },
  { slug: 'chicago-blackhawks', src: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', alt: 'Chicago Blackhawks' },
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

  const safePosts = Array.isArray(initialPosts) ? initialPosts : [];
  const safeEditorPicks = Array.isArray(editorPicks) ? editorPicks : [];
  const safeTrendingPosts = Array.isArray(trendingPosts) ? trendingPosts : [];

  const filteredPosts =
    activeTeam === 'all'
      ? safePosts
      : safePosts.filter((post) => post.team_slug === activeTeam);

  return (
    <div className="homepage-feed">
      {/* ===== SECTION 1: Hero ===== */}
      <section className="sm-hero-bg homepage-hero">
        <div className="sm-grid-overlay" />
        <div className="glow-orb glow-red" style={{ top: '-100px', right: '-150px', width: 350, height: 350 }} />

        <div className="sm-container hero-content">
          <div className="sm-tag animate-fade-in-up">
            <span className="pulse-dot" /> Live Coverage
          </div>

          <h1 className="hero-headline animate-fade-in-up delay-100">
            Welcome to<br />
            <span className="gradient-text">Sports Mockery</span><br />
            2.0
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-200">
            Breaking news, real-time scores, and AI-powered analysis — all five Chicago teams, one platform.
          </p>

          <div className="team-logo-row animate-fade-in-up delay-300">
            {TEAM_LOGOS.map((logo) => (
              <Link key={logo.slug} href={`/${logo.slug}`} className="team-logo-link">
                <Image src={logo.src} alt={logo.alt} width={32} height={32} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECTION 2: Sticky Team Filter Bar ===== */}
      <div className="team-filter-bar-sticky">
        <div className="sm-container">
          <TeamFilterTabs
            activeTeam={activeTeam}
            onTeamChange={setActiveTeam}
            userPreferredTeam={userTeamPreference}
          />
        </div>
      </div>

      {/* ===== SECTION 3: Featured Content ===== */}
      <section className="homepage-section">
        <div className="sm-container">
          <div className="section-header">
            <span className="sm-tag">Trending Now</span>
            <h2>What Chicago is Talking About</h2>
          </div>
          <EditorPicksHero picks={safeEditorPicks} />
        </div>
      </section>

      {/* ===== SECTION 4: Main Content + Sidebar ===== */}
      <section id="feed" className="homepage-section">
        <div className="sm-container">
          <div className="content-wrapper">
            {/* Main feed */}
            <main className="main-feed">
              <div className="section-header">
                <span className="sm-tag">Latest</span>
                <h2>Chicago Sports News</h2>
              </div>
              <ForYouFeed
                posts={filteredPosts}
                isLoggedIn={isLoggedIn}
                isMobile={isMobile}
                showTrendingInline={isMobile}
                trendingPosts={safeTrendingPosts}
              />
            </main>

            {/* Sidebar (desktop) */}
            <aside className="sidebar">
              {/* Widget 1: Platform Tools */}
              <div className="sidebar-widget glass-card-static">
                <h4 className="widget-title">Platform Tools</h4>
                <div className="tool-grid">
                  {PLATFORM_TOOLS.map((tool) => (
                    <Link key={tool.title} href={tool.href} className="tool-link">
                      <div className="tool-icon">{tool.icon}</div>
                      <span>{tool.title}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Widget 2: Trending Stories */}
              {safeTrendingPosts.length > 0 && (
                <TrendingSection posts={safeTrendingPosts} />
              )}
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
