'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const TEAMS = [
  { name: 'Bears', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', href: '/chicago-bears' },
  { name: 'Bulls', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', href: '/chicago-bulls' },
  { name: 'Cubs', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', href: '/chicago-cubs' },
  { name: 'White Sox', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', href: '/chicago-white-sox' },
  { name: 'Blackhawks', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', href: '/chicago-blackhawks' },
]

const TICKER_ITEMS = [
  { logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', team: 'Bears', text: 'Draft Simulator is LIVE' },
  { logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png', team: 'Bulls', text: 'Trade Grades Updated' },
  { logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png', team: 'Cubs', text: 'Spring Training Coverage' },
  { logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chw.png', team: 'White Sox', text: 'Rebuild Tracker Active' },
  { logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png', team: 'Blackhawks', text: 'Prospect Rankings' },
  { logo: '/downloads/scout-v2.png', team: 'Scout AI', text: 'Ask Anything About Chicago Sports' },
]

const FEATURES = [
  {
    icon: <Image src="/downloads/scout-v2.png" alt="Scout AI" width={24} height={24} style={{ borderRadius: '50%' }} />,
    title: 'Scout AI',
    description: 'Ask anything about Chicago sports. Get instant, data-backed answers powered by real-time intelligence across all five teams.',
    tag: 'Explore Scout',
    href: '/home/scout',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
    title: 'GM Trade Simulator',
    description: 'Build trades across any team in the league. AI evaluates feasibility, grades impact, and shows cap implications.',
    tag: 'Open Simulator',
    href: '/home/simulators',
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
    href: '/home/simulators',
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
    href: '/home/fan-hub',
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
    href: '/home/data',
  },
  {
    icon: (
      <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    title: 'Original Shows',
    description: "Bears Film Room, Pinwheels & Ivy, Southside Behavior, Untold Chicago Stories — deep dives you won't find anywhere else.",
    tag: 'Watch Now',
    href: '/bears-film-room',
  },
]

export default function HomePage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('hm-visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.hm-animate').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="hm-hero">
        <div className="hm-hero-bg" />
        <div className="hm-hero-grid" />
        <div className="hm-glow-orb hm-glow-red" style={{ width: 500, height: 500, top: -200, right: -100, animation: 'hm-pulse 4s infinite' }} />
        <div className="hm-glow-orb hm-glow-white" style={{ width: 400, height: 400, bottom: -150, left: -100, animation: 'hm-pulse 5s infinite 1s' }} />

        <div className="hm-hero-content hm-fade-in">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <Image src="/logos/v2_header_dark.png" alt="Sports Mockery" width={240} height={69} priority style={{ height: 'auto' }} />
          </div>
          <div className="hm-eyebrow">
            <span className="hm-eyebrow-dot" />
            Introducing Sports Mockery 2.0
          </div>
          <h1>
            The future of<br />
            <span className="hm-gradient-text">Chicago sports</span><br />
            starts here.
          </h1>
          <p className="hm-subtitle">
            AI-powered intelligence. Immersive simulators. Real-time fan experiences.
            The most advanced sports platform ever built — designed for the next generation of fandom.
          </p>
          <div className="hm-hero-actions">
            <Link href="/scout-ai" className="hm-btn-primary">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start Exploring
            </Link>
            <Link href="/home/premium" className="hm-btn-secondary">
              Learn about SM+
            </Link>
          </div>
          <div className="hm-hero-teams">
            {TEAMS.map((team) => (
              <Link key={team.name} href={team.href} className="hm-hero-team">
                <img src={team.logo} alt={team.name} width={28} height={28} />
              </Link>
            ))}
          </div>
        </div>

        <div className="hm-scroll-indicator">
          <div className="hm-scroll-line" />
          <span>Discover</span>
        </div>
      </section>

      {/* TICKER */}
      <div className="hm-ticker-section">
        <div className="hm-ticker">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <div key={i} className="hm-ticker-item">
              <img src={item.logo} alt={item.team} width={16} height={16} style={{ borderRadius: '50%' }} />
              <span className="hm-ticker-team">{item.team}</span> {item.text}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="hm-section">
        <div className="hm-container">
          <div className="hm-features-header hm-animate">
            <span className="hm-tag">Platform</span>
            <h2>Everything. One ecosystem.</h2>
            <p>The tools, intelligence, and community that redefine what a sports platform can be.</p>
          </div>
          <div className="hm-features-grid">
            {FEATURES.map((feature, i) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="hm-glass-card hm-animate"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                <div className="hm-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="hm-card-tag">{feature.tag} &rarr;</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWCASE: Scout AI */}
      <section className="hm-section hm-section-alt">
        <div className="hm-container">
          <div className="hm-showcase-inner hm-animate">
            <div className="hm-showcase-visual">
              <div className="hm-mock-ui">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <Image src="/downloads/scout-v2.png" alt="Scout AI" width={32} height={32} style={{ borderRadius: '50%' }} />
                  <div>
                    <div className="hm-mock-bar hm-mock-bar-short" style={{ height: 6, marginBottom: 6 }} />
                    <div className="hm-mock-bar hm-mock-bar-medium" style={{ height: 4, opacity: 0.5 }} />
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
                  <div className="hm-mock-bar hm-mock-bar-long" />
                  <div className="hm-mock-bar hm-mock-bar-medium" />
                  <div className="hm-mock-bar hm-mock-bar-accent" />
                  <div style={{ height: 16 }} />
                  <div className="hm-mock-bar hm-mock-bar-long" />
                  <div className="hm-mock-bar hm-mock-bar-short" />
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                  <div style={{ flex: 1, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--hm-gradient-subtle)' }} />
                </div>
              </div>
            </div>
            <div className="hm-showcase-text">
              <span className="hm-tag">AI Intelligence</span>
              <h2>Ask Scout anything.</h2>
              <p>
                Scout AI understands Chicago sports at a level no other platform can match.
                Powered by real-time data feeds, salary cap databases, and historical analytics —
                it gives you GM-level intelligence in seconds.
              </p>
              <Link href="/scout-ai" className="hm-btn-primary" style={{ marginTop: 8 }}>
                Try Scout AI &rarr;
              </Link>
              <div className="hm-stats">
                <div className="hm-stat-item"><h4>5</h4><span>Chicago Teams</span></div>
                <div className="hm-stat-item"><h4>4</h4><span>Major Leagues</span></div>
                <div className="hm-stat-item"><h4>&infin;</h4><span>Questions</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE: GM Simulator */}
      <section className="hm-section">
        <div className="hm-container">
          <div className="hm-showcase-inner hm-animate" style={{ direction: 'rtl' }}>
            <div className="hm-showcase-visual" style={{ direction: 'ltr' }}>
              <div className="hm-mock-ui">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(188,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" alt="Bears" width={20} height={20} />
                    </div>
                    <div>
                      <div className="hm-mock-bar" style={{ width: 60, height: 6, marginBottom: 6 }} />
                      <div className="hm-mock-bar" style={{ width: 40, height: 4, opacity: 0.4 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <svg width="16" height="16" fill="none" stroke="#ff4444" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 3h5v5M4 20L21 3" /></svg>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div>
                      <div className="hm-mock-bar" style={{ width: 60, height: 6, marginBottom: 6 }} />
                      <div className="hm-mock-bar" style={{ width: 40, height: 4, opacity: 0.4 }} />
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" alt="Packers" width={20} height={20} />
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
                  <div className="hm-mock-bar hm-mock-bar-long" />
                  <div className="hm-mock-bar hm-mock-bar-medium" />
                  <div className="hm-mock-bar hm-mock-bar-short" />
                  <div style={{ height: 8 }} />
                  <div className="hm-mock-bar hm-mock-bar-accent" />
                  <div className="hm-mock-bar hm-mock-bar-medium" />
                </div>
                <div style={{ marginTop: 'auto', textAlign: 'center' }}>
                  <span className="hm-grade-badge">GRADE: A-</span>
                </div>
              </div>
            </div>
            <div className="hm-showcase-text" style={{ direction: 'ltr' }}>
              <span className="hm-tag">Simulator</span>
              <h2>Think like a GM.</h2>
              <p>
                Build trades across any team in the league. AI grades every deal, calculates cap impact,
                and simulates entire seasons to see how your moves play out. Mock draft integration
                lets you rebuild from the ground up.
              </p>
              <Link href="/gm" className="hm-btn-primary" style={{ marginTop: 8 }}>
                Open GM Simulator &rarr;
              </Link>
              <div className="hm-stats">
                <div className="hm-stat-item"><h4>124</h4><span>League Teams</span></div>
                <div className="hm-stat-item"><h4>AI</h4><span>Trade Grading</span></div>
                <div className="hm-stat-item"><h4>Full</h4><span>Season Sim</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="hm-cta-section">
        <div className="hm-container">
          <div style={{ maxWidth: 600, margin: '0 auto' }} className="hm-animate">
            <span className="hm-tag" style={{ marginBottom: 20 }}>Get Started</span>
            <h2>Ready for the future?</h2>
            <p>
              Join the next generation of Chicago sports fans.
              Experience what happens when AI meets fandom.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/home/premium" className="hm-btn-primary">
                Unlock SM+ Premium
              </Link>
              <Link href="/scout-ai" className="hm-btn-secondary">
                Explore Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
