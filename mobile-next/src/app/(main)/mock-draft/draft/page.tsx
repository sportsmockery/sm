'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { mockDraftApi } from '@/lib/mock-draft-api';
import type { Prospect, Sport } from '@/lib/mock-draft-types';
import { useAuth } from '@/hooks/useAuth';
import { useMockDraft, getCurrentPick, isUserPick } from '@/lib/mock-draft-context';
import { haptic, notify } from '@/lib/haptics';

function DraftView() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');
  const { session } = useAuth();
  const { state, dispatch } = useMockDraft();
  const [prospects, setProspects] = useState<Prospect[] | null>(null);
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (!id) { router.replace('/mock-draft'); return; }
    if (!state.activeDraft) return;
    let cancelled = false;
    mockDraftApi
      .getProspects(state.activeDraft.sport as Sport, state.activeDraft.draft_year, session?.access_token ?? null)
      .then((r) => { if (!cancelled) setProspects(r.prospects); })
      .catch(() => { if (!cancelled) setProspects([]); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, state.activeDraft]);

  const draft = state.activeDraft;
  const pick = getCurrentPick(draft);
  const isMine = isUserPick(draft);

  async function selectProspect(p: Prospect) {
    if (!id || !pick || picking) return;
    setPicking(true);
    haptic('medium');
    try {
      const r = await mockDraftApi.submitPick(id, p.id, pick.pick_number, session?.access_token ?? null);
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: r.draft });
      notify('success');
      if (r.draft.status === 'completed' || r.draft.status === 'graded') {
        router.replace(`/mock-draft/result?id=${id}`);
      }
    } catch {
      notify('error');
    } finally {
      setPicking(false);
    }
  }

  async function autoAdvance() {
    if (!id) return;
    haptic('light');
    try {
      const r = await mockDraftApi.autoAdvance(id, session?.access_token ?? null);
      dispatch({ type: 'SET_ACTIVE_DRAFT', draft: r.draft });
    } catch { /* noop */ }
  }

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">
          {pick ? `Pick ${pick.pick_number}` : 'Draft'}
        </p>
        <h1 className="text-display font-bold text-white">
          {pick?.team_name ?? '—'}
          {isMine && <span className="ml-2 text-brand-red text-sm">YOU</span>}
        </h1>
      </header>

      {!isMine && (
        <button
          onClick={autoAdvance}
          className="w-full rounded-xl bg-white/5 text-white/70 py-2 text-xs mb-4"
        >
          CPU on the clock — tap to advance
        </button>
      )}

      {!prospects ? (
        <p className="text-sm text-white/60">Loading prospects…</p>
      ) : prospects.length === 0 ? (
        <p className="text-sm text-white/60">No prospects available.</p>
      ) : (
        <div className="space-y-2">
          {prospects.slice(0, 30).map((p) => (
            <LiquidGlassCard key={p.id} padded={false}>
              <button
                type="button"
                onClick={() => selectProspect(p)}
                disabled={!isMine || picking}
                className="w-full flex items-center gap-3 p-3 text-left disabled:opacity-50"
              >
                {p.headshot_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.headshot_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-white/10 grid place-items-center text-white/70">
                    {p.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.name}</div>
                  <div className="text-[11px] text-white/60">
                    {p.position} · {p.school ?? '—'}
                  </div>
                </div>
                <span className="text-xs tabular-nums text-white/80 font-semibold">
                  {p.grade ?? '—'}
                </span>
              </button>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </main>
  );
}

export default function DraftPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/60 text-sm">Loading…</div>}>
      <DraftView />
    </Suspense>
  );
}
