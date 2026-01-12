'use client';

import Image from 'next/image';
import { Team, Game } from '@/lib/types/sports';

interface TeamHeaderProps {
  team: Team;
  record?: { wins: number; losses: number; ties?: number };
  standing?: { division: number; conference: number };
  nextGame?: Game | null;
}

export default function TeamHeader({ team, record, standing, nextGame }: TeamHeaderProps) {
  const formatRecord = () => {
    if (!record) return '';
    if (record.ties && record.ties > 0) {
      return `${record.wins}-${record.losses}-${record.ties}`;
    }
    return `${record.wins}-${record.losses}`;
  };

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${team.colors.primary} 0%, ${team.colors.secondary} 100%)`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          {/* Team Logo */}
          <div className="relative h-32 w-32 flex-shrink-0 md:h-40 md:w-40">
            <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
            <Image
              src={team.logo}
              alt={team.name}
              fill
              className="object-contain p-4"
              priority
            />
          </div>

          {/* Team Info */}
          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex items-center justify-center gap-3 md:justify-start">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                {team.league}
              </span>
              <span className="text-sm text-white/70">{team.division}</span>
            </div>

            <h1 className="mb-2 text-3xl font-black text-white md:text-4xl lg:text-5xl">
              {team.name}
            </h1>

            {/* Record & Standing */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
              {record && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white md:text-3xl">
                    {formatRecord()}
                  </span>
                </div>
              )}

              {standing && (
                <span className="text-sm text-white/80 md:text-base">
                  {getOrdinal(standing.division)} in {team.division}
                </span>
              )}
            </div>
          </div>

          {/* Next Game Preview */}
          {nextGame && (
            <div className="flex-shrink-0 rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">
                Next Game
              </p>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10">
                  <Image
                    src={nextGame.isHome ? nextGame.awayTeam.logo : nextGame.homeTeam.logo}
                    alt={nextGame.isHome ? nextGame.awayTeam.name : nextGame.homeTeam.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-white">
                    {nextGame.isHome ? 'vs' : '@'}{' '}
                    {nextGame.isHome ? nextGame.awayTeam.shortName : nextGame.homeTeam.shortName}
                  </p>
                  <p className="text-sm text-white/70">
                    {new Date(nextGame.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    • {nextGame.time}
                  </p>
                </div>
              </div>
              {nextGame.broadcast && (
                <p className="mt-2 text-xs text-white/60">
                  📺 {nextGame.broadcast}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
