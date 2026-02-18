'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Game, Team } from '@/lib/types/sports';

interface ScheduleTableProps {
  games: Game[];
  team: Team;
  showWeek?: boolean;
}

export default function ScheduleTable({ games, team, showWeek = true }: ScheduleTableProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOpponent = (game: Game) => {
    return game.isHome ? game.awayTeam : game.homeTeam;
  };

  const getResultColor = (result?: string) => {
    if (result === 'W') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (result === 'L') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (result === 'T') return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    return '';
  };

  const getScore = (game: Game) => {
    if (game.status !== 'final') return null;
    const teamScore = game.isHome ? game.homeScore : game.awayScore;
    const oppScore = game.isHome ? game.awayScore : game.homeScore;
    return `${teamScore}-${oppScore}`;
  };

  const isCurrentWeek = (game: Game) => {
    const now = new Date();
    const gameDate = new Date(game.date);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return gameDate >= now && gameDate <= weekFromNow && game.status === 'scheduled';
  };

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      {/* Mobile view */}
      <div className="md:hidden">
        {games.map((game) => {
          const opponent = getOpponent(game);
          const score = getScore(game);
          const isCurrent = isCurrentWeek(game);

          return (
            <div
              key={game.id}
              className={`
                border-b p-4 last:border-b-0
                ${isCurrent ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
              `}
              style={{ borderColor: 'var(--sm-border)' }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showWeek && game.week && (
                    <span className="text-xs font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                      Week {game.week}
                    </span>
                  )}
                  <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    {formatDate(game.date)}
                  </span>
                </div>
                {game.result && (
                  <span className={`rounded px-2 py-0.5 text-xs font-bold ${getResultColor(game.result)}`}>
                    {game.result}
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
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                    {game.isHome ? 'vs' : '@'} {opponent.name}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    {game.venue}
                  </p>
                </div>
                <div className="text-right">
                  {score ? (
                    <p className="font-bold" style={{ color: 'var(--sm-text)' }}>{score}</p>
                  ) : (
                    <p className="text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                      {game.time}
                    </p>
                  )}
                  {game.broadcast && (
                    <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{game.broadcast}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop view */}
      <table className="hidden w-full md:table">
        <thead>
          <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
            {showWeek && <th className="px-4 py-3">Wk</th>}
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Opponent</th>
            <th className="px-4 py-3">Result</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Venue</th>
            <th className="px-4 py-3">TV</th>
          </tr>
        </thead>
        <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
          {games.map((game) => {
            const opponent = getOpponent(game);
            const score = getScore(game);
            const isCurrent = isCurrentWeek(game);

            return (
              <tr
                key={game.id}
                className={`
                  transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50
                  ${isCurrent ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                `}
              >
                {showWeek && (
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                    {game.week}
                  </td>
                )}
                <td className="px-4 py-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                      {formatDate(game.date)}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--sm-text-muted)' }}>{game.time}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 flex-shrink-0">
                      <Image
                        src={opponent.logo}
                        alt={opponent.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <span className="mr-1 text-xs" style={{ color: 'var(--sm-text-dim)' }}>
                        {game.isHome ? 'vs' : '@'}
                      </span>
                      <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
                        {opponent.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {game.result ? (
                    <span className={`rounded px-2 py-1 text-xs font-bold ${getResultColor(game.result)}`}>
                      {game.result}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {score ? (
                    <span className="font-semibold" style={{ color: 'var(--sm-text)' }}>{score}</span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--sm-text-dim)' }}>—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                  {game.venue}
                </td>
                <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--sm-text-muted)' }}>
                  {game.broadcast || '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
