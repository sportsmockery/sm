'use client';

import { TeamStats, Team } from '@/lib/types/sports';

interface TeamStatsDisplayProps {
  stats: TeamStats;
  team: Team;
}

export default function TeamStatsDisplay({ stats, team }: TeamStatsDisplayProps) {
  const formatStat = (value: number | string) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  const getRankColor = (rank: number) => {
    if (rank <= 5) return 'text-emerald-600 dark:text-emerald-400';
    if (rank <= 10) return 'text-blue-600 dark:text-blue-400';
    if (rank <= 16) return 'text-zinc-600 dark:text-zinc-400';
    if (rank <= 25) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRankBg = (rank: number) => {
    if (rank <= 5) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (rank <= 10) return 'bg-blue-100 dark:bg-blue-900/30';
    if (rank <= 16) return 'bg-zinc-100 dark:bg-zinc-800';
    if (rank <= 25) return 'bg-amber-100 dark:bg-amber-900/30';
    return 'bg-red-100 dark:bg-red-900/30';
  };

  return (
    <div className="space-y-6">
      {/* Overall Rankings */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">League Rankings</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Object.entries(stats.rankings).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${getRankBg(value)}`}>
                <span className={`text-xl font-bold ${getRankColor(value)}`}>{value}</span>
              </div>
              <p className="text-sm capitalize text-zinc-600 dark:text-zinc-400">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Offense & Defense Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Offense Stats */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white">Offense</h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Object.entries(stats.offense).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm capitalize text-zinc-600 dark:text-zinc-400">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatStat(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Defense Stats */}
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white">Defense</h3>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {Object.entries(stats.defense).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-6 py-3">
                <span className="text-sm capitalize text-zinc-600 dark:text-zinc-400">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatStat(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
