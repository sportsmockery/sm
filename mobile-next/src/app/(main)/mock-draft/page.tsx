'use client';

import { useEffect, useState } from 'react';
import { Bebas_Neue } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { Tooltip } from '@/components/ui/Tooltip';
import { mockDraftApi } from '@/lib/mock-draft-api';
import type { TeamEligibility, ChicagoTeam } from '@/lib/mock-draft-types';
import { TEAMS, type TeamId } from '@/lib/config';
import { useAuth } from '@/hooks/useAuth';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/utils';

const display = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-big-shoulders',
  weight: ['400'],
  display: 'swap',
});

const ORDER: TeamId[] = ['bears', 'cubs', 'whitesox', 'bulls', 'blackhawks'];

function matchTeam(eligibility: TeamEligibility[], id: TeamId): TeamEligibility | undefined {
  const config = TEAMS[id];
  return eligibility.find(
    (t) =>
      t.team_key.toLowerCase() === id.toLowerCase() ||
      t.team_name.toLowerCase().includes(config.shortName.toLowerCase()),
  );
}

export default function MockDraftHub() {
  const router = useRouter();
  const { session } = useAuth();
  const [teams, setTeams] = useState<TeamEligibility[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    mockDraftApi
      .getEligibility(session?.access_token ?? null)
      .then((r) => { if (!cancelled) setTeams(r.teams); })
      .catch((e) => { if (!cancelled) setError(e.message ?? 'Failed to load'); });
    return () => { cancelled = true; };
  }, [session?.access_token]);

  async function start(team: TeamEligibility, id: TeamId) {
    if (!team.eligible) return;
    haptic('medium');
    setStarting(String(team.team_key));
    try {
      const r = await mockDraftApi.startDraft(id as ChicagoTeam, session?.access_token ?? null);
      router.push(`/mock-draft/draft?id=${r.draft.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(null);
    }
  }

  return (
    <main className={cn(display.variable, 'px-4 pt-10 pb-32 safe-top')}>
      <header className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-brand-red font-semibold">
          MOCK DRAFT
        </p>
        <h1
          className="mt-2 font-black text-white tracking-tight uppercase"
          style={{ fontFamily: 'var(--font-big-shoulders)', fontSize: 'var(--text-hero)' }}
        >
          Run the room.
        </h1>
        <p className="mt-2 text-sm text-white/60 max-w-xs mx-auto">
          Pick a Chicago franchise to start a mock. In-season teams are locked.
        </p>
      </header>

      {error && <p className="text-sm text-grade-red text-center">{error}</p>}

      {!teams ? (
        <p className="text-sm text-white/60 text-center">Loading teams…</p>
      ) : (
        <div className="space-y-3">
          {ORDER.map((id) => {
            const team = matchTeam(teams, id);
            const config = TEAMS[id];
            if (!team) {
              return (
                <LiquidGlassCard key={id} className="opacity-50" rounded="2xl">
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={config.logo} alt="" className="h-12 w-12 object-contain grayscale" />
                    <div className="flex-1">
                      <div
                        className="font-black text-white text-2xl uppercase"
                        style={{ fontFamily: 'var(--font-big-shoulders)' }}
                      >
                        {config.shortName}
                      </div>
                      <div className="text-xs text-white/50">No mock available</div>
                    </div>
                  </div>
                </LiquidGlassCard>
              );
            }

            const card = (
              <LiquidGlassCard
                rounded="2xl"
                className={cn(
                  'transition-colors duration-200',
                  team.eligible ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed',
                  starting === String(team.team_key) && 'animate-pulse',
                )}
                onClick={() => start(team, id)}
              >
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={config.logo} alt="" className={cn('h-14 w-14 object-contain', !team.eligible && 'grayscale')} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-black text-white text-2xl uppercase tracking-tight truncate"
                      style={{ fontFamily: 'var(--font-big-shoulders)' }}
                    >
                      {config.shortName}
                    </div>
                    <div className="text-xs text-white/60 mt-0.5">
                      {team.draft_year} draft · {team.sport.toUpperCase()}
                    </div>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full',
                      team.eligible
                        ? 'bg-brand-red text-white'
                        : 'bg-white/8 text-white/60',
                    )}
                  >
                    {team.eligible ? 'Open' : team.season_status.replace('_', ' ')}
                  </span>
                </div>
              </LiquidGlassCard>
            );

            return team.eligible ? (
              <div key={id}>{card}</div>
            ) : (
              <Tooltip key={id} label={team.reason || 'In-season — not eligible.'}>
                <div className="block w-full">{card}</div>
              </Tooltip>
            );
          })}
        </div>
      )}

      <Link
        href="/profile"
        className="mt-8 block text-center text-xs text-white/50 underline-offset-4 hover:underline"
      >
        See your draft history →
      </Link>
    </main>
  );
}
