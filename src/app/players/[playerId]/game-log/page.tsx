import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getPlayer, getPlayerGameLog } from '@/lib/sportsApi';
import { PlayerGameLog } from '@/components/players';

interface GameLogPageProps {
  params: Promise<{ playerId: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params }: GameLogPageProps): Promise<Metadata> {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    return { title: 'Player Not Found' };
  }

  return {
    title: `${player.name} Game Log | ${player.team.shortName} | Sports Mockery`,
    description: `${player.name} game-by-game statistics and performance log.`,
  };
}

export default async function PlayerGameLogPage({ params, searchParams }: GameLogPageProps) {
  const { playerId } = await params;
  const { season } = await searchParams;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  const gameLog = await getPlayerGameLog(playerId, season);

  // Calculate totals
  const gamesPlayed = gameLog.length;
  const wins = gameLog.filter((g) => g.result === 'W').length;
  const losses = gameLog.filter((g) => g.result === 'L').length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Game Log
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {gamesPlayed} games • {wins}-{losses} record
          </p>
        </div>

        {/* Season selector could go here */}
      </div>

      {gameLog.length > 0 ? (
        <PlayerGameLog gameLog={gameLog} player={player} />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-zinc-500 dark:text-zinc-400">
            No game log available for {player.name}.
          </p>
        </div>
      )}
    </main>
  );
}
