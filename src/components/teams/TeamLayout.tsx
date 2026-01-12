'use client';

import { ReactNode } from 'react';
import { Team, Game } from '@/lib/types/sports';
import TeamHeader from './TeamHeader';
import TeamNav from './TeamNav';

interface TeamLayoutProps {
  team: Team;
  record?: { wins: number; losses: number; ties?: number };
  standing?: { division: number; conference: number };
  nextGame?: Game | null;
  children: ReactNode;
}

export default function TeamLayout({
  team,
  record,
  standing,
  nextGame,
  children,
}: TeamLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <TeamHeader
        team={team}
        record={record}
        standing={standing}
        nextGame={nextGame}
      />
      <TeamNav team={team} />
      <main>{children}</main>
    </div>
  );
}
