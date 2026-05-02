'use client';

import Link from 'next/link';
import { useGM } from '@/lib/gm-context';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { formatNumber } from '@/lib/utils';

export default function GMRoster() {
  const { state } = useGM();

  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <Link href="/gm" className="text-xs text-white/60">← Back to GM</Link>
        <h1 className="mt-1 text-display font-bold text-white">
          {state.chicagoTeam ? `${state.chicagoTeam} roster` : 'Roster'}
        </h1>
      </header>

      {!state.chicagoTeam ? (
        <p className="text-sm text-white/60">Pick a team in GM first.</p>
      ) : state.roster.length === 0 ? (
        <p className="text-sm text-white/60">No roster loaded yet — open the roster sheet from the GM hub.</p>
      ) : (
        <LiquidGlassCard padded={false}>
          <ul className="divide-y divide-white/5">
            {state.roster.map((p) => (
              <li key={p.player_id} className="flex items-center gap-3 px-4 py-3">
                {p.headshot_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.headshot_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-xs">
                    {p.full_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white truncate">{p.full_name}</div>
                  <div className="text-[11px] text-white/60">{p.position}</div>
                </div>
                <span className="text-xs tabular-nums text-white/80">
                  ${formatNumber(p.cap_hit ?? p.base_salary ?? 0)}
                </span>
              </li>
            ))}
          </ul>
        </LiquidGlassCard>
      )}
    </main>
  );
}
