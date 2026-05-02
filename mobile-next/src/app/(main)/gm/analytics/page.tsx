'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { gmApi } from '@/lib/gm-api';
import type { AnalyticsResult } from '@/lib/gm-types';

export default function GMAnalytics() {
  const [data, setData] = useState<AnalyticsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    gmApi.getAnalytics().then((r) => { if (!cancelled) setData(r); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Analytics</h1>

      {!data ? (
        <p className="mt-3 text-sm text-white/60">Loading…</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/50">Avg grade</div>
            <div className="text-2xl font-bold text-white">{Math.round(data.average_grade ?? 0)}</div>
          </LiquidGlassCard>
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/50">Acceptance</div>
            <div className="text-2xl font-bold text-white">
              {data.total_trades ? Math.round((data.accepted_trades / data.total_trades) * 100) : 0}%
            </div>
          </LiquidGlassCard>
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/50">Trades</div>
            <div className="text-2xl font-bold text-white">{data.total_trades ?? 0}</div>
          </LiquidGlassCard>
          <LiquidGlassCard>
            <div className="text-xs uppercase tracking-wider text-white/50">Highest</div>
            <div className="text-2xl font-bold text-grade-green">{data.highest_grade ?? 0}</div>
          </LiquidGlassCard>
        </div>
      )}
    </main>
  );
}
