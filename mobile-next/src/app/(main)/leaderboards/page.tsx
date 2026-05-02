'use client';

import { useEffect, useState } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { gmApi } from '@/lib/gm-api';
import type { LeaderboardEntry } from '@/lib/gm-types';

export default function LeaderboardsPage() {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    gmApi
      .getLeaderboard()
      .then((r) => { if (!cancelled) setRows(r.leaderboard ?? []); })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="px-4 pt-10 pb-32 safe-top">
      <h1 className="text-display font-bold text-white mb-5">GM Leaderboard</h1>
      {rows === null ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-white/60">No entries yet — be the first.</p>
      ) : (
        <LiquidGlassCard className="p-0">
          <ul className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <li key={row.user_id ?? i} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-xs tabular-nums text-white/50">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {row.user_email ?? row.user_id}
                  </div>
                  <div className="text-[11px] text-white/50">
                    {row.trades_count ?? 0} trades · {row.favorite_team ?? '—'}
                  </div>
                </div>
                <div className="text-base font-bold text-brand-red tabular-nums">
                  {Math.round(row.avg_grade ?? 0)}
                </div>
              </li>
            ))}
          </ul>
        </LiquidGlassCard>
      )}
    </main>
  );
}
