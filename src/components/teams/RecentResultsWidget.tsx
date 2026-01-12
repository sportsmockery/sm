'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Game, Team } from '@/lib/types/sports';

interface RecentResultsWidgetProps {
  games: Game[];
  team: Team;
  limit?: number;
}

export default function RecentResultsWidget({ games, team, limit = 5 }: RecentResultsWidgetProps) {
  const recentGames = games
    .filter(g => g.status === 'final')
    .slice(-limit)
    .reverse();

  if (recentGames.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
          Recent Results
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No recent games.</p>
      </div>
    );
  }

  const getResultColor = (result?: string) => {
    if (result === 'W') return 'bg-emerald-500';
    if (result === 'L') return 'bg-red-500';
    return 'bg-zinc-400';
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 dark:text-white">
            Recent Results
          </h3>
          {/* Streak indicator */}
          <div className="flex gap-1">
            {recentGames.map((game) => (
              <div
                key={game.id}
                className={`h-3 w-3 rounded-full ${getResultColor(game.result)}`}
                title={`${game.result}: vs ${game.isHome ? game.awayTeam.shortName : game.homeTeam.shortName}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {recentGames.map((game) => {
          const opponent = game.isHome ? game.awayTeam : game.homeTeam;
          const teamScore = game.isHome ? game.homeScore : game.awayScore;
          const oppScore = game.isHome ? game.awayScore : game.homeScore;

          return (
            <div key={game.id} className="flex items-center gap-3 p-4">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${getResultColor(game.result)}`}
              >
                {game.result}
              </div>

              <div className="relative h-8 w-8 flex-shrink-0">
                <Image
                  src={opponent.logo}
                  alt={opponent.name}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 dark:text-white truncate">
                  {game.isHome ? 'vs' : '@'} {opponent.shortName}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-zinc-900 dark:text-white">
                  {teamScore}-{oppScore}
                </p>
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
