// src/components/homepage/HomepageFeed.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { EditorPicksHero } from './EditorPicksHero';
import { TeamFilterTabs } from './TeamFilterTabs';
import { ForYouFeed } from './ForYouFeed';
import { HomepageSidebar } from './HomepageSidebar';

interface HomepageFeedProps {
  initialPosts: any[];
  editorPicks: any[];
  trendingPosts: any[];
  userTeamPreference: string | null;
  isLoggedIn: boolean;
}

const TEAM_LOGOS = [
  { slug: 'chicago-bears', src: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', alt: 'Chicago Bears', label: 'Bears' },
  { slug: 'chicago-bulls', src: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', alt: 'Chicago Bulls', label: 'Bulls' },
  { slug: 'chicago-cubs', src: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', alt: 'Chicago Cubs', label: 'Cubs' },
  { slug: 'chicago-white-sox', src: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', alt: 'Chicago White Sox', label: 'White Sox' },
  { slug: 'chicago-blackhawks', src: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', alt: 'Chicago Blackhawks', label: 'Hawks' },
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
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cmd+K / Ctrl+K shortcut to navigate to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        router.push('/search');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [router]);

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
            <span className="pulse-dot" /> Chicago Sports Hub
          </div>

          <h1 className="hero-headline" style={{ whiteSpace: 'nowrap' }}>
            Sports Mockery <span className="gradient-text">2.0</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up delay-200">
            Breaking news, real-time scores, and AI-powered analysis — all five Chicago teams, one platform.
          </p>

          <div className="team-logo-row animate-fade-in-up delay-300">
            {TEAM_LOGOS.map((logo) => (
              <div key={logo.slug} className="team-logo-item">
                <Link href={`/${logo.slug}`} className="team-logo-link">
                  <Image src={logo.src} alt={logo.alt} width={32} height={32} />
                </Link>
                <span className="team-logo-label">{logo.label}</span>
              </div>
            ))}
          </div>

          <Link href="/search" className="hero-search-bar animate-fade-in-up delay-300">
            <svg className="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="search-placeholder">Search articles, teams, players...</span>
            <kbd>⌘K</kbd>
          </Link>
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
            <HomepageSidebar trendingPosts={safeTrendingPosts} />
          </div>
        </div>
      </section>
    </div>
  );
}
