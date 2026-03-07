'use client';

import React from 'react';
import ScoutGreeting from './ScoutGreeting';
import ScoutBriefingGrid from './ScoutBriefingGrid';
import RightRailCard from './RightRailCard';
import FanToolsCard from './FanToolsCard';

const FEED_MODES = [
  { key: 'for_you', label: 'For You' },
  { key: 'live', label: 'Live' },
  { key: 'trending', label: 'Trending' },
  { key: 'scout', label: 'Scout' },
  { key: 'community', label: 'Community' },
  { key: 'watch', label: 'Watch' },
  { key: 'listen', label: 'Listen' },
  { key: 'data', label: 'Data' },
];

const TEAM_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'bears', label: 'Bears' },
  { key: 'cubs', label: 'Cubs' },
  { key: 'bulls', label: 'Bulls' },
  { key: 'blackhawks', label: 'Blackhawks' },
  { key: 'white-sox', label: 'White Sox' },
];

const TEAM_HUBS = [
  { key: 'bears', label: 'Bears', href: '/chicago-bears', accent: '#C83803' },
  { key: 'bulls', label: 'Bulls', href: '/chicago-bulls', accent: '#CE1141' },
  { key: 'cubs', label: 'Cubs', href: '/chicago-cubs', accent: '#0E3386' },
  { key: 'blackhawks', label: 'Blackhawks', href: '/chicago-blackhawks', accent: '#CF0A2C' },
  { key: 'white-sox', label: 'White Sox', href: '/chicago-white-sox', accent: '#6B7280' },
];

interface RiverLayoutProps {
  children: React.ReactNode;
  feedMode: string;
  teamFilter: string;
  onFeedModeChange: (mode: string) => void;
  onTeamFilterChange: (team: string) => void;
}

