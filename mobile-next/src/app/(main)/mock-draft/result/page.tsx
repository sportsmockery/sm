'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { GradeRing } from '@/components/ui/GradeRing';
import { mockDraftApi } from '@/lib/mock-draft-api';
import type { DraftGrade } from '@/lib/mock-draft-types';
import { useAuth } from '@/hooks/useAuth';

function ResultView() {
  const params = useSearchParams();
  const router = useRouter();
  const { session } = useAuth();
  const id = params.get('id');
  const [grade, setGrade] = useState<DraftGrade | null>(null);

  useEffect(() => {
    if (!id) { router.replace('/mock-draft'); return; }
    let cancelled = false;
    mockDraftApi
      .gradeDraft(id, session?.access_token ?? null)
      .then((r) => { if (!cancelled) setGrade(r.grade); })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <main className="px-5 pt-10 pb-32 safe-top text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Mock complete</p>
      <h1 className="mt-1 text-2xl font-bold text-white">Your draft grade</h1>

      {!grade ? (
        <p className="mt-6 text-sm text-white/60">Calculating…</p>
      ) : (
        <>
          <div className="mt-6 grid place-items-center">
            <GradeRing value={grade.overall_grade ?? 0} size={220} thickness={14} label={grade.letter_grade ?? ''} />
          </div>

          <LiquidGlassCard className="mt-6 text-left">
            <div className="text-xs uppercase tracking-wider text-brand-red font-semibold">
              AI feedback
            </div>
            <p className="mt-2 text-sm text-white/85 leading-relaxed">
              {grade.analysis}
            </p>
          </LiquidGlassCard>

          {grade.strengths?.length > 0 && (
            <LiquidGlassCard className="mt-3 text-left">
              <div className="text-xs uppercase tracking-wider text-grade-green font-semibold">
                Strengths
              </div>
              <ul className="mt-2 space-y-1 text-sm text-white/85 list-disc pl-5">
                {grade.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </LiquidGlassCard>
          )}

          {grade.weaknesses?.length > 0 && (
            <LiquidGlassCard className="mt-3 text-left">
              <div className="text-xs uppercase tracking-wider text-grade-red font-semibold">
                Weaknesses
              </div>
              <ul className="mt-2 space-y-1 text-sm text-white/85 list-disc pl-5">
                {grade.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </LiquidGlassCard>
          )}
        </>
      )}

      <button
        onClick={() => router.replace('/mock-draft')}
        className="mt-8 inline-block rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white"
      >
        Run another mock
      </button>
    </main>
  );
}

export default function MockDraftResult() {
  return (
    <Suspense fallback={<div className="p-8 text-white/60 text-sm">Loading…</div>}>
      <ResultView />
    </Suspense>
  );
}
