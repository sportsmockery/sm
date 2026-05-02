'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGM } from '@/lib/gm-context';
import { TradeAssetPill } from '@/components/gm/TradeAssetPill';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { formatNumber } from '@/lib/utils';

export default function GMReview() {
  const router = useRouter();
  const { state } = useGM();

  type Asset = { primary: string; secondary?: string; value?: number; imageUrl?: string };

  const sent: Asset[] = [
    ...state.selectedPlayers.map((p): Asset => ({
      primary: p.full_name,
      secondary: p.position,
      value: p.cap_hit ?? p.base_salary ?? undefined,
      imageUrl: p.headshot_url ?? undefined,
    })),
    ...state.draftPicksSent.map((pk): Asset => ({
      primary: `${pk.year} R${pk.round}`,
      secondary: pk.condition,
    })),
  ];
  const received: Asset[] = [
    ...state.selectedOpponentPlayers.map((p): Asset => ({
      primary: p.full_name,
      secondary: p.position,
      value: p.cap_hit ?? p.base_salary ?? undefined,
      imageUrl: p.headshot_url ?? undefined,
    })),
    ...state.draftPicksReceived.map((pk): Asset => ({
      primary: `${pk.year} R${pk.round}`,
      secondary: pk.condition,
    })),
  ];

  const sentTotal = state.selectedPlayers.reduce((s, p) => s + (p.cap_hit ?? p.base_salary ?? 0), 0);
  const recvTotal = state.selectedOpponentPlayers.reduce((s, p) => s + (p.cap_hit ?? p.base_salary ?? 0), 0);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Review trade</h1>

      <LiquidGlassCard className="mt-5">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">I send</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {sent.map((a, i) => (
            <TradeAssetPill key={`s-${i}`} side="sent" primary={a.primary} secondary={a.secondary} value={a.value} imageUrl={a.imageUrl} />
          ))}
        </div>
        <div className="mt-3 text-xs text-white/60">
          Total cap: <span className="text-white tabular-nums">${formatNumber(sentTotal)}</span>
        </div>
      </LiquidGlassCard>

      <LiquidGlassCard className="mt-3">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-opponent font-semibold">I receive</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {received.map((a, i) => (
            <TradeAssetPill key={`r-${i}`} side="received" primary={a.primary} secondary={a.secondary} value={a.value} imageUrl={a.imageUrl} />
          ))}
        </div>
        <div className="mt-3 text-xs text-white/60">
          Total cap: <span className="text-white tabular-nums">${formatNumber(recvTotal)}</span>
        </div>
      </LiquidGlassCard>

      <button
        type="button"
        onClick={() => router.push('/gm')}
        className="mt-6 w-full rounded-2xl bg-brand-red py-4 text-sm font-bold text-white"
      >
        Back to grade
      </button>
    </main>
  );
}
