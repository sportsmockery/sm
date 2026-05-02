import Link from 'next/link';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { TEAMS } from '@/lib/config';

export default function TeamsHubPage() {
  const order: (keyof typeof TEAMS)[] = ['bears', 'bulls', 'blackhawks', 'cubs', 'whitesox'];
  return (
    <main className="px-4 pt-8 pb-32 safe-top">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-red font-semibold">Teams</p>
        <h1 className="text-display font-bold text-white">Chicago franchises</h1>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {order.map((id) => {
          const t = TEAMS[id];
          return (
            <Link key={id} href={`/team/${id}`} className="block">
              <LiquidGlassCard className="aspect-square flex flex-col items-center justify-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.logo} alt="" className="h-16 w-16 object-contain" />
                <div className="mt-3 text-sm font-semibold text-white">{t.shortName}</div>
                <div className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
                  {t.sport}
                </div>
              </LiquidGlassCard>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
