'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Player, PlayerStats } from '@/lib/types/sports';

interface PlayerHeaderProps {
  player: Player;
  stats?: PlayerStats;
}

export default function PlayerHeader({ player, stats }: PlayerHeaderProps) {
  const getStatusBadge = () => {
    switch (player.status) {
      case 'injured':
      case 'ir':
        return (
          <span className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
            Injured Reserve
          </span>
        );
      case 'pup':
        return (
          <span className="rounded bg-amber-600 px-2 py-1 text-xs font-bold text-white">
            PUP List
          </span>
        );
      case 'suspended':
        return (
          <span className="rounded bg-zinc-600 px-2 py-1 text-xs font-bold text-white">
            Suspended
          </span>
        );
      default:
        return (
          <span className="rounded bg-emerald-600 px-2 py-1 text-xs font-bold text-white">
            Active
          </span>
        );
    }
  };

  // Get key stats to display based on position
  const getKeyStats = () => {
    if (!stats?.stats) return [];

    const position = player.position;

    if (position === 'QB') {
      return [
        { label: 'YDS', value: stats.stats.yards || '—' },
        { label: 'TD', value: stats.stats.touchdowns || '—' },
        { label: 'INT', value: stats.stats.interceptions || '—' },
        { label: 'RTG', value: stats.stats.rating || '—' },
      ];
    }

    if (['RB', 'FB'].includes(position)) {
      return [
        { label: 'YDS', value: stats.stats.yards || '—' },
        { label: 'TD', value: stats.stats.touchdowns || '—' },
        { label: 'AVG', value: stats.stats.average || '—' },
        { label: 'ATT', value: stats.stats.attempts || '—' },
      ];
    }

    if (['WR', 'TE'].includes(position)) {
      return [
        { label: 'REC', value: stats.stats.receptions || '—' },
        { label: 'YDS', value: stats.stats.yards || '—' },
        { label: 'TD', value: stats.stats.touchdowns || '—' },
        { label: 'AVG', value: stats.stats.yardsPerReception || '—' },
      ];
    }

    if (['DE', 'DT', 'OLB', 'ILB', 'MLB'].includes(position)) {
      return [
        { label: 'TCKL', value: stats.stats.tackles || '—' },
        { label: 'SACK', value: stats.stats.sacks || '—' },
        { label: 'INT', value: stats.stats.interceptions || '—' },
        { label: 'FF', value: stats.stats.forcedFumbles || '—' },
      ];
    }

    if (['CB', 'S', 'FS', 'SS'].includes(position)) {
      return [
        { label: 'TCKL', value: stats.stats.tackles || '—' },
        { label: 'INT', value: stats.stats.interceptions || '—' },
        { label: 'PD', value: stats.stats.passesDefensed || '—' },
        { label: 'FF', value: stats.stats.forcedFumbles || '—' },
      ];
    }

    return [];
  };

  const keyStats = getKeyStats();

  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${player.team.colors.primary} 0%, ${player.team.colors.secondary} 100%)`,
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-8">
          {/* Player Photo */}
          <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-full border-4 border-white/30 bg-white/10 md:h-48 md:w-48">
            <Image
              src={player.headshot}
              alt={player.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Player Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Team & Status */}
            <div className="mb-2 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Link
                href={`/teams/${player.team.slug}`}
                className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white hover:bg-white/30"
              >
                <div className="relative h-5 w-5">
                  <Image
                    src={player.team.logo}
                    alt={player.team.name}
                    fill
                    className="object-contain"
                  />
                </div>
                {player.team.shortName}
              </Link>
              {getStatusBadge()}
            </div>

            {/* Name & Number */}
            <div className="mb-2 flex items-center justify-center gap-4 md:justify-start">
              <span className="text-4xl font-black text-white/50 md:text-5xl">
                #{player.number}
              </span>
              <h1 className="text-3xl font-black text-white md:text-4xl lg:text-5xl">
                {player.name}
              </h1>
            </div>

            {/* Position & Physical */}
            <p className="text-lg text-white/80">
              {player.position} • {player.height}, {player.weight} lbs
            </p>
          </div>

          {/* Key Stats */}
          {keyStats.length > 0 && (
            <div className="flex gap-4 rounded-xl bg-white/10 p-4 backdrop-blur-sm md:gap-6">
              {keyStats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white md:text-3xl">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
