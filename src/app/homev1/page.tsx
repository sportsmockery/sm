'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TEAMS = [
  { name: 'Bears', sport: 'NFL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', href: '/chicago-bears', color: '#0B162A' },
  { name: 'Bulls', sport: 'NBA', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', href: '/chicago-bulls', color: '#CE1141' },
  { name: 'Cubs', sport: 'MLB', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', href: '/chicago-cubs', color: '#0E3386' },
  { name: 'White Sox', sport: 'MLB', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', href: '/chicago-white-sox', color: '#27251F' },
  { name: 'Blackhawks', sport: 'NHL', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', href: '/chicago-blackhawks', color: '#CF0A2C' },
]

const FEATURES = [
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 3-2 5.5-4 7.5L12 20l-3-3.5C7 14.5 5 12 5 9a7 7 0 0 1 7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: 'Scout AI',
    description: 'Ask anything about Chicago sports. Get instant, data-backed answers powered by real-time intelligence across all five teams.',
    tag: 'Explore Scout',
    href: '/scout-ai',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
    title: 'GM Trade Simulator',
    description: 'Build trades across any team in the league. AI evaluates feasibility, grades impact, and simulates full seasons.',
    tag: 'Open Simulator',
    href: '/gm',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: 'Mock Draft Engine',
    description: 'Run full mock drafts for NFL, MLB, and more. AI responds to your picks with dynamic board adjustments and draft grades.',
    tag: 'Start Drafting',
    href: '/mock-draft',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Fan Hub',
    description: 'Real-time chat rooms for every Chicago team — each with an AI personality that loves the team as much as you do.',
    tag: 'Join the Chat',
    href: '/fan-chat',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
    title: 'Data Cosmos',
    description: 'Interactive stats, animated charts, rosters, schedules, and box scores for all five Chicago teams — beautifully visualized.',
    tag: 'Explore Data',
    href: '/datahub',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    title: 'Original Shows',
    description: 'Bears Film Room, Pinwheels & Ivy, Southside Behavior, Untold Chicago Stories — deep dives you won\'t find anywhere else.',
    tag: 'Watch Now',
    href: '/bears-film-room',
  },
]

const TICKER_ITEMS = [
  { emoji: '🏈', team: 'Bears', text: 'Mock Draft Simulator is LIVE' },
  { emoji: '🏀', team: 'Bulls', text: 'Trade Grades Updated' },
  { emoji: '⚾', team: 'Cubs', text: 'Spring Training Coverage' },
  { emoji: '⚾', team: 'White Sox', text: 'Rebuild Tracker Active' },
  { emoji: '🏒', team: 'Blackhawks', text: 'Prospect Rankings' },
  { emoji: '🤖', team: 'Scout AI', text: 'Ask Anything About Chicago Sports' },
]

export default function HomeV1Page() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fade-in observer for sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('hv1-visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.hv1-animate').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="hv1-root">
      <style>{`
        .hv1-root {
          --hv1-red: #bc0000;
          --hv1-red-light: #ff4444;
          --hv1-red-glow: rgba(188, 0, 0, 0.3);
          --hv1-dark: #050508;
          --hv1-surface: #0c0c12;
          --hv1-card: #13131d;
          --hv1-card-hover: #1a1a28;
          --hv1-border: rgba(255,255,255,0.06);
          --hv1-text: #ffffff;
          --hv1-text-muted: #8a8a9a;
          --hv1-text-dim: #55556a;
          --hv1-gradient: linear-gradient(135deg, #bc0000, #ff4444);
          --hv1-gradient-subtle: linear-gradient(135deg, rgba(188,0,0,0.15), rgba(255,68,68,0.05));
          background: var(--hv1-dark);
          color: var(--hv1-text);
          font-family: var(--font-inter), 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: -1px 0 0 0;
        }

        /* HERO */
        .hv1-hero {
          min-height: 92vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
          position: relative;
          padding: 80px 24px 80px;
          overflow: hidden;
        }
        .hv1-hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(188,0,0,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(188,0,0,0.04) 0%, transparent 50%),
            var(--hv1-dark);
        }
        .hv1-hero-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 80px 80px;
          mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 70%);
        }
        .hv1-hero-content {
          position: relative; z-index: 2; max-width: 900px;
        }
        .hv1-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 20px; border-radius: 100px;
          background: rgba(188,0,0,0.08);
          border: 1px solid rgba(188,0,0,0.15);
          font-size: 13px; font-weight: 600; color: var(--hv1-red-light);
          letter-spacing: 0.3px;
          margin-bottom: 32px;
        }
        .hv1-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--hv1-red);
          animation: hv1-pulse 2s infinite;
        }
        .hv1-hero h1 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
          margin-bottom: 24px;
          color: #fff;
        }
        .hv1-gradient-text {
          background: var(--hv1-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hv1-subtitle {
          font-size: clamp(1rem, 2vw, 1.25rem);
          color: var(--hv1-text-muted);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto 40px;
          font-weight: 400;
        }
        .hv1-hero-actions {
          display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;
        }
        .hv1-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 32px; border-radius: 100px;
          font-weight: 600; font-size: 15px;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.3s;
          color: #fff;
        }
        .hv1-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(188,0,0,0.5);
        }
        .hv1-btn-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: #fff; padding: 14px 32px; border-radius: 100px;
          font-weight: 600; font-size: 15px; text-decoration: none;
          transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.15);
          cursor: pointer;
        }
        .hv1-btn-secondary:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.03);
        }
        .hv1-hero-teams {
          display: flex; gap: 12px; justify-content: center;
          margin-top: 56px; padding-top: 56px;
          border-top: 1px solid var(--hv1-border);
        }
        .hv1-hero-team {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--hv1-card);
          border: 1px solid var(--hv1-border);
          display: flex; align-items: center; justify-content: center;
          transition: all 0.3s; cursor: pointer;
          text-decoration: none;
        }
        .hv1-hero-team:hover {
          transform: translateY(-4px);
          border-color: rgba(188,0,0,0.3);
          box-shadow: 0 8px 24px rgba(188,0,0,0.15);
        }
        .hv1-scroll-indicator {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          color: var(--hv1-text-dim); font-size: 11px;
          letter-spacing: 2px; text-transform: uppercase;
        }
        .hv1-scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, var(--hv1-red), transparent);
        }

        /* GLOW ORBS */
        .hv1-glow-orb {
          position: absolute; border-radius: 50%; filter: blur(120px); pointer-events: none;
        }
        .hv1-glow-red { background: rgba(188,0,0,0.12); }
        .hv1-glow-white { background: rgba(255,255,255,0.03); }

        /* TICKER */
        .hv1-ticker-section {
          padding: 0; overflow: hidden;
          border-top: 1px solid var(--hv1-border);
          border-bottom: 1px solid var(--hv1-border);
          background: var(--hv1-dark);
        }
        .hv1-ticker {
          display: flex;
          animation: hv1-ticker 30s linear infinite;
          padding: 18px 0;
        }
        .hv1-ticker-item {
          flex-shrink: 0; padding: 0 48px;
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: var(--hv1-text-dim); white-space: nowrap;
        }
        .hv1-ticker-team { color: #fff; font-weight: 600; }

        /* SECTIONS */
        .hv1-section {
          padding: 120px 0;
          background: var(--hv1-dark);
        }
        .hv1-section-alt {
          background: var(--hv1-surface);
        }
        .hv1-container {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
        }
        .hv1-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;
          background: var(--hv1-gradient-subtle);
          color: var(--hv1-red-light);
          border: 1px solid rgba(188,0,0,0.2);
        }

        /* FEATURES */
        .hv1-features-header {
          text-align: center; margin-bottom: 64px;
        }
        .hv1-features-header h2 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
          letter-spacing: -1px; margin-top: 20px; margin-bottom: 16px;
          color: #fff;
        }
        .hv1-features-header p {
          color: var(--hv1-text-muted); font-size: 16px;
          max-width: 500px; margin: 0 auto;
        }
        .hv1-features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
        }

        /* GLASS CARD */
        .hv1-glass-card {
          background: var(--hv1-card);
          border: 1px solid var(--hv1-border);
          border-radius: 20px;
          padding: 36px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .hv1-glass-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(188,0,0,0.3), transparent);
          opacity: 0; transition: opacity 0.4s;
        }
        .hv1-glass-card:hover {
          transform: translateY(-4px);
          border-color: rgba(188,0,0,0.15);
          background: var(--hv1-card-hover);
        }
        .hv1-glass-card:hover::before { opacity: 1; }
        .hv1-feature-icon {
          width: 48px; height: 48px; border-radius: 14px;
          background: var(--hv1-gradient-subtle);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
        }
        .hv1-glass-card h3 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: 20px; font-weight: 600; margin-bottom: 10px;
          letter-spacing: -0.3px; color: #fff;
        }
        .hv1-glass-card p {
          color: var(--hv1-text-muted); font-size: 14px; line-height: 1.6;
        }
        .hv1-card-tag {
          font-size: 12px; color: var(--hv1-red-light);
          font-weight: 600; margin-top: 16px; display: block;
        }

        /* SHOWCASE */
        .hv1-showcase-inner {
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center;
        }
        .hv1-showcase-visual {
          aspect-ratio: 4/3; border-radius: 24px; overflow: hidden;
          background: var(--hv1-card); border: 1px solid var(--hv1-border);
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .hv1-mock-ui {
          width: 85%; height: 80%; border-radius: 16px;
          background: linear-gradient(145deg, var(--hv1-surface), var(--hv1-card));
          border: 1px solid rgba(255,255,255,0.05);
          display: flex; flex-direction: column; padding: 24px; gap: 12px;
        }
        .hv1-mock-bar {
          height: 8px; border-radius: 4px; background: rgba(255,255,255,0.06);
        }
        .hv1-mock-bar-short { width: 40%; }
        .hv1-mock-bar-medium { width: 65%; }
        .hv1-mock-bar-long { width: 85%; }
        .hv1-mock-bar-accent { background: var(--hv1-gradient-subtle); width: 50%; }
        .hv1-mock-dot {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(188,0,0,0.15);
        }
        .hv1-showcase-text h2 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 700;
          letter-spacing: -1px; margin-top: 20px; margin-bottom: 16px;
          color: #fff;
        }
        .hv1-showcase-text p {
          color: var(--hv1-text-muted); font-size: 16px; line-height: 1.7;
          margin-bottom: 24px;
        }
        .hv1-stats {
          display: flex; gap: 32px; margin-top: 32px;
        }
        .hv1-stat-item h4 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: 28px; font-weight: 700; letter-spacing: -1px;
          color: #fff;
        }
        .hv1-stat-item span {
          font-size: 13px; color: var(--hv1-text-dim);
        }

        /* CTA */
        .hv1-cta-section {
          text-align: center;
          padding: 120px 0;
          background: var(--hv1-dark);
        }
        .hv1-cta-section h2 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: clamp(2rem, 4vw, 3rem); font-weight: 700;
          letter-spacing: -1px; margin: 20px 0 16px; color: #fff;
        }
        .hv1-cta-section p {
          color: var(--hv1-text-muted); font-size: 16px; line-height: 1.6;
          margin-bottom: 32px;
        }

        /* LOGO SECTION */
        .hv1-logo-section {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 24px 0;
          position: relative; z-index: 2;
        }

        /* FOOTER */
        .hv1-footer {
          border-top: 1px solid var(--hv1-border);
          padding: 60px 0 40px;
          background: var(--hv1-surface);
        }
        .hv1-footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
          margin-bottom: 48px;
        }
        .hv1-footer-col h4 {
          font-family: var(--font-montserrat), 'Montserrat', sans-serif;
          font-size: 13px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 1px; color: var(--hv1-text-muted); margin-bottom: 16px;
        }
        .hv1-footer-col a {
          display: block; color: var(--hv1-text-dim); font-size: 14px;
          text-decoration: none; margin-bottom: 10px; transition: color 0.2s;
        }
        .hv1-footer-col a:hover { color: #fff; }
        .hv1-footer-bottom {
          display: flex; justify-content: space-between; align-items: center;
          padding-top: 24px; border-top: 1px solid var(--hv1-border);
        }
        .hv1-footer-bottom span {
          color: var(--hv1-text-dim); font-size: 13px;
        }

        /* ANIMATIONS */
        @keyframes hv1-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes hv1-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hv1-fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hv1-fade-in {
          animation: hv1-fadeInUp 0.8s ease forwards;
        }
        .hv1-animate {
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .hv1-visible {
          opacity: 1; transform: translateY(0);
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hv1-features-grid { grid-template-columns: 1fr; }
          .hv1-showcase-inner { grid-template-columns: 1fr; }
          .hv1-hero-teams { flex-wrap: wrap; }
          .hv1-section { padding: 80px 0; }
          .hv1-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .hv1-stats { gap: 20px; }
          .hv1-footer-bottom { flex-direction: column; gap: 12px; text-align: center; }
        }

        @media (prefers-reduced-motion: reduce) {
          .hv1-ticker { animation: none; }
          .hv1-eyebrow-dot { animation: none; opacity: 1; }
          .hv1-animate { opacity: 1; transform: none; transition: none; }
          .hv1-fade-in { animation: none; opacity: 1; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hv1-hero" ref={heroRef}>
        <div className="hv1-hero-bg" />
        <div className="hv1-hero-grid" />
        <div className="hv1-glow-orb hv1-glow-red" style={{ width: 500, height: 500, top: -200, right: -100, animation: 'hv1-pulse 4s infinite' }} />
        <div className="hv1-glow-orb hv1-glow-white" style={{ width: 400, height: 400, bottom: -150, left: -100, animation: 'hv1-pulse 5s infinite 1s' }} />

        <div className="hv1-hero-content hv1-fade-in">
          <div className="hv1-logo-section" style={{ paddingTop: 0, marginBottom: 32 }}>
            <Image
              src="/logos/v2_header_dark.png"
              alt="Sports Mockery"
              width={240}
              height={69}
              priority
              style={{ height: 'auto' }}
            />
          </div>
          <div className="hv1-eyebrow">
            <span className="hv1-eyebrow-dot" />
            Introducing Sports Mockery 2.0
          </div>
          <h1>
            The future of<br />
            <span className="hv1-gradient-text">Chicago sports</span><br />
            starts here.
          </h1>
          <p className="hv1-subtitle">
            AI-powered intelligence. Immersive simulators. Real-time fan experiences.
            The most advanced sports platform ever built — designed for the next generation of fandom.
          </p>
          <div className="hv1-hero-actions">
            <Link
              href="/scout-ai"
              className="hv1-btn-primary"
              style={{ backgroundColor: '#bc0000', background: 'linear-gradient(135deg, #bc0000, #ff4444)', boxShadow: '0 0 30px rgba(188,0,0,0.3)' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start Exploring
            </Link>
            <Link href="/pricing" className="hv1-btn-secondary">
              Learn about SM+
            </Link>
          </div>
          <div className="hv1-hero-teams">
            {TEAMS.map((team) => (
              <Link key={team.name} href={team.href} className="hv1-hero-team">
                <img src={team.logo} alt={team.name} width={30} height={30} />
              </Link>
            ))}
          </div>
        </div>

        <div className="hv1-scroll-indicator">
          <div className="hv1-scroll-line" />
          <span>Discover</span>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="hv1-ticker-section">
        <div className="hv1-ticker">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="hv1-ticker-item">
              {item.emoji} <span className="hv1-ticker-team">{item.team}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="hv1-section">
        <div className="hv1-container">
          <div className="hv1-features-header hv1-animate">
            <span className="hv1-tag">Platform</span>
            <h2>Everything. One ecosystem.</h2>
            <p>The tools, intelligence, and community that redefine what a sports platform can be.</p>
          </div>
          <div className="hv1-features-grid">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="hv1-glass-card hv1-animate"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div className="hv1-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="hv1-card-tag">{feature.tag} &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: Scout AI ── */}
      <section className="hv1-section hv1-section-alt">
        <div className="hv1-container">
          <div className="hv1-showcase-inner hv1-animate">
            <div className="hv1-showcase-visual">
              <div className="hv1-mock-ui">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Image src="/downloads/scout-v2.png" alt="Scout AI" width={32} height={32} style={{ borderRadius: '50%' }} />
                  <div>
                    <div className="hv1-mock-bar hv1-mock-bar-short" style={{ height: 6, marginBottom: 6 }} />
                    <div className="hv1-mock-bar hv1-mock-bar-medium" style={{ height: 4, opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  <div className="hv1-mock-bar hv1-mock-bar-long" />
                  <div className="hv1-mock-bar hv1-mock-bar-medium" />
                  <div className="hv1-mock-bar hv1-mock-bar-accent" />
                  <div style={{ height: 16 }} />
                  <div className="hv1-mock-bar hv1-mock-bar-long" />
                  <div className="hv1-mock-bar hv1-mock-bar-short" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--hv1-gradient-subtle)' }} />
                </div>
              </div>
            </div>
            <div className="hv1-showcase-text">
              <span className="hv1-tag">AI Intelligence</span>
              <h2>Ask Scout anything.</h2>
              <p>
                Scout AI understands Chicago sports at a level no other platform can match.
                Powered by real-time data feeds, salary cap databases, and historical analytics —
                it gives you GM-level intelligence in seconds.
              </p>
              <Link
                href="/scout-ai"
                className="hv1-btn-primary"
                style={{ backgroundColor: '#bc0000', background: 'linear-gradient(135deg, #bc0000, #ff4444)', boxShadow: '0 0 30px rgba(188,0,0,0.3)', marginTop: 8 }}
              >
                Try Scout AI &rarr;
              </Link>
              <div className="hv1-stats">
                <div className="hv1-stat-item">
                  <h4>5</h4>
                  <span>Chicago Teams</span>
                </div>
                <div className="hv1-stat-item">
                  <h4>4</h4>
                  <span>Major Leagues</span>
                </div>
                <div className="hv1-stat-item">
                  <h4>&infin;</h4>
                  <span>Questions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SHOWCASE: GM Simulator ── */}
      <section className="hv1-section">
        <div className="hv1-container">
          <div className="hv1-showcase-inner hv1-animate" style={{ direction: 'rtl' }}>
            <div className="hv1-showcase-visual" style={{ direction: 'ltr' }}>
              <div className="hv1-mock-ui">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(188,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" alt="" width={20} height={20} />
                    </div>
                    <div>
                      <div className="hv1-mock-bar" style={{ width: 60, height: 6, marginBottom: 6 }} />
                      <div className="hv1-mock-bar" style={{ width: 40, height: 4, opacity: 0.4 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <svg width="16" height="16" fill="none" stroke="#ff4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3" /></svg>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div>
                      <div className="hv1-mock-bar" style={{ width: 60, height: 6, marginBottom: 6 }} />
                      <div className="hv1-mock-bar" style={{ width: 40, height: 4, opacity: 0.4 }} />
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" alt="" width={20} height={20} />
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  <div className="hv1-mock-bar hv1-mock-bar-long" />
                  <div className="hv1-mock-bar hv1-mock-bar-medium" />
                  <div className="hv1-mock-bar hv1-mock-bar-short" />
                  <div style={{ height: 8 }} />
                  <div className="hv1-mock-bar hv1-mock-bar-accent" />
                  <div className="hv1-mock-bar hv1-mock-bar-medium" />
                </div>
                <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 100, background: 'var(--hv1-gradient-subtle)', border: '1px solid rgba(188,0,0,0.2)' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ff4444', letterSpacing: 0.5 }}>GRADE: A-</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="hv1-showcase-text" style={{ direction: 'ltr' }}>
              <span className="hv1-tag">Simulator</span>
              <h2>Think like a GM.</h2>
              <p>
                Build trades across any team in the league. AI grades every deal, calculates cap impact,
                and simulates entire seasons to see how your moves play out. Mock draft integration
                lets you rebuild from the ground up.
              </p>
              <Link
                href="/gm"
                className="hv1-btn-primary"
                style={{ backgroundColor: '#bc0000', background: 'linear-gradient(135deg, #bc0000, #ff4444)', boxShadow: '0 0 30px rgba(188,0,0,0.3)', marginTop: 8 }}
              >
                Open GM Simulator &rarr;
              </Link>
              <div className="hv1-stats">
                <div className="hv1-stat-item">
                  <h4>124</h4>
                  <span>League Teams</span>
                </div>
                <div className="hv1-stat-item">
                  <h4>AI</h4>
                  <span>Trade Grading</span>
                </div>
                <div className="hv1-stat-item">
                  <h4>Full</h4>
                  <span>Season Sim</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hv1-cta-section">
        <div className="hv1-container">
          <div style={{ maxWidth: 600, margin: '0 auto' }} className="hv1-animate">
            <span className="hv1-tag" style={{ marginBottom: 20 }}>Get Started</span>
            <h2>Ready for the future?</h2>
            <p>
              Join the next generation of Chicago sports fans.
              Experience what happens when AI meets fandom.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/pricing"
                className="hv1-btn-primary"
                style={{ backgroundColor: '#bc0000', background: 'linear-gradient(135deg, #bc0000, #ff4444)', boxShadow: '0 0 30px rgba(188,0,0,0.3)' }}
              >
                Unlock SM+ Premium
              </Link>
              <Link href="/scout-ai" className="hv1-btn-secondary">
                Explore Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="hv1-footer">
        <div className="hv1-container">
          <div className="hv1-footer-grid">
            <div className="hv1-footer-col">
              <div style={{ marginBottom: 16 }}>
                <Image
                  src="/logos/v2_header_dark.png"
                  alt="Sports Mockery"
                  width={160}
                  height={46}
                  style={{ height: 'auto' }}
                />
              </div>
              <p style={{ color: 'var(--hv1-text-dim)', fontSize: 14, lineHeight: 1.6, maxWidth: 280 }}>
                The future of Chicago sports. AI-powered, fan-driven, unmatched.
              </p>
            </div>
            <div className="hv1-footer-col">
              <h4>Platform</h4>
              <Link href="/scout-ai">Scout AI</Link>
              <Link href="/gm">Trade Simulator</Link>
              <Link href="/mock-draft">Mock Draft</Link>
              <Link href="/datahub">Data Hub</Link>
              <Link href="/fan-chat">Fan Hub</Link>
            </div>
            <div className="hv1-footer-col">
              <h4>Teams</h4>
              {TEAMS.map((team) => (
                <Link key={team.name} href={team.href}>Chicago {team.name}</Link>
              ))}
            </div>
            <div className="hv1-footer-col">
              <h4>Company</h4>
              <Link href="/pricing">SM+ Premium</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
            </div>
          </div>
          <div className="hv1-footer-bottom">
            <span>&copy; {new Date().getFullYear()} Sports Mockery. All rights reserved.</span>
            <span style={{ color: 'var(--hv1-text-dim)', fontSize: 12 }}>Designed for the future of fandom.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
