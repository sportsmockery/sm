'use client';

import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { gmApi } from '@/lib/gm-api';
import type { OpponentTeam, PlayerData } from '@/lib/gm-types';
import { cn, formatNumber } from '@/lib/utils';

export interface OpponentRosterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opponent: OpponentTeam | null;
  selectedIds: Set<string>;
  onToggle: (player: PlayerData) => void;
}

export function OpponentRosterSheet({ open, onOpenChange, opponent, selectedIds, onToggle }: OpponentRosterSheetProps) {
  const [roster, setRoster] = useState<PlayerData[] | null>(null);

  useEffect(() => {
    if (!opponent || !open) return;
    let cancelled = false;
    setRoster(null);
    gmApi
      .getRoster(String(opponent.team_key), opponent.sport)
      .then((r) => { if (!cancelled) setRoster(r.players); })
      .catch(() => { if (!cancelled) setRoster([]); });
    return () => { cancelled = true; };
  }, [opponent, open]);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={opponent ? `${opponent.team_name} roster` : 'Roster'}
    >
      {!opponent ? (
        <p className="text-sm text-white/60">Pick an opponent first.</p>
      ) : !roster ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {roster.map((p) => {
            const id = String(p.player_id);
            const selected = selectedIds.has(id);
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => onToggle(p)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors',
                    selected ? 'bg-brand-opponent/20 border border-brand-opponent/60' : 'bg-white/5 border border-transparent',
                  )}
                >
                  {p.headshot_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.headshot_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs text-white/70">
                      {p.full_name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{p.full_name}</div>
                    <div className="text-[11px] text-white/60">{p.position}</div>
                  </div>
                  <span className="text-xs tabular-nums text-white/80">
                    ${formatNumber(p.cap_hit ?? p.base_salary ?? 0)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
