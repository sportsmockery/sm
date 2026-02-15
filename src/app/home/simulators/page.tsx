'use client'

import { useState } from 'react'
import Link from 'next/link'

const TABS = ['NFL Trade', 'NBA Trade', 'MLB Trade', 'NHL Trade', 'Mock Draft']

const TRADE_TEAMS = {
  'NFL Trade': {
    left: { name: 'Chicago Bears', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
    right: { name: 'Green Bay Packers', abbr: 'GB', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png' },
    players: {
      left: [
        { name: 'DJ Moore', meta: 'WR | 88.2 OVR' },
        { name: '2026 1st Round', meta: 'Pick #9 Overall' },
      ],
      right: [
        { name: 'Jordan Love', meta: 'QB | 91.4 OVR' },
        { name: '2026 3rd Round', meta: 'Pick #72 Overall' },
      ],
    },
    grade: 'A-',
  },
  'NBA Trade': {
    left: { name: 'Chicago Bulls', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/chi.png' },
    right: { name: 'LA Lakers', abbr: 'LAL', logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png' },
    players: {
      left: [
        { name: 'Zach LaVine', meta: 'SG | 84.1 OVR' },
        { name: '2026 2nd Round', meta: 'Pick #38 Overall' },
      ],
      right: [
        { name: 'Rui Hachimura', meta: 'PF | 78.6 OVR' },
        { name: '2027 1st Round', meta: 'Lottery Protected' },
      ],
    },
    grade: 'B+',
  },
  'MLB Trade': {
    left: { name: 'Chicago Cubs', abbr: 'CHC', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/chc.png' },
    right: { name: 'NY Yankees', abbr: 'NYY', logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png' },
    players: {
      left: [
        { name: 'Ian Happ', meta: 'OF | .260 AVG' },
        { name: 'Top 10 Prospect', meta: 'RHP | A-Ball' },
      ],
      right: [
        { name: 'Gleyber Torres', meta: '2B | .257 AVG' },
        { name: '2026 Comp Pick', meta: 'Round 2' },
      ],
    },
    grade: 'B',
  },
  'NHL Trade': {
    left: { name: 'Chicago Blackhawks', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/chi.png' },
    right: { name: 'Toronto Maple Leafs', abbr: 'TOR', logo: 'https://a.espncdn.com/i/teamlogos/nhl/500/tor.png' },
    players: {
      left: [
        { name: 'Taylor Hall', meta: 'LW | 79.2 OVR' },
        { name: '2026 4th Round', meta: 'Pick #102' },
      ],
      right: [
        { name: 'Nick Robertson', meta: 'LW | 74.8 OVR' },
        { name: '2026 2nd Round', meta: 'Pick #55' },
      ],
    },
    grade: 'C+',
  },
  'Mock Draft': {
    left: { name: 'Chicago Bears', abbr: 'CHI', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png' },
    right: { name: 'Draft Board', abbr: 'NFL', logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/nfl.png' },
    players: {
      left: [
        { name: 'Pick #1 Overall', meta: '2026 NFL Draft' },
        { name: 'Pick #33 Overall', meta: 'Round 2' },
      ],
      right: [
        { name: 'Shedeur Sanders', meta: 'QB | Colorado' },
        { name: 'Tetairoa McMillan', meta: 'WR | Arizona' },
      ],
    },
    grade: 'A',
  },
}

export default function SimulatorsPage() {
  const [activeTab, setActiveTab] = useState('NFL Trade')
  const trade = TRADE_TEAMS[activeTab as keyof typeof TRADE_TEAMS]

  return (
    <>
      {/* Hero */}
      <section className="hm-page-hero">
        <div className="hm-page-hero-bg" />
        <div className="hm-hero-content hm-fade-in" style={{ position: 'relative', zIndex: 2 }}>
          <span className="hm-tag" style={{ marginBottom: 24 }}>Simulators</span>
          <h1>Think like a <span className="hm-gradient-text">GM</span></h1>
          <p>Build trades across any team, run mock drafts, and let AI grade every move. 124 teams. 4 leagues. Infinite possibilities.</p>
        </div>
      </section>

      {/* Tab Bar */}
      <div className="hm-container" style={{ paddingBottom: 120 }}>
        <div className="hm-tab-bar">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`hm-tab ${activeTab === tab ? 'hm-tab-active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Trade Builder */}
        <div className="hm-trade-builder">
          {/* Left Panel */}
          <div className="hm-trade-panel">
            <div className="hm-trade-panel-header">
              <div className="hm-trade-panel-logo">
                <img src={trade.left.logo} alt={trade.left.name} width={24} height={24} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{trade.left.name}</div>
                <div style={{ fontSize: 11, color: '#55556a' }}>{trade.left.abbr} sends</div>
              </div>
            </div>
            {trade.players.left.map((p) => (
              <div key={p.name} className="hm-player-slot">
                <div className="hm-player-avatar" />
                <div className="hm-player-info">
                  <div className="hm-player-name">{p.name}</div>
                  <div className="hm-player-meta">{p.meta}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Swap */}
          <div className="hm-trade-swap">
            <div className="hm-trade-swap-btn">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
              </svg>
            </div>
          </div>

          {/* Right Panel */}
          <div className="hm-trade-panel">
            <div className="hm-trade-panel-header">
              <div className="hm-trade-panel-logo">
                <img src={trade.right.logo} alt={trade.right.name} width={24} height={24} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{trade.right.name}</div>
                <div style={{ fontSize: 11, color: '#55556a' }}>{trade.right.abbr} sends</div>
              </div>
            </div>
            {trade.players.right.map((p) => (
              <div key={p.name} className="hm-player-slot">
                <div className="hm-player-avatar" />
                <div className="hm-player-info">
                  <div className="hm-player-name">{p.name}</div>
                  <div className="hm-player-meta">{p.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grade */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <span className="hm-grade-badge">AI GRADE: {trade.grade}</span>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
          <Link href="/gm" className="hm-btn-primary">
            Open Trade Simulator &rarr;
          </Link>
          <Link href="/mock-draft" className="hm-btn-secondary">
            Start Mock Draft &rarr;
          </Link>
        </div>
      </div>
    </>
  )
}
