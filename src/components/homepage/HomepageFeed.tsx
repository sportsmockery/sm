// src/components/homepage/HomepageFeed.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { EditorPicksHero } from './EditorPicksHero';
import { TeamFilterTabs } from './TeamFilterTabs';
import { ForYouFeed } from './ForYouFeed';
import { HomepageSidebar } from './HomepageSidebar';

const TEAM_LABELS: Record<string, string> = {
  bears: 'Bears',
  bulls: 'Bulls',
  blackhawks: 'Blackhawks',
  cubs: 'Cubs',
  'white-sox': 'White Sox',
};

/* ── Back to Top Button ── */
function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 2);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </button>
  );
}

/* ── Scroll Progress Bar ── */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      ref.current.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={ref} className="scroll-progress" />;
}

/* ── Hero Particle Canvas ── */
function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: { x: number; y: number; r: number; dx: number; dy: number; opacity: number }[] = [];

    function resize() {
      const hero = canvas!.parentElement;
      if (!hero) return;
      canvas!.width = hero.offsetWidth;
      canvas!.height = hero.offsetHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(40, Math.floor(canvas!.width / 30));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          r: Math.random() * 1.5 + 0.5,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const color = isDark ? '255,255,255' : '0,0,0';

      particles.forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${color},${p.opacity})`;
        ctx!.fill();

        particles.forEach((p2) => {
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 120 && dist > 0) {
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = `rgba(${color},${(1 - dist / 120) * 0.06})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        });

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas!.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas!.height) p.dy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    const handleResize = () => { resize(); createParticles(); };
    window.addEventListener('resize', handleResize);

    const handleVisibility = () => {
      if (document.hidden) cancelAnimationFrame(animId);
      else draw();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-particles" />;
}

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
  const { isAuthenticated } = useAuth();
  const actuallyLoggedIn = isAuthenticated || isLoggedIn;

  // Feature 1: Team preference memory (localStorage)
  const handleTeamChange = useCallback((team: string) => {
    setActiveTeam(team);
    try {
      if (team === 'all') {
        localStorage.removeItem('sm-preferred-team');
      } else {
        localStorage.setItem('sm-preferred-team', team);
      }
    } catch {}
  }, []);

  const clearTeamPreference = useCallback(() => {
    setActiveTeam('all');
    try { localStorage.removeItem('sm-preferred-team'); } catch {}
  }, []);

  // Load team preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sm-preferred-team');
      if (saved && saved !== 'all') {
        setActiveTeam(saved);
        return; // localStorage takes priority
      }
    } catch {}
    // Fall back to server-side user preference
    if (userTeamPreference && userTeamPreference !== 'all') {
      setActiveTeam(userTeamPreference);
    }
  }, [userTeamPreference]);

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

  // Scroll-reveal IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Pause CSS animations when tab is hidden
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleVisibility = () => {
      if (feedRef.current) {
        feedRef.current.style.setProperty(
          '--anim-state',
          document.hidden ? 'paused' : 'running'
        );
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const safePosts = Array.isArray(initialPosts) ? initialPosts : [];
  const safeEditorPicks = Array.isArray(editorPicks) ? editorPicks : [];
  const safeTrendingPosts = Array.isArray(trendingPosts) ? trendingPosts : [];

  const filteredPosts =
    activeTeam === 'all'
      ? safePosts
      : safePosts.filter((post) => post.team_slug === activeTeam);

  // Filter editor picks by team too — fall back to top 3 from filtered posts
  const filteredEditorPicks =
    activeTeam === 'all'
      ? safeEditorPicks
      : (() => {
          const teamPicks = safeEditorPicks.filter((p: any) => p.team_slug === activeTeam);
          return teamPicks.length > 0
            ? teamPicks
            : filteredPosts.slice(0, 3).map((p: any, i: number) => ({ ...p, pinned_slot: i + 1 }));
        })();

  return (
    <div className="homepage-feed" ref={feedRef}>
      {/* ===== Scroll Progress Bar ===== */}
      <ScrollProgress />

      {/* ===== SECTION 1: Hero ===== */}
      <section className="sm-hero-bg homepage-hero">
        {/* Ambient layers */}
        <div className="hero-bg-mesh" />
        <div className="sm-grid-overlay" />
        <div className="glow-orb glow-red-1" />
        <div className="glow-orb glow-red-2" />
        <HeroParticles />

        <div className="sm-container hero-content">
          <div className="sm-tag animate-entrance entrance-delay-1">
            <span className="pulse-dot" /> Where Chicago Fans Come First
          </div>

          <h1 className="hero-headline animate-entrance entrance-delay-2" style={{ whiteSpace: 'nowrap' }}>
            Sports Mockery <span className="gradient-text">2.0</span>
          </h1>

          <p className="hero-subtitle animate-entrance entrance-delay-3">
            Breaking news, real-time scores, and AI-powered analysis — all five Chicago teams, one platform.
          </p>

          <div className="team-logo-row animate-entrance entrance-delay-4">
            {TEAM_LOGOS.map((logo) => (
              <div key={logo.slug} className="team-logo-item">
                <Link href={`/${logo.slug}`} className="team-logo-link">
                  <Image src={logo.src} alt={logo.alt} width={32} height={32} />
                </Link>
                <span className="team-logo-label">{logo.label}</span>
              </div>
            ))}
          </div>

          <Link href="/search" className="hero-search-bar animate-entrance entrance-delay-5">
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
            onTeamChange={handleTeamChange}
            userPreferredTeam={userTeamPreference}
          />
        </div>
      </div>

      {/* ===== Personalize Banner (logged-in only) ===== */}
      {actuallyLoggedIn && (
        <div className="sm-container">
          <Link href="/feed" className="personalize-banner">
            <span className="personalize-text">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Personalize your feed
            </span>
            <span className="personalize-arrow">&rarr;</span>
          </Link>
        </div>
      )}

      {/* ===== SECTION 3: Featured Content ===== */}
      <section className="homepage-section">
        <div className="sm-container">
          <div className="section-header scroll-reveal">
            <span className="sm-tag">Trending Now</span>
            <h2 style={{ fontFamily: "var(--font-bebas-neue), 'Bebas Neue', Impact, sans-serif" }}>What Chicago is Talking About</h2>
          </div>
          <EditorPicksHero picks={filteredEditorPicks} />
        </div>
      </section>

      {/* ===== SECTION 4: Main Content + Sidebar ===== */}
      <section id="feed" className="homepage-section">
        <div className="sm-container">
          {/* Team preference banner */}
          {activeTeam !== 'all' && TEAM_LABELS[activeTeam] && (
            <div className="team-pref-banner">
              Showing <strong>{TEAM_LABELS[activeTeam]}</strong> news first
              <button onClick={clearTeamPreference} className="team-pref-clear">Show All</button>
            </div>
          )}
          <div className="content-wrapper">
            {/* Main feed */}
            <main className="main-feed">
              <div className="section-header scroll-reveal">
                <span className="sm-tag">Latest</span>
                <h2>Chicago Sports News</h2>
              </div>
              <ForYouFeed
                posts={filteredPosts}
                isLoggedIn={isLoggedIn}
                isMobile={isMobile}
                showTrendingInline={isMobile}
                trendingPosts={safeTrendingPosts}
                activeTeam={activeTeam}
              />
            </main>

            {/* Sidebar (desktop) */}
            <HomepageSidebar trendingPosts={safeTrendingPosts} />
          </div>
        </div>
      </section>

      {/* Back to Top */}
      <BackToTop />
    </div>
  );
}
