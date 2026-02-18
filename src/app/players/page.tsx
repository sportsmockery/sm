import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { getAllTeams } from '@/lib/teams';
import { getTeamRoster } from '@/lib/sportsApi';
import { Player } from '@/lib/types/sports';

export const metadata: Metadata = {
  title: 'Players | Sports Mockery',
  description: 'Search and browse Chicago sports players - Bears, Bulls, Cubs, White Sox, and Blackhawks rosters.',
};

interface PlayersPageProps {
  searchParams: Promise<{ team?: string; position?: string; q?: string }>;
}

export default async function PlayersPage({ searchParams }: PlayersPageProps) {
  const { team: teamFilter, position: positionFilter, q: searchQuery } = await searchParams;
  const teams = getAllTeams();

  // Fetch all rosters
  const allPlayers: Player[] = [];
  for (const team of teams) {
    if (teamFilter && team.slug !== teamFilter) continue;
    const roster = await getTeamRoster(team.slug);
    allPlayers.push(...roster);
  }

  // Filter players
  let filteredPlayers = allPlayers;

  if (positionFilter) {
    filteredPlayers = filteredPlayers.filter((p) => p.position === positionFilter);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredPlayers = filteredPlayers.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query)
    );
  }

  // Get unique positions for filter
  const positions = [...new Set(allPlayers.map((p) => p.position))].sort();

  // Group featured players by position (for when no filters)
  const featuredByPosition = !teamFilter && !positionFilter && !searchQuery
    ? {
        QB: filteredPlayers.filter((p) => p.position === 'QB').slice(0, 4),
        RB: filteredPlayers.filter((p) => p.position === 'RB').slice(0, 4),
        WR: filteredPlayers.filter((p) => p.position === 'WR').slice(0, 4),
      }
    : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--sm-text)' }}>
          Players
        </h1>
        <p className="mt-2" style={{ color: 'var(--sm-text-muted)' }}>
          Search and browse Chicago sports players
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        {/* Search */}
        <form className="flex-1 min-w-[200px]">
          <input
            type="search"
            name="q"
            placeholder="Search players..."
            defaultValue={searchQuery}
            className="w-full px-4 py-2 focus:outline-none"
            style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text)', borderRadius: '12px' }}
          />
        </form>

        {/* Team Filter */}
        <select
          name="team"
          defaultValue={teamFilter || ''}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set('team', e.target.value);
            } else {
              url.searchParams.delete('team');
            }
            window.location.href = url.toString();
          }}
          className="px-4 py-2 focus:outline-none"
          style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text)', borderRadius: '12px' }}
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team.slug} value={team.slug}>
              {team.shortName}
            </option>
          ))}
        </select>

        {/* Position Filter */}
        <select
          name="position"
          defaultValue={positionFilter || ''}
          onChange={(e) => {
            const url = new URL(window.location.href);
            if (e.target.value) {
              url.searchParams.set('position', e.target.value);
            } else {
              url.searchParams.delete('position');
            }
            window.location.href = url.toString();
          }}
          className="px-4 py-2 focus:outline-none"
          style={{ backgroundColor: 'var(--sm-surface)', border: '1px solid var(--sm-border)', color: 'var(--sm-text)', borderRadius: '12px' }}
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* Featured sections (no filters) */}
      {featuredByPosition && (
        <div className="space-y-8">
          {Object.entries(featuredByPosition).map(([position, players]) => (
            players.length > 0 && (
              <section key={position}>
                <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
                  {position === 'QB' ? 'Quarterbacks' : position === 'RB' ? 'Running Backs' : 'Wide Receivers'}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                  {players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </section>
            )
          ))}
        </div>
      )}

      {/* Filtered results */}
      {(teamFilter || positionFilter || searchQuery) && (
        <>
          <p className="mb-4 text-sm" style={{ color: 'var(--sm-text-muted)' }}>
            {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}
          </div>
        </>
      )}

      {filteredPlayers.length === 0 && (
        <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            No players found matching your criteria.
          </p>
        </div>
      )}
    </main>
  );
}

function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/players/${player.slug}`}
      className="group flex items-center gap-3 rounded-xl p-4 transition-all"
      style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
    >
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--sm-surface)' }}>
        <Image
          src={player.headshot}
          alt={player.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: 'var(--sm-text)' }}>
          {player.name}
        </p>
        <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
          {player.position} • #{player.number}
        </p>
      </div>
      <div className="relative h-8 w-8 flex-shrink-0">
        <Image
          src={player.team.logo}
          alt={player.team.name}
          fill
          className="object-contain"
        />
      </div>
    </Link>
  );
}