export default function RiverLayout({
  children,
  feedMode,
  teamFilter,
  onFeedModeChange,
  onTeamFilterChange,
}: RiverLayoutProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      {/* Mobile: horizontal scrollable filter strip */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {FEED_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onFeedModeChange(m.key)}
              className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors"
              style={
                feedMode === m.key
                  ? { backgroundColor: '#BC0000', color: '#fff' }
                  : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }
              }
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {TEAM_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTeamFilterChange(t.key)}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors"
              style={
                teamFilter === t.key
                  ? { backgroundColor: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }
                  : { backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)', border: '1px solid var(--sm-border)' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        {/* ---- Left Rail — desktop only ---- */}
        <aside
          className="hidden md:block w-[260px] shrink-0 sticky top-0 h-screen overflow-y-auto p-4"
          style={{
            backgroundColor: 'var(--sm-surface)',
            borderRight: '1px solid var(--sm-border)',
          }}
        >
          {/* Feed Mode buttons */}
          <div className="mb-6">
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              Feed
            </h3>
            <div className="flex flex-col gap-0.5">
              {FEED_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onFeedModeChange(m.key)}
                  className="text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={
                    feedMode === m.key
                      ? { backgroundColor: 'rgba(188,0,0,0.12)', color: 'var(--sm-text)' }
                      : { color: 'var(--sm-text-muted)' }
                  }
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team filter pills */}
          <div className="mb-6">
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              Teams
            </h3>
            <div className="flex flex-wrap gap-2">
              {TEAM_FILTERS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onTeamFilterChange(t.key)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-colors"
                  style={
                    teamFilter === t.key
                      ? { backgroundColor: 'rgba(0,212,255,0.12)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.3)' }
                      : { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text-muted)', border: '1px solid var(--sm-border)' }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Now */}
          <div className="mb-6">
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              Trending Now
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--sm-card)' }}
                />
              ))}
            </div>
          </div>

          {/* Live Chat peek */}
          <div>
            <h3
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              Live Chat
            </h3>
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: 'var(--sm-card)',
                border: '1px solid var(--sm-border)',
              }}
            >
              <p
                className="text-xs italic"
                style={{ color: 'var(--sm-text-dim)' }}
              >
                Join the conversation
              </p>
            </div>
          </div>
        </aside>

        {/* ---- Center Feed ---- */}
        <main className="w-full max-w-[680px] px-4 py-4">
          {/* Hero zone: greeting + Scout briefing */}
          <div className="mb-6">
            <ScoutGreeting />
            <ScoutBriefingGrid />
          </div>

          {/* Divider between briefing and feed */}
          <div className="flex items-center gap-2 mb-5">
            <h3
              className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
              style={{ color: 'var(--sm-text-dim)' }}
            >
              Your Feed
            </h3>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--sm-border)' }}
            />
          </div>

          {children}
        </main>

        {/* ---- Right Rail — desktop only ---- */}
        <aside
          className="hidden lg:flex flex-col gap-4 w-[300px] shrink-0 sticky top-0 h-screen overflow-y-auto p-4"
          style={{
            backgroundColor: 'var(--sm-surface)',
            borderLeft: '1px solid var(--sm-border)',
          }}
        >
          {/* SM+ Upsell */}
          <RightRailCard title="SM+ Premium" accentColor="#D6B05E">
            <p
              className="text-xs mb-3 leading-relaxed"
              style={{ color: 'var(--sm-text-muted)' }}
            >
              Exclusive analysis, ad-free, and priority Scout AI access.
            </p>
            <a
              href="/sm-plus"
              className="block w-full rounded-lg py-2 text-xs font-semibold text-center transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#D6B05E', color: '#0B0F14' }}
            >
              Upgrade to SM+
            </a>
          </RightRailCard>

          {/* Team Hubs */}
          <RightRailCard title="Team Hubs">
            <div className="flex flex-col gap-1">
              {TEAM_HUBS.map((team) => (
                <a
                  key={team.key}
                  href={team.href}
                  className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors duration-150"
                  style={{ color: 'var(--sm-text)' }}
                >
                  {/* Team accent dot */}
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: team.accent }}
                  />
                  <span className="text-sm font-medium">{team.label}</span>
                  <svg
                    className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
              ))}
            </div>
          </RightRailCard>

          {/* Fan Tools */}
          <RightRailCard title="Fan Tools">
            <FanToolsCard />
          </RightRailCard>

          {/* Chicago Snapshot */}
          <RightRailCard title="Chicago Snapshot">
            <div className="space-y-2">
              {[
                { team: 'Bears', record: '11-6', accent: '#C83803' },
                { team: 'Bulls', record: '23-22', accent: '#CE1141' },
                { team: 'Hawks', record: '21-22-8', accent: '#CF0A2C' },
                { team: 'Cubs', record: '92-70', accent: '#0E3386' },
                { team: 'Sox', record: '60-102', accent: '#6B7280' },
              ].map((t) => (
                <div
                  key={t.team}
                  className="flex items-center justify-between py-1"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: t.accent }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--sm-text)' }}
                    >
                      {t.team}
                    </span>
                  </div>
                  <span
                    className="text-xs font-semibold tabular-nums"
                    style={{ color: 'var(--sm-text-muted)' }}
                  >
                    {t.record}
                  </span>
                </div>
              ))}
            </div>
          </RightRailCard>

          {/* Newsletter */}
          <RightRailCard title="Newsletter" accentColor="#BC0000">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 rounded-lg px-3 py-1.5 text-xs outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--sm-surface)',
                  border: '1px solid var(--sm-border)',
                  color: 'var(--sm-text)',
                }}
              />
              <button
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#BC0000' }}
              >
                Go
              </button>
            </div>
          </RightRailCard>

          {/* Live Scores */}
          <RightRailCard title="Live Scores">
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--sm-surface)' }}
                />
              ))}
              <p
                className="text-[10px] text-center pt-1"
                style={{ color: 'var(--sm-text-dim)' }}
              >
                No live games right now
              </p>
            </div>
          </RightRailCard>

          {/* Download App */}
          <RightRailCard title="Get the App">
            <a
              href="#"
              className="block w-full rounded-lg py-2 text-xs font-semibold text-center text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#BC0000' }}
            >
              Download SM App
            </a>
          </RightRailCard>
        </aside>
      </div>

      {/* Mobile: stacked right rail content below feed */}
      <div
        className="lg:hidden px-4 pb-8 space-y-4"
        style={{ backgroundColor: 'var(--sm-dark)' }}
      >
        <div
          className="flex items-center gap-2 mt-4 mb-2"
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
            style={{ color: 'var(--sm-text-dim)' }}
          >
            More
          </h3>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: 'var(--sm-border)' }}
          />
        </div>

        <RightRailCard title="Team Hubs">
          <div className="flex flex-wrap gap-2">
            {TEAM_HUBS.map((team) => (
              <a
                key={team.key}
                href={team.href}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: 'var(--sm-card)',
                  border: '1px solid var(--sm-border)',
                  color: 'var(--sm-text)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: team.accent }}
                />
                {team.label}
              </a>
            ))}
          </div>
        </RightRailCard>

        <RightRailCard title="Fan Tools">
          <FanToolsCard />
        </RightRailCard>
      </div>
    </div>
  );
}
