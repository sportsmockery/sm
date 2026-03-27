'use client';

import * as React from 'react';
import Image from 'next/image';

type ScoutItem = {
  team: string;
  text: string;
};

type RadarItem = {
  label: string;
  tone?: 'neutral' | 'up' | 'hot';
};

type ScoutReportCardProps = {
  username?: string;
  updatedAt?: string;
  greeting?: string;
  avatarSrc?: string;
  onWhatDidIMiss?: () => void;
  onPlayPause?: () => void;
  isPlaying?: boolean;
  items?: ScoutItem[];
  radarItems?: RadarItem[];
};

const defaultItems: ScoutItem[] = [
  {
    team: 'Bears',
    text: 'Offseason focus remains on supporting Caleb Williams and the offense; OTA dates and minicamp are ahead.',
  },
  {
    team: 'Bulls',
    text: 'Front office and fans are weighing roster direction as the offseason approaches.',
  },
  {
    team: 'Blackhawks',
    text: 'Connor Bedard and the young core continue to draw attention; schedule highlights and matchup talk.',
  },
  {
    team: 'Cubs',
    text: 'Pitching depth and deadline moves are in the rumor mill.',
  },
  {
    team: 'White Sox',
    text: 'Rebuild timeline and farm system progress stay in the conversation.',
  },
];

const defaultRadarItems: RadarItem[] = [
  { label: 'Bears OTA dates announced', tone: 'neutral' },
  { label: 'Cubs pitching depth rumor rising', tone: 'up' },
  { label: 'Caleb Williams trending', tone: 'up' },
  { label: 'Bedard faces Predators tonight', tone: 'hot' },
];

function RadarDot({ tone = 'neutral' }: { tone?: RadarItem['tone'] }) {
  const toneClass =
    tone === 'up'
      ? 'bg-emerald-400'
      : tone === 'hot'
        ? 'bg-[#bc0000]'
        : 'bg-white/55';

  return <span className={`h-2 w-2 rounded-full ${toneClass}`} />;
}

export default function ScoutReportCard({
  username = 'cbur22',
  updatedAt = '10:15 AM',
  greeting = 'Yo cbur22, morning. Grab your coffee — we got stuff to talk about.',
  avatarSrc = '/scout-avatar.png',
  onWhatDidIMiss,
  onPlayPause,
  isPlaying = false,
  items = defaultItems,
  radarItems = defaultRadarItems,
}: ScoutReportCardProps) {
  const resolvedGreeting =
    greeting === 'Yo cbur22, morning. Grab your coffee — we got stuff to talk about.'
      ? `Yo ${username}, morning. Grab your coffee — we got stuff to talk about.`
      : greeting;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[rgba(18,24,33,0.86)] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      {onPlayPause && (
        <div className="absolute top-5 right-6 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            className="rounded-lg transition-all duration-200 hover:opacity-90 flex items-center justify-center"
            style={{
              color: 'var(--sm-text-meta)',
              padding: '12px 14px',
              background: 'rgba(27, 36, 48, 0.6)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            aria-label={isPlaying ? 'Pause Scout report' : 'Play Scout report'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/8 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-px bg-white/5" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-white/5" />

      <div className="relative px-5 py-5 md:px-8 md:py-7">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] md:px-6 md:py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 md:gap-5">
              <div className="shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#0B0F14] shadow-[0_8px_24px_rgba(0,0,0,0.35)] md:h-20 md:w-20">
                  <Image
                    src={avatarSrc}
                    alt="Scout"
                    width={64}
                    height={64}
                    className="h-14 w-14 object-contain md:h-16 md:w-16"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="text-[1.75rem] font-extrabold uppercase tracking-[0.18em] text-[#00D4FF] md:text-[2.25rem]">
                    Scout Report
                  </h2>

                  <span className="text-xs font-medium text-white/45 md:text-sm">
                    · Updated {updatedAt}
                  </span>
                </div>

                <p className="mt-3 max-w-3xl text-base font-medium leading-7 text-white/92 md:text-[1.125rem]">
                  {resolvedGreeting}
                </p>

                <p className="mt-2 text-sm leading-6 text-white/50 md:text-[15px]">
                  Personalized Chicago sports brief powered by SM Edge.
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={onWhatDidIMiss}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-white"
              >
                What&apos;d I Miss?
              </button>
            </div>
          </div>

          <div className="mt-5 h-px w-full bg-white/8" />

          <div className="mt-5 grid gap-4">
            {items.map((item) => (
              <div
                key={item.team}
                className="grid grid-cols-[92px_1fr] gap-3 md:grid-cols-[108px_1fr]"
              >
                <div className="text-sm font-bold text-white md:text-[15px]">
                  {item.team}
                </div>
                <div className="text-sm leading-6 text-white/68 md:text-[15px]">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">
              Scout Radar
            </h3>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {radarItems.map((item) => (
              <button
                key={item.label}
                type="button"
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/88 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
              >
                <RadarDot tone={item.tone} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
