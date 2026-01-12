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
        <div className="mb-4 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 w-fit">
          <button
            onClick={() => setView('division')}
            className={`
              rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${view === 'division'
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }
            `}
          >
            Division
          </button>
          <button
            onClick={() => setView('conference')}
            className={`
              rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${view === 'conference'
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }
            `}
          >
            Conference
          </button>
        </div>
      )}

      {/* Standings Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {/* Mobile view */}
        <div className="md:hidden">
          {standings.map((entry, index) => {
            const isCurrentTeam = entry.team.slug === currentTeam.slug;

            return (
              <div
                key={entry.team.id}
                className={`
                  border-b border-zinc-100 p-4 last:border-b-0 dark:border-zinc-800
                  ${isCurrentTeam ? 'bg-amber-50 dark:bg-amber-900/20' : ''}
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-zinc-400 dark:text-zinc-500">
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
                      <p className={`font-semibold ${isCurrentTeam ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {entry.team.shortName}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {entry.wins}-{entry.losses}{entry.ties ? `-${entry.ties}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-zinc-900 dark:text-white">{entry.pct}</p>
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
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
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
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
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
                  <td className="px-4 py-3 text-sm font-bold text-zinc-400 dark:text-zinc-500">
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
                      <span className={`font-medium ${isCurrentTeam ? 'text-zinc-900 dark:text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                        {entry.team.name}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                    {entry.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                    {entry.losses}
                  </td>
                  {entry.ties !== undefined && (
                    <td className="px-4 py-3 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                      {entry.ties}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center text-sm font-bold text-zinc-900 dark:text-white">
                    {entry.pct}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400">
                    {entry.gb}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400 lg:table-cell">
                    {entry.homeRecord}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400 lg:table-cell">
                    {entry.awayRecord}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm text-zinc-600 dark:text-zinc-400 xl:table-cell">
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
