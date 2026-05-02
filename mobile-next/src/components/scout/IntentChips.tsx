'use client';

import { cn } from '@/lib/utils';

export interface IntentChipsProps {
  suggestions: string[];
  onPick: (s: string) => void;
  className?: string;
}

export function IntentChips({ suggestions, onPick, className }: IntentChipsProps) {
  if (!suggestions.length) return null;
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)}>
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="shrink-0 liquid-glass-pill px-3 py-1.5 text-xs text-white/85 hover:text-white transition-colors"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
