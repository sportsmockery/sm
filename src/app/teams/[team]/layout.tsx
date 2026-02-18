import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { getTeamBySlug, getTeamSlugs } from '@/lib/teams';
import { getTeamSchedule, getTeamRecord, getStandings, getNextGame } from '@/lib/sportsApi';
import { TeamHeader, TeamNav } from '@/components/teams';

interface TeamLayoutProps {
  children: ReactNode;
  params: Promise<{ team: string }>;
}

export async function generateStaticParams() {
  return getTeamSlugs().map((team) => ({ team }));
}

export default async function TeamLayout({ children, params }: TeamLayoutProps) {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  // Fetch team data in parallel
  const [schedule, standings, nextGame] = await Promise.all([
    getTeamSchedule(teamSlug),
    getStandings(teamSlug),
    getNextGame(teamSlug),
  ]);

  // Calculate record from schedule
  const record = await getTeamRecord(teamSlug);

  // Get standing from standings data
  const teamStanding = standings.find(s => s.team.slug === teamSlug);
  const divisionRank = teamStanding ? standings.indexOf(teamStanding) + 1 : undefined;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--sm-dark)' }}>
      <TeamHeader
        team={team}
        record={record}
        standing={divisionRank ? { division: divisionRank, conference: 0 } : undefined}
        nextGame={nextGame}
      />
      <TeamNav team={team} />
      {children}
    </div>
  );
}
