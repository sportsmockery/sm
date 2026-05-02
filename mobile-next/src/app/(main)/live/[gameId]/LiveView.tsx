'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { cn } from '@/lib/utils';

type LiveData = {
  game?: {
    home_team?: string;
    away_team?: string;
    home_score?: number;
    away_score?: number;
    period?: string;
    clock?: string;
    status?: string;
  };
  videoUrl?: string;
};

function LiveInner() {
  const params = useSearchParams();
  const gameId = params.get('id');
  const [data, setData] = useState<LiveData | null>(null);
  const [theater, setTheater] = useState(false);
  const [muted, setMuted] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    let interval: number | undefined;

    async function poll() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://test.sportsmockery.com'}/api/live-games/${gameId}`,
        );
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        /* ignore */
      }
    }

    poll();
    interval = window.setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      if (interval) window.clearInterval(interval);
    };
  }, [gameId]);

  const game = data?.game;
  const videoUrl = data?.videoUrl;

  return (
    <main className="relative min-h-dvh">
      {theater && (
        <motion.div
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black z-30"
        />
      )}

      <div className="relative z-40 flex items-center justify-between px-4 pt-3 safe-top">
        <Link
          href="/"
          aria-label="Back"
          className={cn(
            'liquid-glass-pill h-10 w-10 grid place-items-center',
            theater ? 'text-white' : 'text-white/80',
          )}
        >
          <ChevronLeft size={18} />
        </Link>
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="liquid-glass-pill h-10 w-10 grid place-items-center text-white"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <motion.div
        layout
        layoutId="theater-video"
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        onClick={() => setTheater((t) => !t)}
        className={cn(
          'relative z-40 mt-4 mx-4 rounded-2xl overflow-hidden bg-black cursor-pointer',
          theater ? 'fixed inset-0 m-0 rounded-none' : 'aspect-video',
        )}
      >
        {videoUrl ? (
          <video
            src={videoUrl}
            playsInline
            autoPlay
            muted={muted}
            loop
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-white/40 text-sm">
            Awaiting stream…
          </div>
        )}

        <div className="absolute inset-y-0 left-0 w-16" aria-hidden />
        <div className="absolute inset-y-0 right-0 w-16" aria-hidden />

        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="liquid-glass-pill px-3 py-1.5 text-xs text-white">
            {game?.away_team ?? '—'} {game?.away_score ?? 0}
          </div>
          <div className="liquid-glass-pill px-3 py-1.5 text-xs text-white">
            {game?.period ?? ''} {game?.clock ?? ''}
          </div>
          <div className="liquid-glass-pill px-3 py-1.5 text-xs text-white">
            {game?.home_team ?? '—'} {game?.home_score ?? 0}
          </div>
        </div>
      </motion.div>

      {!theater && (
        <section className="relative z-10 px-4 pt-6 pb-24 space-y-3">
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">
              Game status
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {game?.status ?? 'Loading…'}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-xs text-white/50">Away</div>
                <div className="font-semibold text-white">{game?.away_team ?? '—'}</div>
                <div className="text-2xl tabular-nums text-white">{game?.away_score ?? 0}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-xs text-white/50">Home</div>
                <div className="font-semibold text-white">{game?.home_team ?? '—'}</div>
                <div className="text-2xl tabular-nums text-white">{game?.home_score ?? 0}</div>
              </div>
            </div>
          </LiquidGlassCard>
          <p className="text-center text-xs text-white/40">
            Tap the video to expand · tap again to exit theater
          </p>
        </section>
      )}
    </main>
  );
}

export function LiveView() {
  return (
    <Suspense fallback={<div className="p-8 text-white/60 text-sm">Loading…</div>}>
      <LiveInner />
    </Suspense>
  );
}
