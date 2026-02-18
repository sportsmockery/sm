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
        <h1 className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
          Career Statistics
        </h1>
        <p style={{ color: 'var(--sm-text-muted)' }}>
          {player.name}&apos;s season-by-season stats
        </p>
      </div>

      {stats.length > 0 ? (
        <PlayerStatsTable stats={stats} player={player} />
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            No career statistics available for {player.name}.
          </p>
        </div>
      )}
    </main>
  );
}
