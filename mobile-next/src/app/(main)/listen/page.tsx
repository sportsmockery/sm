'use client';

import { useEffect, useState } from 'react';
import { Pause, Play, Rewind, FastForward, Square } from 'lucide-react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { api } from '@/lib/api';
import { haptic } from '@/lib/haptics';

export default function ListenPage() {
  const player = useAudioPlayer();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (player.track) return;
    let cancelled = false;
    setLoading(true);
    api.getFirstAudioArticle('recent').then((art) => {
      if (cancelled || !art) return;
      player.load({
        id: art.id,
        title: art.title,
        artist: 'Sports Mockery',
        src: api.getAudioUrl(art.slug),
      });
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const min = Math.floor(player.position / 60).toString().padStart(2, '0');
  const sec = Math.floor(player.position % 60).toString().padStart(2, '0');

  return (
    <main className="px-5 pt-8 pb-32 safe-top">
      <h1 className="text-display font-bold text-white">Listen</h1>
      <p className="mt-1 text-sm text-white/60">
        Stream Sports Mockery articles, hands-free.
      </p>

      <LiquidGlassCard className="mt-6">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">
          {player.state === 'idle' ? 'Idle' : player.state === 'loading' || loading ? 'Loading…' : 'Now playing'}
        </div>
        <h2 className="mt-2 text-lg font-semibold text-white line-clamp-2">
          {player.track?.title ?? '—'}
        </h2>

        <div className="mt-4 h-1 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-brand-red"
            style={{ width: player.duration ? `${(player.position / player.duration) * 100}%` : '0%' }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-white/50 tabular-nums">
          <span>{min}:{sec}</span>
          <span>
            {Math.floor((player.duration || 0) / 60).toString().padStart(2, '0')}:
            {Math.floor((player.duration || 0) % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => { haptic('light'); player.seekRelative(-15); }}
            aria-label="Rewind 15 seconds"
            className="h-12 w-12 rounded-full bg-white/10 grid place-items-center text-white"
          >
            <Rewind size={20} />
          </button>
          <button
            onClick={() => { haptic('medium'); player.toggle(); }}
            aria-label={player.isPlaying ? 'Pause' : 'Play'}
            className="h-16 w-16 rounded-full bg-brand-red grid place-items-center text-white"
          >
            {player.isPlaying ? <Pause size={26} /> : <Play size={26} />}
          </button>
          <button
            onClick={() => { haptic('light'); player.seekRelative(15); }}
            aria-label="Forward 15 seconds"
            className="h-12 w-12 rounded-full bg-white/10 grid place-items-center text-white"
          >
            <FastForward size={20} />
          </button>
        </div>

        <button
          onClick={() => { haptic('light'); player.stop(); }}
          className="mt-6 w-full rounded-xl bg-white/5 text-white/70 py-2 text-xs flex items-center justify-center gap-2"
        >
          <Square size={12} /> Stop
        </button>
      </LiquidGlassCard>
    </main>
  );
}
