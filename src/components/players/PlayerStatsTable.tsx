'use client';

import { PlayerStats, Player } from '@/lib/types/sports';

interface PlayerStatsTableProps {
  stats: PlayerStats[];
  player: Player;
}

export default function PlayerStatsTable({ stats, player }: PlayerStatsTableProps) {
  if (stats.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">No statistics available.</p>
      </div>
    );
  }

  // Get stat columns based on the first entry
  const getStatColumns = () => {
    const firstStats = stats[0]?.stats || {};
    const columns = Object.keys(firstStats);

    // Common display names
    const displayNames: Record<string, string> = {
      completions: 'CMP',
      attempts: 'ATT',
      completionPct: 'CMP%',
      yards: 'YDS',
      yardsPerAttempt: 'Y/A',
      touchdowns: 'TD',
      interceptions: 'INT',
      rating: 'RTG',
      qbr: 'QBR',
      sacks: 'SACK',
      rushAttempts: 'R ATT',
      rushYards: 'R YDS',
      rushTD: 'R TD',
      receptions: 'REC',
      targets: 'TGT',
      yardsPerReception: 'Y/R',
      firstDowns: '1D',
      yardsAfterCatch: 'YAC',
      drops: 'DRP',
      longReception: 'LNG',
      tackles: 'TCKL',
      tacklesForLoss: 'TFL',
      qbHits: 'QBH',
      forcedFumbles: 'FF',
      fumbleRecoveries: 'FR',
      passesDefensed: 'PD',
    };

    return columns.map((col) => ({
      key: col,
      label: displayNames[col] || col.toUpperCase(),
    }));
  };

  const columns = getStatColumns();

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="sticky left-0 bg-zinc-50 px-4 py-3 dark:bg-zinc-800/50">Season</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">G</th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.map((seasonStats, index) => (
              <tr
                key={`${seasonStats.season}-${index}`}
                className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              >
                <td className="sticky left-0 bg-white px-4 py-3 font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {seasonStats.season}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {seasonStats.team}
                </td>
                <td className="px-4 py-3 text-center text-zinc-600 dark:text-zinc-400">
                  {seasonStats.games}
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-center text-zinc-900 dark:text-white"
                  >
                    {seasonStats.stats[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {/* Career totals row */}
          {stats.length > 1 && (
            <tfoot>
              <tr className="border-t-2 border-zinc-300 bg-zinc-100 font-semibold dark:border-zinc-700 dark:bg-zinc-800">
                <td className="sticky left-0 bg-zinc-100 px-4 py-3 text-zinc-900 dark:bg-zinc-800 dark:text-white">
                  Career
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">—</td>
                <td className="px-4 py-3 text-center text-zinc-900 dark:text-white">
                  {stats.reduce((sum, s) => sum + s.games, 0)}
                </td>
                {columns.map((col) => {
                  // Sum numeric stats, skip percentage/rate stats
                  const isRate = ['completionPct', 'rating', 'qbr', 'yardsPerAttempt', 'yardsPerReception'].includes(col.key);
                  if (isRate) {
                    return (
                      <td key={col.key} className="px-4 py-3 text-center text-zinc-400">
                        —
                      </td>
                    );
                  }

                  const total = stats.reduce((sum, s) => {
                    const val = s.stats[col.key];
                    return sum + (typeof val === 'number' ? val : 0);
                  }, 0);

                  return (
                    <td key={col.key} className="px-4 py-3 text-center text-zinc-900 dark:text-white">
                      {total}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
