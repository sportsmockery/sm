import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPlayer, getPlayerStats } from '@/lib/sportsApi';
import { PlayerStatsTable } from '@/components/players';

interface StatsPageProps {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: StatsPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    return { title: 'Player Not Found' };
  }

  return {
    title: `${player.name} Career Stats | ${player.team.shortName} | Sports Mockery`,
    description: `${player.name} career statistics and season-by-season breakdown.`,
  };
}

export default async function PlayerStatsPage({ params }: StatsPageProps) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  const stats = await getPlayerStats(playerId);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Career Statistics
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {player.name}&apos;s season-by-season stats
        </p>
      </div>

      {stats.length > 0 ? (
        <PlayerStatsTable stats={stats} player={player} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No career statistics available for {player.name}.
          </p>
        </div>
      )}
    </main>
  );
}
