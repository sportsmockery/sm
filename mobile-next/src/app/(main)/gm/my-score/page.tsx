'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { GradeRing } from '@/components/ui/GradeRing';
import { gmApi } from '@/lib/gm-api';
import type { UserScoreResponse } from '@/lib/gm-types';

export default function GMMyScore() {
  const [data, setData] = useState<UserScoreResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    gmApi.getUserScore()
      .then((r) => { if (!cancelled) setData(r); })
      .catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
        <h1 className="mt-1 text-display font-bold text-white">My GM score</h1>
      </header>

      {!data ? (
        <p className="text-sm text-white/60">Loading…</p>
      ) : (
        <>
          <div className="flex justify-center my-8">
            <GradeRing
              value={data.user_score.combined_gm_score ?? 0}
              size={200}
              thickness={14}
              label="Combined"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LiquidGlassCard>
              <div className="text-xs uppercase tracking-wider text-white/50">Best trade</div>
              <div className="text-2xl font-bold text-grade-green">
                {data.user_score.best_trade_score ?? '—'}
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard>
              <div className="text-xs uppercase tracking-wider text-white/50">Best mock</div>
              <div className="text-2xl font-bold text-brand-red">
                {data.user_score.best_mock_draft_score ?? '—'}
              </div>
            </LiquidGlassCard>
            <LiquidGlassCard>
              <div className="text-xs uppercase tracking-wider text-white/50">Trades</div>
              <div className="text-2xl font-bold text-white">{data.user_score.trade_count}</div>
            </LiquidGlassCard>
            <LiquidGlassCard>
              <div className="text-xs uppercase tracking-wider text-white/50">Mocks</div>
              <div className="text-2xl font-bold text-white">{data.user_score.mock_count}</div>
            </LiquidGlassCard>
          </div>
          {data.trade_stats && (
            <LiquidGlassCard className="mt-3">
              <div className="text-xs uppercase tracking-wider text-white/50">Trade record</div>
              <div className="mt-1 text-sm text-white">
                {data.trade_stats.accepted}/{data.trade_stats.total} accepted ·
                {' '}avg <span className="font-semibold">{Math.round(data.trade_stats.average_grade)}</span>
              </div>
            </LiquidGlassCard>
          )}
        </>
      )}
    </main>
  );
}
