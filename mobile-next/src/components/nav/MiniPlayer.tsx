'use client';

import Link from 'next/link';
import { Pause, Play, X } from 'lucide-react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { cn } from '@/lib/utils';

export function MiniPlayer() {
  const { state, track, toggle, stop } = useAudioPlayer();
  const visible = (state === 'playing' || state === 'paused') && track;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed left-3 right-3 z-30 liquid-glass-pill',
        'flex items-center gap-3 pl-3 pr-2 py-2',
        'transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : 'translate-y-[150%]',
        // Above bottom tabs (h ~64) + safe area
        'bottom-[calc(72px+env(safe-area-inset-bottom))]',
      )}
    >
      {track?.artwork && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={track.artwork} alt="" className="h-9 w-9 rounded-full object-cover" />
      )}
      <Link
        href="/listen"
        className="flex-1 min-w-0 text-left"
        aria-label="Open listen view"
      >
        <div className="text-sm font-semibold text-white truncate">
          {track?.title ?? '—'}
        </div>
        <div className="text-[11px] text-white/60 truncate">
          {state === 'playing' ? 'Now playing' : 'Paused'}
        </div>
      </Link>
      <button
        type="button"
        onClick={toggle}
        aria-label={state === 'playing' ? 'Pause' : 'Play'}
        className="h-9 w-9 rounded-full bg-brand-red text-white grid place-items-center"
      >
        {state === 'playing' ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <button
        type="button"
        onClick={stop}
        aria-label="Stop and close mini-player"
        className="h-9 w-9 rounded-full bg-white/10 text-white grid place-items-center"
      >
        <X size={16} />
      </button>
    </div>
  );
}
