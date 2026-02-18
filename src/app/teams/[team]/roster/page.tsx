import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getTeamRoster } from '@/lib/sportsApi';
import { RosterTable } from '@/components/teams';

interface RosterPageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: RosterPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.name} Roster | Sports Mockery`,
    description: `${team.name} current roster with player profiles, positions, and stats.`,
  };
}

export default async function RosterPage({ params }: RosterPageProps) {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  const roster = await getTeamRoster(teamSlug);

  // Count by position group
  const offenseCount = roster.filter(p => p.positionGroup === 'offense').length;
  const defenseCount = roster.filter(p => p.positionGroup === 'defense').length;
  const specialCount = roster.filter(p => p.positionGroup === 'special').length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
          {team.shortName} Roster
        </h1>
        <p style={{ color: 'var(--sm-text-muted)' }}>
          {roster.length} players &bull; {offenseCount} offense, {defenseCount} defense, {specialCount} special teams
        </p>
      </div>

      {/* Roster Table */}
      <RosterTable players={roster} team={team} />
    </main>
  );
}
