'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRightLeft,
  BarChart3,
  MessageSquare,
  Newspaper,
  TrendingUp,
  CalendarDays,
  Circle,
} from 'lucide-react';

type RadarSignal = {
  id: string;
  label: string;
  href?: string;
  team?: 'bears' | 'bulls' | 'cubs' | 'hawks' | 'sox' | 'neutral';
  live?: boolean;
};

type BriefingCard = {
  id: string;
  type: 'latest' | 'rumor' | 'fan_pulse' | 'game_watch';
  label: string;
  title: string;
  description: string;
  meta?: string;
  team?: 'bears' | 'bulls' | 'cubs' | 'hawks' | 'sox' | 'neutral';
  progress?: number;
  split?: { left: number; right: number };
};

const radarSignals: RadarSignal[] = [
  { id: '1', label: 'Bears OTA dates announced', team: 'bears', live: true, href: '/chicago-bears' },
  { id: '2', label: 'Cubs pitching depth rumor rising', team: 'cubs', href: '/chicago-cubs' },
  { id: '3', label: 'Caleb Williams trending', team: 'bears', href: '/chicago-bears' },
  { id: '4', label: 'Bedard faces Predators tonight', team: 'hawks', href: '/chicago-blackhawks' },
  { id: '5', label: 'Bulls offseason sentiment mixed', team: 'bulls', href: '/chicago-bulls' },
];

const briefingCards: BriefingCard[] = [
  {
    id: 'b1',
    type: 'latest',
    label: 'Latest',
    title: 'Bears OTA dates announced for June',
    description: 'Mandatory minicamp June 10–12',
    meta: '2h ago',
    team: 'bears',
  },
  {
    id: 'b2',
    type: 'rumor',
    label: 'Rumor Meter',
    title: 'Cubs eyeing pitching depth at deadline',
    description: 'Multiple sources report interest in rental arms',
    meta: '4h ago',
    team: 'cubs',
    progress: 72,
  },
  {
    id: 'b3',
    type: 'fan_pulse',
    label: 'Fan Pulse',
    title: 'Bulls offseason outlook',
    description: 'Fan sentiment on roster direction',
    meta: '1h ago',
    team: 'bulls',
    split: { left: 62, right: 38 },
  },
  {
    id: 'b4',
    type: 'game_watch',
    label: 'Game Watch',
    title: 'Blackhawks vs Predators',
    description: 'Tonight 7:30 PM CT',
    meta: 'Tonight',
    team: 'hawks',
  },
];

function teamAccent(team?: BriefingCard['team'] | RadarSignal['team']) {
  switch (team) {
    case 'bears':
      return 'from-orange-500/70 to-orange-400/20';
    case 'bulls':
      return 'from-rose-500/70 to-rose-400/20';
    case 'cubs':
      return 'from-blue-500/70 to-blue-400/20';
    case 'hawks':
      return 'from-red-500/70 to-red-400/20';
    case 'sox':
      return 'from-slate-300/70 to-slate-400/20';
    default:
      return 'from-cyan-500/70 to-cyan-400/20';
  }
}

function teamSolid(team?: BriefingCard['team'] | RadarSignal['team']) {
  switch (team) {
    case 'bears':
      return 'bg-orange-500';
    case 'bulls':
      return 'bg-rose-500';
    case 'cubs':
      return 'bg-blue-500';
    case 'hawks':
      return 'bg-red-500';
    case 'sox':
      return 'bg-slate-300';
    default:
      return 'bg-cyan-500';
  }
}

function ScoutGreeting() {
  return (
    <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-md dark:bg-white/[0.04]">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-black">
            SM
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Scout Briefing
          </p>
          <p className="mt-1 text-[18px] font-medium leading-6 text-slate-100 dark:text-slate-100">
            Good morning. Here is what Chicago fans need to know right now.
          </p>
          <p className="mt-1 text-[13px] text-slate-400">Updated 2 minutes ago</p>
        </div>
      </div>
    </div>
  );
}

function ScoutRadarChip({ signal }: { signal: RadarSignal }) {
  const content = (
    <>
      <span className={`h-2 w-2 shrink-0 rounded-full ${teamSolid(signal.team)}`} />
      <span className="whitespace-nowrap text-[14px] font-medium text-slate-200 transition-colors group-hover:text-white">
        {signal.label}
      </span>
      {signal.live ? (
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300">
          Live
        </span>
      ) : null}
    </>
  );

  const chipClass =
    'group relative inline-flex min-h-11 items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left backdrop-blur-md transition-all hover:bg-white/10 dark:bg-white/[0.04]';

  if (signal.href) {
    return (
      <Link href={signal.href} className={chipClass}>
        {content}
      </Link>
    );
  }

  return (
    <button className={chipClass} type="button">
      {content}
    </button>
  );
}

function ScoutRadar({ signals }: { signals: RadarSignal[] }) {
  return (
    <section className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:bg-white/[0.04]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Scout Radar
          </p>
          <p className="mt-1 text-[14px] text-slate-300">
            Live signals across Chicago sports
          </p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {signals.map((signal) => (
          <ScoutRadarChip key={signal.id} signal={signal} />
        ))}
      </div>
    </section>
  );
}

