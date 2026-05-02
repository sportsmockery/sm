'use client';

import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import type { DraftPick } from '@/lib/gm-types';
import { cn } from '@/lib/utils';

export interface DraftPicksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side: 'sent' | 'received';
  onAdd: (pick: DraftPick) => void;
}

const NFL_ROUNDS = [1, 2, 3, 4, 5, 6, 7];
const YEAR_OFFSETS = [0, 1, 2, 3];

export function DraftPicksSheet({ open, onOpenChange, side, onAdd }: DraftPicksSheetProps) {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [round, setRound] = useState<number>(1);
  const [condition, setCondition] = useState('');

  const years = useMemo(() => {
    const base = new Date().getFullYear();
    return YEAR_OFFSETS.map((o) => base + o);
  }, []);

  function add() {
    onAdd({ year, round, condition: condition.trim() || undefined });
    setCondition('');
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={`Draft pick · ${side === 'sent' ? 'I send' : 'I receive'}`}>
      <div className="space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Year</div>
          <div className="flex gap-2">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={cn(
                  'flex-1 rounded-xl px-3 py-2 text-sm transition-colors',
                  year === y ? 'bg-brand-red text-white font-semibold' : 'bg-white/5 text-white/70',
                )}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Round</div>
          <div className="grid grid-cols-7 gap-2">
            {NFL_ROUNDS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRound(r)}
                className={cn(
                  'rounded-xl px-2 py-2 text-sm transition-colors',
                  round === r ? 'bg-brand-red text-white font-semibold' : 'bg-white/5 text-white/70',
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">Condition (optional)</div>
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Top-5 protected"
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40"
          />
        </div>

        <button
          type="button"
          onClick={add}
          className="w-full rounded-xl bg-brand-red text-white font-semibold py-3 text-sm"
        >
          Add {year} round {round}
        </button>
      </div>
    </Sheet>
  );
}
