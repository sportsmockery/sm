'use client';

import React, { useState } from 'react';

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
    <div className="min-h-screen bg-[#0B0F14]">
      {/* Mobile: horizontal scrollable filter strip */}
      <div className="md:hidden">
        {/* Feed mode pills */}
        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          {FEED_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onFeedModeChange(m.key)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                feedMode === m.key
                  ? 'bg-[#BC0000] text-white'
                  : 'bg-[#1B2430] text-[#E6E8EC] hover:bg-[#2B3442]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {/* Team filter pills */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {TEAM_FILTERS.map((t) => (
            <button
              key={t.key}
              onClick={() => onTeamFilterChange(t.key)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                teamFilter === t.key
                  ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                  : 'bg-[#121821]/80 text-[#E6E8EC] border border-[#2B3442] hover:bg-[#2B3442]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        {/* Left Rail — desktop only */}
        <aside className="hidden md:block w-[280px] shrink-0 sticky top-0 h-screen overflow-y-auto p-4 bg-[#121821]/80 border-r border-[#2B3442]">
          {/* Feed Mode buttons */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
              Feed
            </h3>
            <div className="flex flex-col gap-1">
              {FEED_MODES.map((m) => (
                <button
                  key={m.key}
                  onClick={() => onFeedModeChange(m.key)}
                  className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    feedMode === m.key
                      ? 'bg-[#BC0000]/20 text-[#FAFAFB]'
                      : 'text-[#E6E8EC] hover:bg-[#1B2430]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Team filter pills */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
              Teams
            </h3>
            <div className="flex flex-wrap gap-2">
              {TEAM_FILTERS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onTeamFilterChange(t.key)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    teamFilter === t.key
                      ? 'bg-[#00D4FF]/20 text-[#00D4FF] border border-[#00D4FF]/40'
                      : 'bg-[#1B2430] text-[#E6E8EC] border border-[#2B3442] hover:bg-[#2B3442]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trending Now placeholder */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
              Trending Now
            </h3>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 rounded bg-[#1B2430] animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Live Fan-Chat peek placeholder */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8] mb-3">
              Live Chat
            </h3>
            <div className="rounded-lg border border-[#2B3442] bg-[#1B2430] p-3">
              <p className="text-xs text-[#94a3b8] italic">
                Join the conversation
              </p>
            </div>
          </div>
        </aside>

        {/* Center Feed */}
        <main className="w-full max-w-[680px] px-4 py-4">{children}</main>

        {/* Right Rail — desktop only */}
        <aside className="hidden lg:block w-[320px] shrink-0 sticky top-0 h-screen overflow-y-auto p-4 bg-[#121821]/80 border-l border-[#2B3442]">
          {/* SM+ upsell */}
          <div className="rounded-xl border border-[#D6B05E]/30 bg-[#1B2430] p-4 mb-6">
            <h3 className="text-sm font-bold text-[#D6B05E] mb-1">
              Unlock Scout Pro
            </h3>
            <p className="text-xs text-[#E6E8EC] mb-3">
              Get exclusive analysis, ad-free experience, and priority Scout AI access.
            </p>
            <button
              className="w-full rounded-lg py-2 text-xs font-semibold text-[#0B0F14]"
              style={{ backgroundColor: '#D6B05E' }}
            >
              Upgrade to SM+
            </button>
          </div>

          {/* Daily Scout placeholder */}
          <div className="rounded-xl border border-[#2B3442] bg-[#1B2430] p-4 mb-6">
            <h3 className="text-sm font-bold text-[#FAFAFB] mb-1">
              Your Daily Scout
            </h3>
            <p className="text-xs text-[#94a3b8] italic">
              Personalized summary loading...
            </p>
          </div>

          {/* Newsletter signup */}
          <div className="rounded-xl border border-[#2B3442] bg-[#1B2430] p-4 mb-6">
            <h3 className="text-sm font-bold text-[#FAFAFB] mb-2">
              Join Newsletter
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 rounded-lg bg-[#0B0F14] border border-[#2B3442] px-3 py-1.5 text-xs text-[#FAFAFB] placeholder-[#94a3b8] outline-none focus:border-[#00D4FF]"
              />
              <button
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                style={{ backgroundColor: '#BC0000' }}
              >
                Go
              </button>
            </div>
          </div>

          {/* Download app */}
          <div className="rounded-xl border border-[#2B3442] bg-[#1B2430] p-4 mb-6">
            <h3 className="text-sm font-bold text-[#FAFAFB] mb-2">
              Download App
            </h3>
            <button
              className="w-full rounded-lg py-2 text-xs font-semibold text-white"
              style={{ backgroundColor: '#BC0000' }}
            >
              Get the SM App
            </button>
          </div>

          {/* Live scores placeholder */}
          <div className="rounded-xl border border-[#2B3442] bg-[#1B2430] p-4">
            <h3 className="text-sm font-bold text-[#FAFAFB] mb-2">
              Live Scores
            </h3>
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-[#0B0F14] animate-pulse"
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
