'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { gmApi } from '@/lib/gm-api';
import type { OpponentTeam, Sport } from '@/lib/gm-types';

export interface OpponentSelectorSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sport: Sport | null;
  selectedKey: string | null;
  onSelect: (team: OpponentTeam) => void;
}

export function OpponentSelectorSheet({ open, onOpenChange, sport, selectedKey, onSelect }: OpponentSelectorSheetProps) {
  const [teams, setTeams] = useState<OpponentTeam[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!sport || !open) return;
    let cancelled = false;
    setTeams(null);
    gmApi.getTeams(sport).then((r) => {
      if (!cancelled) setTeams(r.teams);
    }).catch(() => { if (!cancelled) setTeams([]); });
    return () => { cancelled = true; };
  }, [sport, open]);

  const filtered = useMemo(() => {
    if (!teams) return [];
    const needle = q.toLowerCase();
    return teams.filter(
      (t) =>
        t.team_name.toLowerCase().includes(needle) ||
        (t.team_key as string).toLowerCase().includes(needle),
    );
  }, [teams, q]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Pick an opponent">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter teams"
        className="w-full mb-3 rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder-white/40"
      />
      {!teams ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2">
          {filtered.map((t) => {
            const active = t.team_key === selectedKey;
            return (
              <li key={String(t.team_key)}>
                <button
                  type="button"
                  onClick={() => { onSelect(t); onOpenChange(false); }}
                  className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors ${
                    active ? 'bg-brand-opponent/30 border border-brand-opponent/60' : 'bg-white/5 border border-transparent'
                  }`}
                >
                  {t.logo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.logo_url} alt="" className="h-7 w-7 object-contain" />
                  )}
                  <span className="text-sm font-medium text-white truncate">{t.team_name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Sheet>
  );
}
