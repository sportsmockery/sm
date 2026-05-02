'use client';

import Link from 'next/link';
import { useGM } from '@/lib/gm-context';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

export default function GMTeamFit() {
  const { state } = useGM();
  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Team fit</h1>

      {state.selectedOpponentPlayers.length === 0 ? (
        <p className="mt-3 text-sm text-white/60">Add players to “I receive” to see how they fit.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {state.selectedOpponentPlayers.map((p) => (
            <LiquidGlassCard key={p.player_id}>
              <div className="text-sm font-semibold text-white">{p.full_name}</div>
              <div className="text-[11px] text-white/60">{p.position}</div>
              <div className="mt-2 text-xs text-white/70">
                Fit assessment runs server-side via gmApi.getTeamFit — open this player from the result page to see the full report.
              </div>
            </LiquidGlassCard>
          ))}
        </div>
      )}
    </main>
  );
}
