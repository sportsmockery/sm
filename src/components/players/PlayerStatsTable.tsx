'use client';

import { PlayerStats, Player } from '@/lib/types/sports';

interface PlayerStatsTableProps {
  stats: PlayerStats[];
  player: Player;
}

export default function PlayerStatsTable({ stats, player }: PlayerStatsTableProps) {
  if (stats.length === 0) {
    return (
      <div className="rounded-xl border p-8 text-center" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        <p style={{ color: 'var(--sm-text-muted)' }}>No statistics available.</p>
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
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
              <th className="sticky left-0 px-4 py-3" style={{ backgroundColor: 'var(--sm-surface)' }}>Season</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">G</th>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-center">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
            {stats.map((seasonStats, index) => (
              <tr
                key={`${seasonStats.season}-${index}`}
                className="transition-colors"
              >
                <td className="sticky left-0 px-4 py-3 font-semibold" style={{ backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}>
                  {seasonStats.season}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--sm-text-muted)' }}>
                  {seasonStats.team}
                </td>
                <td className="px-4 py-3 text-center" style={{ color: 'var(--sm-text-muted)' }}>
                  {seasonStats.games}
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-center"
                    style={{ color: 'var(--sm-text)' }}
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
              <tr className="border-t-2 font-semibold" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)' }}>
                <td className="sticky left-0 px-4 py-3" style={{ backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text)' }}>
                  Career
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--sm-text-muted)' }}>—</td>
                <td className="px-4 py-3 text-center" style={{ color: 'var(--sm-text)' }}>
                  {stats.reduce((sum, s) => sum + s.games, 0)}
                </td>
                {columns.map((col) => {
                  // Sum numeric stats, skip percentage/rate stats
                  const isRate = ['completionPct', 'rating', 'qbr', 'yardsPerAttempt', 'yardsPerReception'].includes(col.key);
                  if (isRate) {
                    return (
                      <td key={col.key} className="px-4 py-3 text-center" style={{ color: 'var(--sm-text-dim)' }}>
                        —
                      </td>
                    );
                  }

                  const total = stats.reduce((sum, s) => {
                    const val = s.stats[col.key];
                    return sum + (typeof val === 'number' ? val : 0);
                  }, 0);

                  return (
                    <td key={col.key} className="px-4 py-3 text-center" style={{ color: 'var(--sm-text)' }}>
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
