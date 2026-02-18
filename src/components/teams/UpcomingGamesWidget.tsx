'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Game, Team } from '@/lib/types/sports';

interface UpcomingGamesWidgetProps {
  games: Game[];
  team: Team;
  limit?: number;
}

export default function UpcomingGamesWidget({ games, team, limit = 5 }: UpcomingGamesWidgetProps) {
  const upcomingGames = games
    .filter(g => g.status === 'scheduled')
    .slice(0, limit);

  if (upcomingGames.length === 0) {
    return (
      <div className="rounded-xl border p-5" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Upcoming Games
        </h3>
        <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>No upcoming games scheduled.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="border-b px-5 py-4" style={{ borderColor: 'var(--sm-border)' }}>
        <h3 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--sm-text)' }}>
          Upcoming Games
        </h3>
      </div>

      <div className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
        {upcomingGames.map((game) => {
          const opponent = game.isHome ? game.awayTeam : game.homeTeam;

          return (
            <div key={game.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                  {formatDate(game.date)}
                </span>
                {game.week && (
                  <span className="text-xs font-medium" style={{ color: 'var(--sm-text-dim)' }}>
                    Week {game.week}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 flex-shrink-0">
                  <Image
                    src={opponent.logo}
                    alt={opponent.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: 'var(--sm-text)' }}>
                    {game.isHome ? 'vs' : '@'} {opponent.shortName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    {game.time}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs" style={{ color: 'var(--sm-text-muted)' }}>
                <span className="truncate">{game.venue}</span>
                {game.broadcast && (
                  <span className="flex-shrink-0 ml-2">📺 {game.broadcast}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link
        href={`/teams/${team.slug}/schedule`}
        className="block border-t px-5 py-3 text-center text-sm font-semibold transition-colors"
        style={{ borderColor: 'var(--sm-border)', color: 'var(--sm-text-muted)' }}
      >
        View Full Schedule →
      </Link>
    </div>
  );
}
