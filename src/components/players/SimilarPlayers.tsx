'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Player } from '@/lib/types/sports';

interface SimilarPlayersProps {
  players: Player[];
  currentPlayer: Player;
}

export default function SimilarPlayers({ players, currentPlayer }: SimilarPlayersProps) {
  // Filter out current player and limit to same position
  const similarPlayers = players
    .filter(
      (p) =>
        p.id !== currentPlayer.id &&
        p.position === currentPlayer.position &&
        p.team.slug !== currentPlayer.team.slug
    )
    .slice(0, 4);

  if (similarPlayers.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Similar Players
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {similarPlayers.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.slug}`}
            className="flex items-center gap-3 p-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Image
                src={player.headshot}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-zinc-900 dark:text-white truncate">
                {player.name}
              </p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {player.position} • {player.team.shortName}
              </p>
            </div>

            <div className="relative h-6 w-6 flex-shrink-0">
              <Image
                src={player.team.logo}
                alt={player.team.name}
                fill
                className="object-contain"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
