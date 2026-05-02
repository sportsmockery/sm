'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGM } from '@/lib/gm-context';
import { OpponentSelectorSheet } from '@/components/gm/OpponentSelectorSheet';

export default function GMOpponent() {
  const router = useRouter();
  const { state, dispatch } = useGM();
  const [open, setOpen] = useState(true);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Pick opponent</h1>

      <OpponentSelectorSheet
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) router.push('/gm'); }}
        sport={state.sport}
        selectedKey={state.opponent ? String(state.opponent.team_key) : null}
        onSelect={(t) => { dispatch({ type: 'SET_OPPONENT', opponent: t }); router.push('/gm'); }}
      />
    </main>
  );
}
