'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useGM } from '@/lib/gm-context';
import { gmApi } from '@/lib/gm-api';
import type { ScenarioResult, ScenarioType } from '@/lib/gm-types';

const SCENARIOS: { key: ScenarioType; label: string }[] = [
  { key: 'player_improvement', label: 'Player improves' },
  { key: 'player_decline', label: 'Player declines' },
  { key: 'injury_impact', label: 'Injury hits' },
  { key: 'add_pick', label: 'Add a pick' },
  { key: 'remove_player', label: 'Remove player' },
  { key: 'age_progression', label: 'Age progresses' },
];

export default function GMWhatIf() {
  const { state } = useGM();
  const [scenario, setScenario] = useState<ScenarioType>('player_improvement');
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [loading, setLoading] = useState(false);
  const tradeId = state.gradeResult?.trade_id;

  async function run() {
    if (!tradeId) return;
    setLoading(true);
    try {
      const r = await gmApi.runScenario({
        trade_id: tradeId,
        scenario_type: scenario,
        parameters: {},
      });
      setResult(r);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">What if…</h1>
      <p className="mt-1 text-sm text-white/60">
        {tradeId
          ? 'Run a hypothetical scenario against your last graded trade.'
          : 'Grade a trade first to unlock scenarios.'}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.key}
            onClick={() => setScenario(s.key)}
            className={`rounded-xl px-3 py-2 text-sm transition-colors ${
              scenario === s.key ? 'bg-brand-red text-white font-semibold' : 'bg-white/5 text-white/70'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <button
        onClick={run}
        disabled={loading || !tradeId}
        className="mt-5 w-full rounded-2xl bg-brand-red py-3 text-sm font-bold text-white disabled:opacity-50"
      >
        {loading ? 'Running…' : 'Run scenario'}
      </button>

      {result && (
        <LiquidGlassCard className="mt-5">
          <div className="text-xs uppercase tracking-wider text-brand-red font-semibold">Result</div>
          <div className="mt-2 flex items-center gap-3">
            <div className="text-2xl font-bold text-white tabular-nums">
              {Math.round(result.original_grade)} →{' '}
              <span className={result.grade_delta >= 0 ? 'text-grade-green' : 'text-grade-red'}>
                {Math.round(result.adjusted_grade)}
              </span>
            </div>
            <div className="text-xs text-white/60">
              ({result.grade_delta >= 0 ? '+' : ''}{Math.round(result.grade_delta)})
            </div>
          </div>
          <p className="mt-2 text-sm text-white/80">{result.reasoning}</p>
        </LiquidGlassCard>
      )}
    </main>
  );
}
