// src/components/homepage/HomepageSidebar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { TrendingSection } from './TrendingSection';

interface Post {
  id: string;
  title: string;
  slug: string;
  team_slug: string;
}

interface HomepageSidebarProps {
  trendingPosts: Post[];
}

const PLATFORM_TOOLS = [
  {
    title: 'Scout AI',
    desc: 'AI-powered sports answers',
    href: '/scout-ai',
    icon: (
      <Image
        src="/downloads/scout-v2.png"
        alt="Scout AI"
        width={20}
        height={20}
        style={{ borderRadius: '50%' }}
      />
    ),
  },
  {
    title: 'Trade Simulator',
    desc: 'Build & grade trades',
    href: '/gm',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
  },
  {
    title: 'Mock Draft',
    desc: 'Simulate your draft picks',
    href: '/mock-draft',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    title: 'Fan Hub',
    desc: 'Chat with Chicago fans',
    href: '/fan-zone',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: 'Data Hub',
    desc: 'Stats, standings & more',
    href: '/datahub',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    ),
  },
];

export function HomepageSidebar({ trendingPosts }: HomepageSidebarProps) {
  return (
    <aside className="sidebar">
      {/* Widget 1: Quick Tools (vertical list) */}
      <div className="sidebar-widget glass-card-static">
        <h4 className="widget-title">Platform Tools</h4>
        <div className="tool-list">
          {PLATFORM_TOOLS.map((tool) => (
            <Link key={tool.title} href={tool.href} className="tool-list-item">
              <div className="tool-list-icon">{tool.icon}</div>
              <div className="tool-list-text">
                <span className="tool-list-name">{tool.title}</span>
                <span className="tool-list-desc">{tool.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Widget 2: Live Scores */}
      <div className="sidebar-widget glass-card-static">
        <h4 className="widget-title">Live Scores</h4>
        <div className="score-list">
          <div className="score-empty">
            <p>No live games right now</p>
            <Link href="/chicago-bears/scores" className="score-link">View Recent Scores</Link>
          </div>
        </div>
      </div>

      {/* Widget 3: Trending Stories */}
      <TrendingSection posts={trendingPosts} />

      {/* Widget 4: Active Poll */}
      <div className="sidebar-widget glass-card-static">
        <h4 className="widget-title">Active Poll</h4>
        <div className="poll-widget">
          <p className="poll-question">Which Chicago team will make the biggest splash this offseason?</p>
          <div className="poll-options">
            <div className="poll-option">
              <span className="poll-label">Bears</span>
              <div className="poll-bar">
                <div className="poll-fill" style={{ width: '38%' }} />
              </div>
              <span className="poll-percent">38%</span>
            </div>
            <div className="poll-option">
              <span className="poll-label">Cubs</span>
              <div className="poll-bar">
                <div className="poll-fill" style={{ width: '29%' }} />
              </div>
              <span className="poll-percent">29%</span>
            </div>
            <div className="poll-option">
              <span className="poll-label">White Sox</span>
              <div className="poll-bar">
                <div className="poll-fill" style={{ width: '21%' }} />
              </div>
              <span className="poll-percent">21%</span>
            </div>
            <div className="poll-option">
              <span className="poll-label">Bulls / Blackhawks</span>
              <div className="poll-bar">
                <div className="poll-fill" style={{ width: '12%' }} />
              </div>
              <span className="poll-percent">12%</span>
            </div>
          </div>
          <Link href="/fan-zone" className="poll-cta">Join the Discussion &rarr;</Link>
        </div>
      </div>

      {/* Widget 5: SM+ CTA */}
      <div className="sidebar-widget sm-plus-cta">
        <div className="sm-plus-icon">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#ff4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        <h4>Upgrade to SM+</h4>
        <p>Unlock premium analysis, ad-free reading, and exclusive features.</p>
        <Link
          href="/pricing"
          className="sm-plus-btn"
          style={{
            backgroundColor: '#bc0000',
            color: '#ffffff',
            border: 'none',
          }}
        >
          Learn More
        </Link>
      </div>
    </aside>
  );
}
