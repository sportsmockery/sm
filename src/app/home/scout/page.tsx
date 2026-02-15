'use client'

import Link from 'next/link'
import Image from 'next/image'

const SUGGESTIONS = [
  'Who should the Bulls draft this year?',
  'Cubs rotation rankings vs NL Central',
  'Blackhawks prospect pipeline analysis',
  'White Sox rebuild timeline',
  'Bears salary cap breakdown',
]

export default function ScoutPage() {
  return (
    <>
      {/* Hero */}
      <section className="hm-page-hero">
        <div className="hm-page-hero-bg" />
        <div className="hm-hero-content hm-fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hm-tag" style={{ marginBottom: 24 }}>AI Intelligence</span>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={80} height={80} style={{ borderRadius: '50%' }} />
          </div>
          <h1>Meet <span className="hm-gradient-text">Scout AI</span></h1>
          <p>Your personal Chicago sports intelligence engine. Ask anything — from trade scenarios to historical stats — and get instant, sourced answers.</p>
        </div>
      </section>

      {/* Chat Demo */}
      <div className="hm-chat-container hm-fade-in">
        <div className="hm-chat-window">
          <div className="hm-chat-header">
            <div className="hm-chat-status" />
            <Image src="/downloads/scout-v2.png" alt="Scout AI" width={24} height={24} style={{ borderRadius: '50%' }} />
            <span>Scout AI</span>
            <span className="hm-chat-model">Powered by SM Intelligence Engine</span>
          </div>
          <div className="hm-chat-messages">
            <div className="hm-chat-msg hm-chat-msg-user">
              Should the Bears trade the #1 pick or draft a franchise QB?
            </div>
            <div className="hm-chat-msg hm-chat-msg-ai">
              Great question. Here&apos;s the breakdown:<br /><br />
              <strong>Drafting a QB (#1 overall)</strong><br />
              The Bears could select the top QB prospect, locking in a potential franchise cornerstone on a rookie deal for 5 years. Historical data shows QBs taken #1 overall have a 62% Pro Bowl rate since 2010.<br /><br />
              <strong>Trading Down</strong><br />
              A trade back to the 4-8 range could yield 2-3 additional premium picks. The Bears have 7 roster holes, and the draft capital could accelerate a complete rebuild.<br /><br />
              <strong>Scout&apos;s Take:</strong> Given the Bears&apos; current cap space of $42M and existing roster needs at OL, EDGE, and CB — trading down offers more total value unless the #1 QB is a generational prospect.
              <span className="hm-chat-source">Sources: ESPN, OverTheCap, Pro Football Reference</span>
            </div>
          </div>
          <div className="hm-chat-input">
            <input className="hm-chat-input-field" type="text" placeholder="Ask Scout anything about Chicago sports..." readOnly />
            <button className="hm-chat-send" aria-label="Send">&rarr;</button>
          </div>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="hm-suggestions hm-fade-in">
        {SUGGESTIONS.map((s) => (
          <span key={s} className="hm-chip">{s}</span>
        ))}
      </div>

      {/* Capabilities */}
      <div className="hm-cap-grid hm-fade-in">
        <div className="hm-cap-card">
          <div className="hm-cap-icon">
            <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h4>Real-Time Data</h4>
          <p>Connected to live feeds across all four leagues. Always current.</p>
        </div>
        <div className="hm-cap-card">
          <div className="hm-cap-icon">
            <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h4>Salary Cap Engine</h4>
          <p>Full CBA-aware calculations for trades, extensions, and cap projections.</p>
        </div>
        <div className="hm-cap-card">
          <div className="hm-cap-icon">
            <svg width="24" height="24" fill="none" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            </svg>
          </div>
          <h4>Historical Database</h4>
          <p>Decades of Chicago sports history, stats, and records at your fingertips.</p>
        </div>
      </div>

      {/* CTA */}
      <section className="hm-cta-section">
        <div className="hm-container">
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <h2>Ready to ask Scout?</h2>
            <p>Get real answers about Chicago sports — powered by data, not opinions.</p>
            <Link href="/scout-ai" className="hm-btn-primary">
              Launch Scout AI &rarr;
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
