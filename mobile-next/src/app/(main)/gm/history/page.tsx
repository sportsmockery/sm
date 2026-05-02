'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { gmApi } from '@/lib/gm-api';
import type { Trade } from '@/lib/gm-types';
import { formatRelativeTime } from '@/lib/utils';

export default function GMHistory() {
  const [trades, setTrades] = useState<Trade[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    gmApi.getTrades(1, 50)
      .then((r) => { if (!cancelled) setTrades(r.trades); })
      .catch(() => { if (!cancelled) setTrades([]); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
        <h1 className="mt-1 text-display font-bold text-white">Trade history</h1>
      </header>

      {!trades ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : trades.length === 0 ? (
        <p className="text-sm text-white/60">No trades yet.</p>
      ) : (
        <div className="space-y-3">
          {trades.map((t) => (
            <LiquidGlassCard key={t.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-white/50">
                    {t.chicago_team} ↔ {t.trade_partner}
                  </div>
                  <div className="text-sm font-semibold text-white mt-0.5">
                    {t.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </div>
                </div>
                <div className="text-2xl font-bold text-brand-red tabular-nums">
                  {Math.round(t.grade)}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-white/50">
                {formatRelativeTime(t.created_at)}
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
