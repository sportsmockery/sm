'use client';

import Link from 'next/link';
import { useGM } from '@/lib/gm-context';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';

export default function GMOpponentRoster() {
  const { state } = useGM();
  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Opponent roster</h1>
      <p className="mt-2 text-sm text-white/60">
        {state.opponent
          ? `${state.opponent.team_name} — open the opponent roster sheet from the GM hub to add players.`
          : 'Pick an opponent in GM first.'}
      </p>
      <LiquidGlassCard className="mt-4 text-sm text-white/70">
        Tap “I receive” in the GM hub to browse this team’s roster.
      </LiquidGlassCard>
    </main>
  );
}
