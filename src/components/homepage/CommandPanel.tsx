// src/components/homepage/CommandPanel.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: string;
  title: string;
  slug: string;
  team_slug: string | null;
  category_slug: string | null;
  published_at: string;
}

interface CommandPanelProps {
  posts: Post[];
  trendingPosts: Post[];
  isLoggedIn: boolean;
}

const TODAY_KEYS = [
  {
    label: 'Trade Rumors',
    href: '/chicago-bears/trade-rumors',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M14 14l7 7M3 8V3h5M10 10L3 3" />
      </svg>
    ),
  },
  {
    label: 'Draft Tracker',
    href: '/chicago-bears/draft-tracker',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    label: 'Cap Tracker',
    href: '/chicago-bears/cap-tracker',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    label: 'Game Center',
    href: '/chicago-bears/game-center',
    icon: (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  },
];

const TOOLS = [
  { label: 'Scout AI', href: '/scout-ai', icon: '/downloads/scout-v2.png', isImage: true },
  { label: 'GM Trade Sim', href: '/gm', isImage: false },
  { label: 'Mock Draft', href: '/mock-draft', isImage: false },
  { label: 'Fan Chat', href: '/fan-chat', isImage: false },
];

const TEAM_CONFIG: Record<string, { label: string; hub: string }> = {
  bears: { label: 'BEARS', hub: '/chicago-bears' },
  bulls: { label: 'BULLS', hub: '/chicago-bulls' },
  blackhawks: { label: 'HAWKS', hub: '/chicago-blackhawks' },
  cubs: { label: 'CUBS', hub: '/chicago-cubs' },
  'white-sox': { label: 'SOX', hub: '/chicago-white-sox' },
  whitesox: { label: 'SOX', hub: '/chicago-white-sox' },
};

export function CommandPanel({ posts, trendingPosts, isLoggedIn }: CommandPanelProps) {
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);

  // Load user favorite teams
  useEffect(() => {
    if (!isLoggedIn) return;
    fetch('/api/user/preferences')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.favorite_teams?.length) {
          setFavoriteTeams(data.favorite_teams);
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  // Count today's posts per team
  const teamCounts = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const counts: Record<string, number> = {};

    for (const post of posts) {
      const slug = post.team_slug;
      if (!slug) continue;
      const pubDate = new Date(post.published_at);
      if (pubDate >= todayStart) {
        counts[slug] = (counts[slug] || 0) + 1;
      }
    }
    return counts;
  }, [posts]);

  // Determine which teams to show in snapshot
  const snapshotTeams = favoriteTeams.length > 0
    ? favoriteTeams
    : ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];

  return (
    <aside className="command-panel" aria-label="Command Panel">
      {/* Section 1: Today's Keys */}
      <div className="cmd-card">
        <h4 className="cmd-card-title">Today&apos;s Keys</h4>
        <div className="cmd-keys-list">
          {TODAY_KEYS.map((item) => (
            <Link key={item.href} href={item.href} className="cmd-key-link">
              <span className="cmd-key-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 2: Tools */}
      <div className="cmd-card">
        <h4 className="cmd-card-title">Tools</h4>
        <div className="cmd-tools-grid">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href} className="cmd-tool-chip">
              {tool.isImage ? (
                <Image src={tool.icon!} alt="" width={14} height={14} unoptimized style={{ borderRadius: '50%' }} />
              ) : (
                <span className="cmd-tool-dot" />
              )}
              <span>{tool.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Section 3: My Teams Snapshot */}
      <div className="cmd-card">
        <h4 className="cmd-card-title">
          {favoriteTeams.length > 0 ? 'My Teams' : 'Chicago Snapshot'}
        </h4>
        <div className="cmd-teams-list">
          {snapshotTeams.map((slug) => {
            const config = TEAM_CONFIG[slug];
            if (!config) return null;
            const count = teamCounts[slug] || teamCounts[slug === 'whitesox' ? 'white-sox' : slug] || 0;
            return (
              <Link key={slug} href={config.hub} className="cmd-team-row">
                <span className="cmd-team-label">{config.label}</span>
                <span className="cmd-team-count">
                  {count > 0 ? `${count} new today` : 'No stories yet'}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Section 4: Trending (compact) */}
      {trendingPosts.length > 0 && (
        <div className="cmd-card">
          <h4 className="cmd-card-title">Trending</h4>
          <div className="cmd-trending-list">
            {trendingPosts.slice(0, 4).map((post, i) => {
              const url = post.category_slug
                ? `/${post.category_slug}/${post.slug}`
                : `/${post.slug}`;
              return (
                <Link key={post.id} href={url} className="cmd-trending-item">
                  <span className="cmd-trending-rank">{i + 1}</span>
                  <span className="cmd-trending-title">{post.title}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </aside>
  );
}
