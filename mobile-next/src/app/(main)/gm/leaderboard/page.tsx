'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { gmApi } from '@/lib/gm-api';
import type { LeaderboardEntry } from '@/lib/gm-types';

export default function GMLeaderboard() {
  const [rows, setRows] = useState<LeaderboardEntry[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    gmApi.getLeaderboard()
      .then((r) => { if (!cancelled) setRows(r.leaderboard); })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
        <h1 className="mt-1 text-display font-bold text-white">Leaderboard</h1>
      </header>

      {!rows ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <LiquidGlassCard padded={false} className="p-0">
          <ul className="divide-y divide-white/5">
            {rows.map((row, i) => (
              <li key={row.user_id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-xs tabular-nums text-white/50">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{row.user_email}</div>
                  <div className="text-[11px] text-white/50">
                    {row.trades_count} trades · {row.favorite_team}
                  </div>
                </div>
                <div className="text-base font-bold text-brand-red tabular-nums">
                  {Math.round(row.avg_grade)}
                </div>
              </li>
            ))}
          </ul>
        </LiquidGlassCard>
      )}
    </main>
  );
}
