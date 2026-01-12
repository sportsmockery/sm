import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPlayer, getPlayerStats, getPlayerGameLog, getTeamRoster } from '@/lib/sportsApi';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  PlayerBio,
  PlayerStatsTable,
  PlayerGameLog,
  PlayerNews,
  SimilarPlayers,
} from '@/components/players';

interface PlayerPageProps {
  params: Promise<{ playerId: string }>;
}

export async function generateMetadata({ params }: PlayerPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    return { title: 'Player Not Found' };
  }

  return {
    title: `${player.name} Stats & News | ${player.team.shortName} ${player.position} | Sports Mockery`,
    description: `${player.name} statistics, game log, and latest news. ${player.position} for the ${player.team.name}.`,
    openGraph: {
      title: `${player.name} | Sports Mockery`,
      description: `${player.name} stats and news`,
      images: [player.headshot],
    },
  };
}

export default async function PlayerOverviewPage({ params }: PlayerPageProps) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  // Fetch data in parallel
  const [stats, gameLog, roster] = await Promise.all([
    getPlayerStats(playerId),
    getPlayerGameLog(playerId),
    getTeamRoster(player.team.slug),
  ]);

  // Fetch articles that might mention this player (simplified search)
  const { data: articles } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, featured_image, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Season Stats */}
          {stats.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
                {stats[0].season} Season Stats
              </h2>
              <PlayerStatsTable stats={stats.slice(0, 1)} player={player} />
            </section>
          )}

          {/* Recent Games */}
          {gameLog.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
                Recent Games
              </h2>
              <PlayerGameLog gameLog={gameLog} player={player} limit={5} />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Player Bio */}
          <PlayerBio player={player} />

          {/* Related News */}
          <PlayerNews articles={articles || []} player={player} />

          {/* Similar Players */}
          <SimilarPlayers players={roster} currentPlayer={player} />
        </div>
      </div>
    </main>
  );
}
