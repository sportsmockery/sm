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
    <div className="rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Similar Players
        </h3>
      </div>

      <div className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
        {similarPlayers.map((player) => (
          <Link
            key={player.id}
            href={`/players/${player.slug}`}
            className="flex items-center gap-3 p-4 transition-colors"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
              <Image
                src={player.headshot}
                alt={player.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium truncate" style={{ color: 'var(--sm-text)' }}>
                {player.name}
              </p>
              <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
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
