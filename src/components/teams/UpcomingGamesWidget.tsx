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
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Upcoming Games
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming games scheduled.</p>
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
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Upcoming Games
        </h3>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {upcomingGames.map((game) => {
          const opponent = game.isHome ? game.awayTeam : game.homeTeam;

          return (
            <div key={game.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDate(game.date)}
                </span>
                {game.week && (
                  <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
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
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                    {game.isHome ? 'vs' : '@'} {opponent.shortName}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {game.time}
                  </p>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
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
        className="block border-t border-zinc-200 px-5 py-3 text-center text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
      >
        View Full Schedule →
      </Link>
    </div>
  );
}
