// src/components/homepage/HomepageFeed.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { useAuth } from '@/contexts/AuthContext';
import { EditorPicksHero } from './EditorPicksHero';
import { TeamFilterTabs } from './TeamFilterTabs';
import { ForYouFeed } from './ForYouFeed';
import { HomepageSidebar } from './HomepageSidebar';
import { ScoutSearchBox } from './ScoutSearchBox';

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

/* ── Interactive Glow Orbs ── */
function GlowOrbs({ posts }: { posts: any[] }) {
  const [activeOrb, setActiveOrb] = useState<number | null>(null);
  const [postIndex, setPostIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Sort posts: highest engagement_score first, then by published_at (latest first)
  const sortedPosts = useMemo(() => {
    if (!posts.length) return [];
    const hasScore = posts.filter((p: any) => p.engagement_score != null && p.engagement_score > 0);
    const noScore = posts.filter((p: any) => !p.engagement_score || p.engagement_score <= 0);
    // Sort scored posts by score desc, then remaining by published_at desc
    hasScore.sort((a: any, b: any) => (b.engagement_score || 0) - (a.engagement_score || 0));
    noScore.sort((a: any, b: any) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    return [...hasScore, ...noScore];
  }, [posts]);

  // Close on click outside
  useEffect(() => {
    if (activeOrb === null) return;
    const handleClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setActiveOrb(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [activeOrb]);

  const handleOrbClick = (orbIndex: number) => {
    if (activeOrb === orbIndex) {
      // Same orb clicked again — show next post
      setPostIndex((prev) => (prev + 1) % Math.max(1, sortedPosts.length));
    } else {
      // Different orb — if first ever click use index 0, otherwise advance
      if (activeOrb !== null) {
        setPostIndex((prev) => (prev + 1) % Math.max(1, sortedPosts.length));
      }
      setActiveOrb(orbIndex);
    }
  };

  const post = sortedPosts[postIndex];
  const postUrl = post
    ? post.category_slug
      ? `/${post.category_slug}/${post.slug}`
      : `/${post.slug}`
    : '#';

  return (
    <>
      <div
        className="glow-orb glow-red-1"
        onClick={() => handleOrbClick(0)}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      />
      <div
        className="glow-orb glow-red-2"
        onClick={() => handleOrbClick(1)}
        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
      />

      {activeOrb !== null && post && (
        <div
          ref={cardRef}
          style={{
            position: 'absolute',
            top: activeOrb === 0 ? '40px' : 'auto',
            bottom: activeOrb === 1 ? '40px' : 'auto',
            right: activeOrb === 0 ? '20px' : 'auto',
            left: activeOrb === 1 ? '20px' : 'auto',
            zIndex: 20,
            maxWidth: 320,
            width: '90%',
            animation: 'orbCardReveal 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          <Link href={postUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                background: 'rgba(10,10,10,0.92)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(188,0,0,0.25)',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 40px rgba(188,0,0,0.1)',
              }}
            >
              {post.featured_image && (
                <div style={{ position: 'relative', width: '100%', height: 140, overflow: 'hidden' }}>
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="320px"
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 40,
                    background: 'linear-gradient(transparent, rgba(10,10,10,0.92))',
                  }} />
                </div>
              )}
              <div style={{ padding: '12px 16px 14px' }}>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                  color: '#bc0000',
                  marginBottom: 6,
                }}>
                  Suggested for you
                </div>
                <div style={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  color: '#fff',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>
                  {post.title}
                </div>
                {post.category?.name && (
                  <div style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.4)',
                    marginTop: 6,
                  }}>
                    {post.category.name}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      )}
    </>
  );
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

/* ── Ambient Stat Visuals ── */
function AmbientStats({ posts }: { posts: any[] }) {
  const stats = useMemo(() => {
    const totalArticles = posts.length;
    const trendingCount = posts.filter((p: any) => p.is_trending).length;
    const totalViews = posts.reduce((sum: number, p: any) => sum + (p.views || 0), 0);
    const teamCount = new Set(posts.map((p: any) => p.team_slug).filter(Boolean)).size;
    return [
      { label: 'Articles', value: totalArticles },
      { label: 'Trending', value: trendingCount },
      { label: 'Views', value: totalViews >= 1000 ? `${(totalViews / 1000).toFixed(0)}K` : totalViews },
      { label: 'Teams', value: teamCount },
    ];
  }, [posts]);

  return (
    <div className="ambient-stats" aria-hidden="true">
      {stats.map((stat, i) => (
        <div key={stat.label} className={`ambient-stat ambient-stat-${i}`}>
          <span className="ambient-stat-value">{stat.value}</span>
          <span className="ambient-stat-label">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Parallax Hero Field ── */
function useParallaxHero(heroRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const hero = heroRef.current;
    if (!hero) return;

    const layers = hero.querySelectorAll<HTMLElement>('.parallax-layer');
    const heroContent = hero.querySelector<HTMLElement>('.hero-content');

    // Scroll-based parallax
    const onScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = hero.offsetHeight;
      if (scrollY > heroHeight * 1.5) return; // skip if past hero

      layers.forEach((layer) => {
        const speed = parseFloat(layer.dataset.speed || '0.3');
        layer.style.transform = `translateY(${scrollY * speed}px) translateZ(0)`;
      });
    };

    // Cursor move effect: slight scale + tilt on hero content
    const onMouseMove = (e: MouseEvent) => {
      if (!heroContent) return;
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      heroContent.style.transform = `scale(${1 + Math.abs(x * y) * 0.02}) translateZ(0)`;
    };

    const onMouseLeave = () => {
      if (heroContent) {
        heroContent.style.transform = 'scale(1) translateZ(0)';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    hero.addEventListener('mousemove', onMouseMove, { passive: true });
    hero.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('scroll', onScroll);
      hero.removeEventListener('mousemove', onMouseMove);
      hero.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [heroRef]);
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

// Team slugs that are valid team filters (vs. content type filters)
const TEAM_SLUGS = new Set(['all', 'bears', 'bulls', 'blackhawks', 'cubs', 'white-sox']);

// Map for team_slug matching (handles both whitesox and white-sox variants)
const TEAM_SLUG_MAP: Record<string, string[]> = {
  'bears': ['bears'],
  'bulls': ['bulls'],
  'blackhawks': ['blackhawks'],
  'cubs': ['cubs'],
  'white-sox': ['whitesox', 'white-sox'],
};

function filterPosts(posts: any[], activeFilter: string): any[] {
  if (activeFilter === 'all') return posts;

  // Team filter
  if (TEAM_SLUG_MAP[activeFilter]) {
    const slugs = TEAM_SLUG_MAP[activeFilter];
    return posts.filter(p =>
      slugs.some(s => p.team_slug?.toLowerCase() === s.toLowerCase())
    );
  }

  // Content type filter
  return posts.filter(p =>
    p.content_type?.toLowerCase() === activeFilter.toLowerCase()
  );
}

export function HomepageFeed({
  initialPosts = [],
  editorPicks = [],
  trendingPosts = [],
  userTeamPreference = null,
  isLoggedIn = false,
}: HomepageFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [chicagoMode, setChicagoMode] = useState<'all' | 'my-teams'>('all');
  const [userFavoriteTeams, setUserFavoriteTeams] = useState<string[]>([]);
  const heroSectionRef = useRef<HTMLElement>(null);
  useParallaxHero(heroSectionRef);

  const { isAuthenticated } = useAuth();
  const actuallyLoggedIn = isAuthenticated || isLoggedIn;

  // Listen for "My Chicago" mode toggle from Header
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sm-chicago-mode');
      if (saved === 'my-teams') setChicagoMode('my-teams');
    } catch {}

    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail;
      setChicagoMode(mode);
    };
    window.addEventListener('sm-chicago-mode-change', handler);
    return () => window.removeEventListener('sm-chicago-mode-change', handler);
  }, []);

  // Load user favorite teams for "My Teams" mode
  useEffect(() => {
    if (!actuallyLoggedIn) return;
    fetch('/api/user/preferences')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.favorite_teams?.length) {
          setUserFavoriteTeams(data.favorite_teams);
        }
      })
      .catch(() => {});
  }, [actuallyLoggedIn]);

  // Feature 1: Team preference memory (localStorage)
  const handleFilterChange = useCallback((filter: string) => {
    setActiveFilter(filter);
    try {
      // Only persist team filters, not content type filters
      if (TEAM_SLUGS.has(filter)) {
        if (filter === 'all') {
          localStorage.removeItem('sm-preferred-team');
        } else {
          localStorage.setItem('sm-preferred-team', filter);
        }
      }
    } catch {}
  }, []);

  const clearTeamPreference = useCallback(() => {
    setActiveFilter('all');
    try { localStorage.removeItem('sm-preferred-team'); } catch {}
  }, []);

  // Load team preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sm-preferred-team');
      if (saved && saved !== 'all') {
        setActiveFilter(saved);
        return; // localStorage takes priority
      }
    } catch {}
    // Fall back to server-side user preference
    if (userTeamPreference && userTeamPreference !== 'all') {
      setActiveFilter(userTeamPreference);
    }
  }, [userTeamPreference]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cmd+K / Ctrl+K shortcut to focus inline search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('sm-search-input');
        if (searchInput) {
          searchInput.focus();
          searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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

    document.querySelectorAll('.scroll-reveal, .scroll-reveal-right, .scroll-reveal-scale, .section-transition').forEach((el) => {
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

  // Reorder posts when "My Teams" mode is active
  const reorderedPosts = useMemo(() => {
    if (chicagoMode !== 'my-teams' || !userFavoriteTeams.length) return safePosts;
    const favSet = new Set(userFavoriteTeams.flatMap((t: string) => {
      // Handle both slug formats
      if (t === 'white-sox' || t === 'whitesox') return ['white-sox', 'whitesox'];
      return [t];
    }));
    const favPosts = safePosts.filter((p: any) => favSet.has(p.team_slug?.toLowerCase()));
    const otherPosts = safePosts.filter((p: any) => !favSet.has(p.team_slug?.toLowerCase()));
    return [...favPosts, ...otherPosts];
  }, [safePosts, chicagoMode, userFavoriteTeams]);

  const filteredPosts = filterPosts(reorderedPosts, activeFilter);

  // Filter editor picks by active filter too — fall back to top 3 from filtered posts
  const filteredEditorPicks =
    activeFilter === 'all'
      ? safeEditorPicks
      : (() => {
          const filtered = filterPosts(safeEditorPicks, activeFilter);
          return filtered.length > 0
            ? filtered
            : filteredPosts.slice(0, 3).map((p: any, i: number) => ({ ...p, pinned_slot: i + 1 }));
        })();

  // Determine if the active filter is a team filter
  const isTeamFilter = TEAM_SLUGS.has(activeFilter) && activeFilter !== 'all';

  return (
    <div className="homepage-feed" ref={feedRef}>
      {/* ===== Scroll Progress Bar ===== */}
      <ScrollProgress />

      {/* ===== SECTION 1: Immersive 3D/Parallax Hero "Field" ===== */}
      <section className="sm-hero-bg homepage-hero parallax-hero" aria-label="Hero" ref={heroSectionRef}>
        {/* Parallax Layer 1: Field lines (slowest) */}
        <div className="parallax-layer hero-field-lines" data-speed="0.15" aria-hidden="true">
          <svg width="100%" height="100%" viewBox="0 0 1200 600" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Center circle */}
            <circle cx="600" cy="300" r="80" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
            {/* Midfield line */}
            <line x1="600" y1="0" x2="600" y2="600" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            {/* Yard lines */}
            <line x1="200" y1="0" x2="200" y2="600" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="400" y1="0" x2="400" y2="600" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="800" y1="0" x2="800" y2="600" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            <line x1="1000" y1="0" x2="1000" y2="600" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            {/* Sidelines */}
            <line x1="0" y1="60" x2="1200" y2="60" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            <line x1="0" y1="540" x2="1200" y2="540" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            {/* End zone lines */}
            <rect x="0" y="0" width="100" height="600" fill="rgba(188,0,0,0.03)" />
            <rect x="1100" y="0" width="100" height="600" fill="rgba(188,0,0,0.03)" />
          </svg>
        </div>

        {/* Parallax Layer 2: Chicago skyline silhouette (medium speed) */}
        <div className="parallax-layer hero-skyline" data-speed="0.25" aria-hidden="true" />

        {/* Parallax Layer 3: Stadium lights (fastest, closest) */}
        <div className="parallax-layer hero-stadium-lights" data-speed="0.4" aria-hidden="true" />

        {/* Existing ambient layers */}
        <div className="hero-bg-mesh" />
        <div className="sm-grid-overlay" />
        <GlowOrbs posts={safePosts} />
        <HeroParticles />

        {/* Section 8: Ambient stat visuals */}
        <AmbientStats posts={safePosts} />

        {/* Hero content on glass card */}
        <div className="sm-container hero-content" style={{ transition: 'transform 0.15s ease-out' }}>
          <div className="hero-glass-card">
            <div className="sm-tag animate-entrance entrance-delay-1">
              <span className="pulse-dot" /> Where Chicago Fans Come First
            </div>

            <h1 className="hero-headline animate-entrance entrance-delay-2">
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
          </div>
        </div>
      </section>

      {/* ===== SECTION 6: App Dock Ribbon ===== */}
      <nav className="app-dock-ribbon section-transition" aria-label="Tools">
        <div className="sm-container app-dock-inner">
          <Link href="/scout-ai" className="app-dock-link">Scout AI</Link>
          <Link href="/gm" className="app-dock-link">GM Trade Sim</Link>
          <Link href="/mock-draft" className="app-dock-link">Mock Draft</Link>
          <Link href="/fan-chat" className="app-dock-link">Fan Chat</Link>
        </div>
      </nav>

      {/* ===== Personalize Banner (logged-in only) ===== */}
      {actuallyLoggedIn && (
        <div className="sm-container">
          <Link href="/feed" className="personalize-banner">
            <span className="personalize-text">
              <span style={{ flexShrink: 0, fontSize: '16px', lineHeight: 1 }}>&#10038;</span>
              Personalize your feed
            </span>
            <span className="personalize-arrow">&rarr;</span>
          </Link>
        </div>
      )}

      {/* ===== SECTION 2: Featured Content (full width, no sidebar) ===== */}
      <section className="featured-section section-transition" aria-label="Featured stories">
        <div className="sm-container">
          <EditorPicksHero picks={filteredEditorPicks} />
        </div>
      </section>

      {/* ===== SECTION 7: Horizontal Storylines Rail ===== */}
      {safeTrendingPosts.length > 0 && (
        <section className="storylines-rail-section section-transition" aria-label="Storylines">
          <div className="sm-container">
            <h3 className="storylines-rail-header">Storylines</h3>
          </div>
          <div className="storylines-rail">
            {safeTrendingPosts.slice(0, 8).map((post: any) => {
              const postUrl = post.category_slug
                ? `/${post.category_slug}/${post.slug}`
                : `/${post.slug}`;
              const teamName = post.team_slug
                ? TEAM_LABELS[post.team_slug] || post.team_slug
                : 'Sports';
              return (
                <Link key={post.id} href={postUrl} className="storyline-card">
                  {post.featured_image ? (
                    <div className="storyline-card-image">
                      <Image
                        src={post.featured_image}
                        alt=""
                        fill
                        sizes="260px"
                      />
                    </div>
                  ) : (
                    <div className="storyline-card-image storyline-card-placeholder" />
                  )}
                  <div className="storyline-card-body">
                    <span className="storyline-card-team">{teamName}</span>
                    <span className="storyline-card-title">{post.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== SECTION 4: Sticky Filter Bar ===== */}
      <div className="team-filter-bar-sticky">
        <div className="sm-container">
          <TeamFilterTabs
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            userPreferredTeam={userTeamPreference}
          />
        </div>
      </div>

      {/* ===== SECTION 5: Feed + Sidebar (two-column starts here) ===== */}
      <section id="feed" className="feed-section section-transition">
        <div className="sm-container">
          {/* Team preference banner */}
          {isTeamFilter && TEAM_LABELS[activeFilter] && (
            <div className="team-pref-banner">
              Showing <strong>{TEAM_LABELS[activeFilter]}</strong> news first
              <button onClick={clearTeamPreference} className="team-pref-clear">Show All</button>
            </div>
          )}
          <div className="content-grid">
            {/* Main feed */}
            <main className="feed-column" aria-label="Latest articles">
              <div className="section-header scroll-reveal">
                <span className="sm-tag">Latest</span>
                <h2>Latest Stories</h2>
              </div>
              <ForYouFeed
                posts={filteredPosts}
                isLoggedIn={isLoggedIn}
                isMobile={isMobile}
                showTrendingInline={isMobile}
                trendingPosts={safeTrendingPosts}
                activeTeam={activeFilter}
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
