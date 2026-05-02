'use client';

import { useEffect, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { gmApi } from '@/lib/gm-api';
import type { ChicagoTeam, PlayerData } from '@/lib/gm-types';
import { cn, formatNumber } from '@/lib/utils';

export interface RosterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: ChicagoTeam | null;
  selectedIds: Set<string>;
  onToggle: (player: PlayerData) => void;
}

export function RosterSheet({ open, onOpenChange, team, selectedIds, onToggle }: RosterSheetProps) {
  const [roster, setRoster] = useState<PlayerData[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!team || !open) return;
    let cancelled = false;
    setRoster(null);
    setError(null);
    gmApi
      .getRoster(team)
      .then((r) => { if (!cancelled) setRoster(r.players); })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Failed to load roster'); });
    return () => { cancelled = true; };
  }, [team, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={team ? `${team} roster` : 'Roster'}>
      {!team ? (
        <p className="text-sm text-white/60">Pick a team first.</p>
      ) : error ? (
        <p className="text-sm text-grade-red">{error}</p>
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
                    selected ? 'bg-brand-red/20 border border-brand-red/60' : 'bg-white/5 border border-transparent',
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
                    <div className="text-[11px] text-white/60">
                      {p.position}{p.jersey_number != null ? ` · #${p.jersey_number}` : ''}
                    </div>
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
