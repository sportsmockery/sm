'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Player, Team } from '@/lib/types/sports';

interface PlayerCardProps {
  player: Player;
  team: Team;
  showStats?: boolean;
}

export default function PlayerCard({ player, team, showStats = false }: PlayerCardProps) {
  const getStatusBadge = () => {
    switch (player.status) {
      case 'injured':
      case 'ir':
        return (
          <span className="absolute right-2 top-2 rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            IR
          </span>
        );
      case 'pup':
        return (
          <span className="absolute right-2 top-2 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            PUP
          </span>
        );
      case 'suspended':
        return (
          <span className="absolute right-2 top-2 rounded bg-zinc-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
            SUSP
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Link
      href={`/players/${player.slug}`}
      className="group block overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all hover:border-zinc-300 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      {/* Player Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <Image
          src={player.headshot}
          alt={player.name}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />

        {/* Number Badge */}
        <div
          className="absolute left-2 top-2 rounded px-2 py-1 text-lg font-black text-white shadow-md"
          style={{ backgroundColor: team.colors.primary }}
        >
          {player.number}
        </div>

        {/* Status Badge */}
        {getStatusBadge()}

        {/* Hover Overlay with Quick Stats */}
        {showStats && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
            <div className="w-full p-3">
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-white">
                <div>
                  <p className="font-bold">6&apos;1&quot;</p>
                  <p className="text-white/70">Height</p>
                </div>
                <div>
                  <p className="font-bold">{player.weight}</p>
                  <p className="text-white/70">Weight</p>
                </div>
                <div>
                  <p className="font-bold">{player.age}</p>
                  <p className="text-white/70">Age</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Player Info */}
      <div className="p-3">
        <p className="font-semibold text-zinc-900 dark:text-white">
          {player.name}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {player.position}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {player.experience}
          </p>
        </div>
      </div>
    </Link>
  );
}
