'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Player, Team } from '@/lib/types/sports';
import { POSITION_GROUPS } from '@/lib/teams';

interface RosterTableProps {
  players: Player[];
  team: Team;
}

type ViewMode = 'table' | 'grid';
type FilterGroup = 'all' | 'offense' | 'defense' | 'special';

export default function RosterTable({ players, team }: RosterTableProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterGroup, setFilterGroup] = useState<FilterGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'number' | 'name' | 'position'>('number');

  const filteredPlayers = players
    .filter((player) => {
      if (filterGroup !== 'all' && player.positionGroup !== filterGroup) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          player.name.toLowerCase().includes(query) ||
          player.position.toLowerCase().includes(query) ||
          player.number.includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'number':
          return parseInt(a.number) - parseInt(b.number);
        case 'name':
          return a.lastName.localeCompare(b.lastName);
        case 'position':
          return a.position.localeCompare(b.position);
        default:
          return 0;
      }
    });

  const getPositionColor = (positionGroup: string) => {
    switch (positionGroup) {
      case 'offense':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'defense':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'special':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      default:
        return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'injured':
      case 'ir':
        return <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">IR</span>;
      case 'pup':
        return <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">PUP</span>;
      case 'suspended':
        return <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">SUSP</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg p-1" style={{ backgroundColor: 'var(--sm-surface)' }}>
          {(['all', 'offense', 'defense', 'special'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setFilterGroup(group)}
              className="rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors"
              style={filterGroup === group
                ? { backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
                : { color: 'var(--sm-text-muted)' }
              }
            >
              {group === 'all' ? 'All' : group}
            </button>
          ))}
        </div>

        {/* Search and view toggle */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none"
            style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)', color: 'var(--sm-text)' }}
          />

          <div className="flex rounded-lg border" style={{ borderColor: 'var(--sm-border)' }}>
            <button
              onClick={() => setViewMode('table')}
              className="p-2"
              style={viewMode === 'table' ? { backgroundColor: 'var(--sm-surface)' } : {}}
              title="Table view"
            >
              <svg className="h-5 w-5" style={{ color: 'var(--sm-text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="p-2"
              style={viewMode === 'grid' ? { backgroundColor: 'var(--sm-surface)' } : {}}
              title="Grid view"
            >
              <svg className="h-5 w-5" style={{ color: 'var(--sm-text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Player count */}
      <p className="mb-4 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
        {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
      </p>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs font-semibold uppercase tracking-wider" style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-surface)', color: 'var(--sm-text-muted)' }}>
                <th className="px-4 py-3 cursor-pointer" onClick={() => setSortBy('number')}>#</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => setSortBy('name')}>Name</th>
                <th className="px-4 py-3 cursor-pointer" onClick={() => setSortBy('position')}>Pos</th>
                <th className="hidden px-4 py-3 md:table-cell">Ht</th>
                <th className="hidden px-4 py-3 md:table-cell">Wt</th>
                <th className="hidden px-4 py-3 lg:table-cell">Age</th>
                <th className="hidden px-4 py-3 lg:table-cell">Exp</th>
                <th className="hidden px-4 py-3 xl:table-cell">College</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ '--tw-divide-color': 'var(--sm-border)' } as React.CSSProperties}>
              {filteredPlayers.map((player) => (
                <tr
                  key={player.id}
                  className="transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-bold" style={{ color: 'var(--sm-text)' }}>
                    {player.number}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/players/${player.slug}`}
                      className="flex items-center gap-3 hover:underline"
                    >
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
                        <Image
                          src={player.headshot}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'var(--sm-text)' }}>
                          {player.name}
                        </p>
                        {getStatusBadge(player.status)}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${getPositionColor(player.positionGroup)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-sm md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.height}
                  </td>
                  <td className="hidden px-4 py-3 text-sm md:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.weight} lbs
                  </td>
                  <td className="hidden px-4 py-3 text-sm lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.age}
                  </td>
                  <td className="hidden px-4 py-3 text-sm lg:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.experience}
                  </td>
                  <td className="hidden px-4 py-3 text-sm xl:table-cell" style={{ color: 'var(--sm-text-muted)' }}>
                    {player.college}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredPlayers.map((player) => (
            <Link
              key={player.id}
              href={`/players/${player.slug}`}
              className="group overflow-hidden rounded-xl border transition-all hover:shadow-lg"
              style={{ borderColor: 'var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
            >
              <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: 'var(--sm-surface)' }}>
                <Image
                  src={player.headshot}
                  alt={player.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute left-2 top-2">
                  <span
                    className="rounded px-2 py-1 text-lg font-black text-white"
                    style={{ backgroundColor: team.colors.primary }}
                  >
                    {player.number}
                  </span>
                </div>
                {player.status !== 'active' && (
                  <div className="absolute right-2 top-2">
                    {getStatusBadge(player.status)}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold" style={{ color: 'var(--sm-text)' }}>
                  {player.name}
                </p>
                <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
                  {player.position}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
