import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { getPlayer, getPlayerStats } from '@/lib/sportsApi';
import { PlayerHeader, PlayerNav } from '@/components/players';

interface PlayerLayoutProps {
  children: ReactNode;
  params: Promise<{ playerId: string }>;
}

export default async function PlayerLayout({ children, params }: PlayerLayoutProps) {
  const { playerId } = await params;
  const player = await getPlayer(playerId);

  if (!player) {
    notFound();
  }

  // Get current season stats for the header
  const stats = await getPlayerStats(playerId);
  const currentStats = stats[0]; // Most recent season

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--sm-dark)' }}>
      <PlayerHeader player={player} stats={currentStats} />
      <PlayerNav player={player} />
      {children}
    </div>
  );
}