function BriefingIcon({ type }: { type: BriefingCard['type'] }) {
  switch (type) {
    case 'latest':
      return <Newspaper className="h-4 w-4" />;
    case 'rumor':
      return <TrendingUp className="h-4 w-4" />;
    case 'fan_pulse':
      return <BarChart3 className="h-4 w-4" />;
    case 'game_watch':
      return <CalendarDays className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}

function ScoutBriefingCard({ card }: { card: BriefingCard }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition-all hover:bg-white/[0.07] dark:bg-white/[0.04]">
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${teamAccent(card.team)}`} />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <BriefingIcon type={card.type} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
            {card.label}
          </span>
        </div>
        {card.meta ? <span className="text-[12px] text-slate-500">{card.meta}</span> : null}
      </div>

      <h3 className="mt-3 text-[16px] font-semibold leading-5 text-slate-100">
        {card.title}
      </h3>

      <p className="mt-2 text-[14px] leading-5 text-slate-300">{card.description}</p>

      {typeof card.progress === 'number' ? (
        <div className="mt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${teamSolid(card.team)}`}
              style={{ width: `${card.progress}%` }}
            />
          </div>
          <p className="mt-2 text-[13px] text-slate-400">{card.progress}% confidence</p>
        </div>
      ) : null}

      {card.split ? (
        <div className="mt-4">
          <div className="flex h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="bg-emerald-500"
              style={{ width: `${card.split.left}%` }}
            />
            <div
              className="bg-rose-500"
              style={{ width: `${card.split.right}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-[13px]">
            <span className="text-emerald-400">{card.split.left}% positive</span>
            <span className="text-rose-400">{card.split.right}% negative</span>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ScoutBriefingGrid({ cards }: { cards: BriefingCard[] }) {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:bg-white/[0.04]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Scout Briefing
        </p>
        <p className="text-[13px] text-slate-400">For you</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <ScoutBriefingCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}

function RightRailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md dark:bg-white/[0.04]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SampleAnalyticsCard() {
  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-slate-900/80 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-cyan-400">
          Analytics
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <h2 className="text-[20px] font-semibold leading-6 text-slate-100">
            E2E: Bears Passing Yards
          </h2>
          <span className="shrink-0 text-[13px] text-slate-400">38d ago</span>
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="rounded-2xl border border-white/5 bg-black/25 p-4">
          <div className="h-48 rounded-xl bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(255,255,255,0.01))]">
            <div className="flex h-full items-end justify-between px-3 pb-3 text-[12px] text-slate-500">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-5 text-[14px] text-slate-400">
          <button type="button" className="transition-colors hover:text-slate-200">
            Like
          </button>
          <button type="button" className="transition-colors hover:text-slate-200">
            Share
          </button>
        </div>
      </div>
    </section>
  );
}

export default function RiverLayoutDemoPage() {
  return (
    <div className="min-h-screen bg-[#05070b] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
          {/* Left Rail */}
          <aside className="hidden xl:block">
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md dark:bg-white/[0.04]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Feed
              </p>

              <nav className="mt-4 space-y-2">
                {['For You', 'Live', 'Trending', 'Scout', 'Community', 'Watch', 'Listen', 'Data'].map(
                  (item, i) => (
                    <button
                      key={item}
                      type="button"
                      className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors ${
                        i === 0
                          ? 'bg-red-600/20 text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}
              </nav>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Teams
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['All', 'Bears', 'Cubs', 'Bulls', 'Blackhawks', 'White Sox'].map((team, i) => (
                    <button
                      key={team}
                      type="button"
                      className={`rounded-full border px-3 py-1.5 text-[13px] ${
                        i === 0
                          ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300'
                          : 'border-white/10 bg-white/5 text-slate-300'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="min-w-0">
            <ScoutGreeting />
            <ScoutRadar signals={radarSignals} />
            <ScoutBriefingGrid cards={briefingCards} />

            <section className="mt-6">
              <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Your Feed
              </p>
              <SampleAnalyticsCard />
            </section>
          </main>

          {/* Right Rail */}
          <aside className="min-w-0">
            <div className="sticky top-6 space-y-4 border-l border-white/10 pl-0 xl:pl-6">
              <RightRailCard title="Team Hubs">
                <div className="space-y-3 text-[15px] text-slate-200">
                  <Link
                    href="/chicago-bears/trade-rumors"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                  >
                    <ArrowRightLeft className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Trade Rumors</span>
                  </Link>
                  <Link
                    href="/mock-draft"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                  >
                    <Newspaper className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Draft Tracker</span>
                  </Link>
                  <Link
                    href="/chicago-bears/cap-tracker"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                  >
                    <BarChart3 className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Cap Tracker</span>
                  </Link>
                  <Link
                    href="/chicago-bears/game-center"
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 hover:bg-white/5"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
                    <span>Game Center</span>
                  </Link>
                </div>
              </RightRailCard>

              <RightRailCard title="SM 2.0 Fan Tools">
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/scout-ai"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-[14px] font-medium text-slate-200 hover:bg-white/10"
                  >
                    Scout AI
                  </Link>
                  <Link
                    href="/gm"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-[14px] font-medium text-slate-200 hover:bg-white/10"
                  >
                    Trade Sim
                  </Link>
                  <Link
                    href="/mock-draft"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-[14px] font-medium text-slate-200 hover:bg-white/10"
                  >
                    Mock Draft
                  </Link>
                  <Link
                    href="/fan-chat"
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center text-[14px] font-medium text-slate-200 hover:bg-white/10"
                  >
                    Fan Chat
                  </Link>
                </div>
              </RightRailCard>

              <RightRailCard title="Edge+">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[14px] text-slate-300">
                    <span>Theme</span>
                    <button
                      type="button"
                      className="h-8 w-14 rounded-full bg-white/10 p-1"
                      aria-label="Toggle theme"
                    >
                      <span className="block h-6 w-6 rounded-full bg-slate-200" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link href="/login" className="text-[14px] text-slate-300 hover:text-white">
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-full bg-cyan-400 px-4 py-2 text-[13px] font-semibold text-slate-950"
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </RightRailCard>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
