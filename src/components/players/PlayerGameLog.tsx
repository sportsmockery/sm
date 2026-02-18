'use client';

import Image from 'next/image';
import { PlayerGameLog as GameLogType, Player } from '@/lib/types/sports';

interface PlayerGameLogProps {
  gameLog: GameLogType[];
  player: Player;
  limit?: number;
}

export default function PlayerGameLog({ gameLog, player, limit }: PlayerGameLogProps) {
  const displayGames = limit ? gameLog.slice(0, limit) : gameLog;

  if (displayGames.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <p style={{ color: 'var(--sm-text-muted)' }}>No game log available.</p>
      </div>
    );
  }

  const getResultColor = (result: string) => {
    if (result === 'W') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (result === 'L') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
  };

  // Get stat columns from game log
  const getStatColumns = () => {
    const firstGame = displayGames[0];
    if (!firstGame?.stats) return [];

    const columns = Object.keys(firstGame.stats);
    const displayNames: Record<string, string> = {
      completions: 'CMP',
      attempts: 'ATT',
      yards: 'YDS',
      touchdowns: 'TD',
      interceptions: 'INT',
      rating: 'RTG',
      receptions: 'REC',
      targets: 'TGT',
      tackles: 'TCKL',
      sacks: 'SACK',
    };

    return columns.slice(0, 6).map((col) => ({
      key: col,
      label: displayNames[col] || col.toUpperCase().slice(0, 4),
    }));
  };

  const columns = getStatColumns();

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Opp</th>
              <th className="px-4 py-3 text-center">Result</th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
            {displayGames.map((game) => (
              <tr
                key={game.gameId}
                className="transition-colors"
              >
                <td className="px-4 py-3">
                  <span className="text-sm font-medium" style={{ color: 'var(--sm-text)' }}>
                    {new Date(game.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative h-6 w-6 flex-shrink-0">
                      <Image
                        src={game.opponent.logo}
                        alt={game.opponent.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                      {game.isHome ? 'vs' : '@'} {game.opponent.abbreviation}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="inline-flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${getResultColor(game.result)}`}>
                      {game.result}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                      {game.score}
                    </span>
                  </div>
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-center text-sm font-medium"
                    style={{ color: 'var(--sm-text)' }}
                  >
                    {game.stats[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
