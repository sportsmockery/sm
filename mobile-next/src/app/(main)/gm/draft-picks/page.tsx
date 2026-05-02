'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGM } from '@/lib/gm-context';
import { DraftPicksSheet } from '@/components/gm/DraftPicksSheet';

export default function GMDraftPicks() {
  const router = useRouter();
  const { dispatch } = useGM();
  const [open, setOpen] = useState(true);

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
      <h1 className="mt-1 text-display font-bold text-white">Add draft pick</h1>

      <DraftPicksSheet
        open={open}
        onOpenChange={(v) => { setOpen(v); if (!v) router.push('/gm'); }}
        side="sent"
        onAdd={(pick) => { dispatch({ type: 'ADD_DRAFT_PICK_SENT', pick }); router.push('/gm'); }}
      />
    </main>
  );
}
