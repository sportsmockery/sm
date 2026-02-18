'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StandingsEntry, Team } from '@/lib/types/sports';

interface StandingsTableProps {
  standings: StandingsEntry[];
  currentTeam: Team;
  showConference?: boolean;
}

export default function StandingsTable({ standings, currentTeam, showConference = false }: StandingsTableProps) {
  const [view, setView] = useState<'division' | 'conference'>('division');

  const getStreakColor = (streak: string) => {
    if (streak.startsWith('W')) return 'text-emerald-600 dark:text-emerald-400';
    if (streak.startsWith('L')) return 'text-red-600 dark:text-red-400';
    return 'text-zinc-600 dark:text-zinc-400';
  };

  return (
    <div>
      {/* View toggle */}
      {showConference && (
        <div className="mb-4 flex gap-1 rounded-lg p-1 w-fit" style={{ backgroundColor: 'var(--sm-surface)' }}>
          <button
            onClick={() => setView('division')}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={view === 'division'
              ? { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
              : { color: 'var(--sm-text-muted)' }
            }
          >
            Division
          </button>
          <button
            onClick={() => setView('conference')}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={view === 'conference'
              ? { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
              : { color: 'var(--sm-text-muted)' }
            }
          >
            Conference
          </button>
        </div>
      )}

      {/* Standings Table */}
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
        {/* Mobile view */}
        <div className="md:hidden">
          {standings.map((entry, index) => {
            const isCurrentTeam = entry.team.slug === currentTeam.slug;

            return (
              <div
                key={entry.team.id}
                className={`
                  border-b p-4 last:border-b-0
                  ${isCurrentTeam ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                `}
                style={{ borderColor: 'var(--sm-border)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold" style={{ color: 'var(--sm-text-dim)' }}>
                      {index + 1}
                    </span>
                    <div className="relative h-8 w-8">
                      <Image
                        src={entry.team.logo}
                        alt={entry.team.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                        {entry.team.shortName}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                        {entry.wins}-{entry.losses}{entry.ties ? `-${entry.ties}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: 'var(--sm-text)' }}>{entry.pct}</p>
                    <p className={`text-sm ${getStreakColor(entry.streak)}`}>{entry.streak}</p>
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
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">Team</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">L</th>
              {standings[0]?.ties !== undefined && (
                <th className="px-4 py-3 text-center">T</th>
              )}
              <th className="px-4 py-3 text-center">PCT</th>
              <th className="px-4 py-3 text-center">GB</th>
              <th className="hidden px-4 py-3 text-center lg:table-cell">Home</th>
              <th className="hidden px-4 py-3 text-center lg:table-cell">Away</th>
              <th className="hidden px-4 py-3 text-center xl:table-cell">Div</th>
              <th className="px-4 py-3 text-center">Strk</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
            {standings.map((entry, index) => {
              const isCurrentTeam = entry.team.slug === currentTeam.slug;

              return (
                <tr
                  key={entry.team.id}
                  className={`
                    transition-colors
                    ${isCurrentTeam
                      ? 'bg-amber-50 dark:bg-amber-900/20'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }
                  `}
                >
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--sm-text-dim)' }}>
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/teams/${entry.team.slug}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="relative h-8 w-8 flex-shrink-0">
                        <Image
                          src={entry.team.logo}
                          alt={entry.team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--sm-text)' }}>
                        {entry.team.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
                    {entry.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
                    {entry.losses}
                  </td>
                  {entry.ties !== undefined && (
                    <td className="px-4 py-3 text-center text-sm font-semibold" style={{ color: 'var(--sm-text)' }}>
                      {entry.ties}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center text-sm font-bold" style={{ color: 'var(--sm-text)' }}>
                    {entry.pct}
                  </td>
                  <td className="px-4 py-3 text-center text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                    {entry.gb}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {entry.homeRecord}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {entry.awayRecord}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm xl:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {entry.divisionRecord}
                  </td>
                  <td className={`px-4 py-3 text-center text-sm font-semibold ${getStreakColor(entry.streak)}`}>
                    {entry.streak}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
