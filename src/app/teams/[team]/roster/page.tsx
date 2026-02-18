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
    <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
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
