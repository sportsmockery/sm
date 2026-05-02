'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Share2, RotateCcw } from 'lucide-react';
import { GradeRing } from '@/components/ui/GradeRing';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useGM } from '@/lib/gm-context';
import { haptic } from '@/lib/haptics';

export default function GMResult() {
  const router = useRouter();
  const { state, dispatch } = useGM();
  const r = state.gradeResult;

  useEffect(() => {
    if (!r) router.replace('/gm');
  }, [r, router]);

  if (!r) return null;

  const accepted = r.status === 'accepted';

  function newTrade() {
    haptic('light');
    dispatch({ type: 'CLEAR_GRADE' });
    router.replace('/gm');
  }

  function share() {
    if (!r) return;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      navigator
        .share({ title: `GM grade: ${r.grade}`, text: r.trade_summary ?? 'Check out my trade.', url: typeof window !== 'undefined' ? window.location.href : '' })
        .catch(() => {});
    }
  }

  return (
    <main className="px-5 pt-10 pb-32 safe-top text-center">
      <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">
        Trade graded
      </div>
      <h1 className="mt-2 text-2xl font-bold text-white">
        {accepted ? 'Accepted' : 'Rejected'}
      </h1>
      <p className="mt-1 text-sm text-white/60">
        {r.is_dangerous ? 'Flagged as dangerous.' : ' '}
      </p>

      <div className="mt-6 grid place-items-center">
        <GradeRing value={r.grade} size={240} thickness={16} />
      </div>

      {r.breakdown && (
        <div className="mt-6 grid grid-cols-2 gap-3">
          <LiquidGlassCard className="text-left">
            <div className="text-xs uppercase tracking-wider text-white/50">Talent</div>
            <div className="text-xl font-bold text-white">{Math.round(r.breakdown.talent_balance)}</div>
          </LiquidGlassCard>
          <LiquidGlassCard className="text-left">
            <div className="text-xs uppercase tracking-wider text-white/50">Contract</div>
            <div className="text-xl font-bold text-white">{Math.round(r.breakdown.contract_value)}</div>
          </LiquidGlassCard>
          <LiquidGlassCard className="text-left">
            <div className="text-xs uppercase tracking-wider text-white/50">Team fit</div>
            <div className="text-xl font-bold text-white">{Math.round(r.breakdown.team_fit)}</div>
          </LiquidGlassCard>
          <LiquidGlassCard className="text-left">
            <div className="text-xs uppercase tracking-wider text-white/50">Future</div>
            <div className="text-xl font-bold text-white">{Math.round(r.breakdown.future_assets)}</div>
          </LiquidGlassCard>
        </div>
      )}

      <LiquidGlassCard className="mt-6 text-left">
        <div className="text-xs uppercase tracking-wider text-brand-red font-semibold flex items-center gap-1.5">
          <Sparkles size={12} /> AI reasoning
        </div>
        <p className="mt-2 text-sm text-white/85 leading-relaxed">{r.reasoning}</p>
        {r.cap_analysis && (
          <p className="mt-3 text-sm text-white/70 leading-relaxed">
            <span className="font-semibold">Cap:</span> {r.cap_analysis}
          </p>
        )}
        {r.draft_analysis && (
          <p className="mt-2 text-sm text-white/70 leading-relaxed">
            <span className="font-semibold">Picks:</span> {r.draft_analysis}
          </p>
        )}
        {r.rejection_reason && !accepted && (
          <p className="mt-3 text-sm text-grade-red/90 leading-relaxed">
            {r.rejection_reason}
          </p>
        )}
      </LiquidGlassCard>

      <div className="mt-6 flex gap-3 justify-center">
        <button
          type="button"
          onClick={share}
          className="liquid-glass-pill px-4 py-2 text-sm flex items-center gap-2 text-white"
        >
          <Share2 size={14} /> Share
        </button>
        <button
          type="button"
          onClick={newTrade}
          className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white flex items-center gap-2"
        >
          <RotateCcw size={14} /> New trade
        </button>
      </div>
    </main>
  );
}
