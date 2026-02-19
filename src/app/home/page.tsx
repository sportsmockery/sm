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
        {/* Animated scan line */}
        <div className="hm-scan-line" />
        {/* Floating particle orbs */}
        <div className="hm-glow-orb hm-glow-red hm-orb-float" style={{ width: 500, height: 500, top: -200, right: -100 }} />
        <div className="hm-glow-orb hm-glow-white hm-orb-float-slow" style={{ width: 400, height: 400, bottom: -150, left: -100 }} />
        <div className="hm-glow-orb hm-glow-red hm-orb-float-slow" style={{ width: 200, height: 200, bottom: 100, right: '20%', opacity: 0.5 }} />

        <div className="hm-hero-content">
          <div className="hm-hero-stagger hm-stagger-1" style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
            <Image src="/logos/v2_header_dark.png" alt="Sports Mockery" width={240} height={69} priority style={{ height: 'auto' }} />
          </div>
          <div className="hm-hero-stagger hm-stagger-2">
            <div className="hm-eyebrow">
              <span className="hm-eyebrow-dot" />
              Introducing Sports Mockery 2.0
            </div>
          </div>
          <h1 className="hm-hero-stagger hm-stagger-3 hm-hero-title-reveal">
            The future of<br />
            <span className="hm-gradient-text">Chicago sports</span><br />
            starts here.
          </h1>
          <p className="hm-subtitle hm-hero-stagger hm-stagger-4">
            AI-powered intelligence. Immersive simulators. Real-time fan experiences.
            The most advanced sports platform ever built — designed for the next generation of fandom.
          </p>
          <div className="hm-hero-actions hm-hero-stagger hm-stagger-5">
            <Link href="/home/login" className="hm-btn-primary hm-btn-glow-pulse">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Start Exploring
            </Link>
            <Link href="/home/premium" className="hm-btn-secondary">
              Learn about SM+
            </Link>
          </div>
          <div className="hm-hero-teams hm-hero-stagger hm-stagger-6">
            {TEAMS.map((team, i) => (
              <Link key={team.name} href={team.href} className="hm-hero-team hm-team-pop" style={{ animationDelay: `${1.4 + i * 0.08}s` }}>
                <img src={team.logo} alt={team.name} width={28} height={28} />
              </Link>
            ))}
          </div>
        </div>

        <div className="hm-scroll-indicator hm-hero-stagger hm-stagger-7">
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
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
                  <span className="preview-title">Scout AI</span>
                </div>
                <div className="preview-chat">
                  <div className="preview-user-msg">
                    <span className="msg-text">Who should the Bears draft at #1 overall?</span>
                  </div>
                  <div className="preview-ai-msg">
                    <div className="ai-avatar">🔴</div>
                    <div className="msg-body">
                      <span className="ai-name">Scout AI</span>
                      <p className="msg-text">Based on team needs and draft projections, the Bears should target <strong>Shedeur Sanders (QB, Colorado)</strong>. Their pass rush ranks 28th in pressures generated, but the QB position takes priority given Caleb Williams&apos; inconsistency.</p>
                      <div className="ai-sources">
                        <span className="source-pill">Cap Data</span>
                        <span className="source-pill">Draft Board</span>
                        <span className="source-pill">Team Stats</span>
                      </div>
                    </div>
                  </div>
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
              <Link href="/home/login" className="hm-btn-primary" style={{ marginTop: 8 }}>
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
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
                  <span className="preview-title">Trade Simulator</span>
                </div>
                <div className="preview-trade">
                  <div className="trade-side">
                    <div className="team-header">
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/chi.png" alt="Bears" className="preview-team-logo" />
                      <span>Bears Send</span>
                    </div>
                    <div className="trade-asset">DJ Moore <span className="pos">WR</span></div>
                    <div className="trade-asset">2027 1st Round <span className="pos">Pick</span></div>
                  </div>
                  <div className="trade-arrow">⇄</div>
                  <div className="trade-side">
                    <div className="team-header">
                      <img src="https://a.espncdn.com/i/teamlogos/nfl/500/gb.png" alt="Packers" className="preview-team-logo" />
                      <span>Packers Send</span>
                    </div>
                    <div className="trade-asset">Rashan Gary <span className="pos">EDGE</span></div>
                    <div className="trade-asset">2026 3rd Round <span className="pos">Pick</span></div>
                  </div>
                </div>
                <div className="trade-grade-bar">
                  <div className="grade-label">AI Grade</div>
                  <div className="grade-meter"><div className="grade-fill" style={{ width: '78%' }} /></div>
                  <div className="grade-value">B+</div>
                </div>
                <div className="trade-insight">
                  <span className="insight-icon">💡</span>
                  <span>Bears improve pass rush by +18% but lose a top-10 WR asset</span>
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
              <Link href="/home/login" className="hm-btn-primary" style={{ marginTop: 8 }}>
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

      {/* SHOWCASE: Fan Hub */}
      <section className="hm-section hm-section-alt">
        <div className="hm-container">
          <div className="hm-showcase-inner hm-animate">
            <div className="hm-showcase-visual">
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
                  <span className="preview-title">Fan Hub — Bears Den</span>
                </div>
                <div className="preview-room-tabs">
                  <span className="room-tab active">🐻 Bears Den</span>
                  <span className="room-tab">🐂 Bulls Court</span>
                  <span className="room-tab">⚾ Cubs Dugout</span>
                </div>
                <div className="preview-messages">
                  <div className="chat-msg user-msg">
                    <span className="chat-name bears-color">BearDown_Mike</span>
                    <span className="chat-text">Poles needs to trade up for a pass rusher. This defense can&apos;t generate pressure.</span>
                    <span className="chat-time">2m ago</span>
                  </div>
                  <div className="chat-msg user-msg">
                    <span className="chat-name bears-color">ChiTownFan</span>
                    <span className="chat-text">Agree 💯 but the cap situation is brutal. We&apos;d have to move DJ Moore.</span>
                    <span className="chat-time">1m ago</span>
                  </div>
                  <div className="chat-msg ai-msg">
                    <span className="chat-name ai-color">🤖 Bears AI Bot</span>
                    <span className="chat-text">Fun fact: The Bears rank 28th in pressures generated this season. A top EDGE rusher would project a +22% improvement based on historical trade comps.</span>
                    <span className="chat-time">just now</span>
                  </div>
                  <div className="chat-msg user-msg">
                    <span className="chat-name bears-color">DaBears92</span>
                    <span className="chat-text">See, even the bot agrees. Make the trade, Poles! 🔥</span>
                    <span className="chat-time">just now</span>
                  </div>
                </div>
                <div className="preview-poll-inline">
                  <span className="poll-q">🗳 Should Bears trade up for EDGE?</span>
                  <div className="poll-bar"><div className="poll-fill" style={{ width: '73%' }} /><span>Yes — 73%</span></div>
                </div>
              </div>
            </div>
            <div className="hm-showcase-text">
              <span className="hm-tag">Community</span>
              <h2>Where fans come alive.</h2>
              <p>
                Real-time chat rooms for every Chicago team, each with an AI personality that knows the roster,
                the stats, and the storylines. Polls, trending topics, and a community that never sleeps.
              </p>
              <Link href="/home/login" className="hm-btn-primary" style={{ marginTop: 8 }}>
                Join the Fan Hub &rarr;
              </Link>
              <div className="hm-stats">
                <div className="hm-stat-item"><h4>5</h4><span>Team Rooms</span></div>
                <div className="hm-stat-item"><h4>AI</h4><span>Chat Bots</span></div>
                <div className="hm-stat-item"><h4>Live</h4><span>Polls</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE: Data Cosmos */}
      <section className="hm-section">
        <div className="hm-container">
          <div className="hm-showcase-inner hm-animate" style={{ direction: 'rtl' }}>
            <div className="hm-showcase-visual" style={{ direction: 'ltr' }}>
              <div className="preview-window">
                <div className="preview-topbar">
                  <div className="preview-dot red" /><div className="preview-dot yellow" /><div className="preview-dot green" />
                  <span className="preview-title">Data Cosmos — Bears Stats</span>
                </div>
                <div className="preview-stats-grid">
                  <div className="stat-card-mini">
                    <span className="stat-label">Passing YDS</span>
                    <span className="stat-value">3,847</span>
                    <span className="stat-rank rank-mid">#18 in NFL</span>
                  </div>
                  <div className="stat-card-mini">
                    <span className="stat-label">Rush YDS</span>
                    <span className="stat-value">2,211</span>
                    <span className="stat-rank rank-good">#6 in NFL</span>
                  </div>
                  <div className="stat-card-mini">
                    <span className="stat-label">Points/G</span>
                    <span className="stat-value">21.4</span>
                    <span className="stat-rank rank-mid">#20 in NFL</span>
                  </div>
                  <div className="stat-card-mini">
                    <span className="stat-label">Sacks</span>
                    <span className="stat-value">31</span>
                    <span className="stat-rank rank-bad">#27 in NFL</span>
                  </div>
                </div>
                <div className="preview-chart">
                  <div className="chart-label">Scoring Trend (Last 8 Games)</div>
                  <div className="mini-bar-chart">
                    <div className="bar" style={{ height: '60%' }}><span>17</span></div>
                    <div className="bar" style={{ height: '80%' }}><span>24</span></div>
                    <div className="bar" style={{ height: '45%' }}><span>13</span></div>
                    <div className="bar" style={{ height: '95%' }}><span>31</span></div>
                    <div className="bar" style={{ height: '70%' }}><span>21</span></div>
                    <div className="bar" style={{ height: '55%' }}><span>16</span></div>
                    <div className="bar highlight" style={{ height: '85%' }}><span>27</span></div>
                    <div className="bar highlight" style={{ height: '75%' }}><span>23</span></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hm-showcase-text" style={{ direction: 'ltr' }}>
              <span className="hm-tag">Analytics</span>
              <h2>Data, beautifully visualized.</h2>
              <p>
                Interactive stats, animated charts, player leaderboards, schedules, and box scores
                for all five Chicago teams. The most comprehensive data experience in Chicago sports.
              </p>
              <Link href="/home/login" className="hm-btn-primary" style={{ marginTop: 8 }}>
                Explore Data Cosmos &rarr;
              </Link>
              <div className="hm-stats">
                <div className="hm-stat-item"><h4>5</h4><span>Teams</span></div>
                <div className="hm-stat-item"><h4>Live</h4><span>Updates</span></div>
                <div className="hm-stat-item"><h4>Full</h4><span>Seasons</span></div>
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
              <Link href="/home/login" className="hm-btn-primary">
                Unlock SM+ Premium
              </Link>
              <Link href="/" className="hm-btn-secondary">
                Explore Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
