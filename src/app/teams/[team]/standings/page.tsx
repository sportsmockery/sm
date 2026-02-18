import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getStandings } from '@/lib/sportsApi';
import { StandingsTable } from '@/components/teams';

interface StandingsPageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: StandingsPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.division} Standings | ${team.name} | Sports Mockery`,
    description: `${team.division} standings and playoff picture for the ${team.name}.`,
  };
}

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  const standings = await getStandings(teamSlug);

  // Find current team's position
  const teamStanding = standings.find(s => s.team.slug === teamSlug);
  const position = teamStanding ? standings.indexOf(teamStanding) + 1 : null;

  return (
    <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
          {team.division} Standings
        </h1>
        {position && (
          <p style={{ color: 'var(--sm-text-muted)' }}>
            {team.shortName} are currently {position === 1 ? '1st' : position === 2 ? '2nd' : position === 3 ? '3rd' : `${position}th`} in the {team.division}
          </p>
        )}
      </div>

      {/* Standings */}
      {standings.length > 0 ? (
        <StandingsTable
          standings={standings}
          currentTeam={team}
          showConference
        />
      ) : (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            Standings data is not available at this time.
          </p>
        </div>
      )}

      {/* Playoff Picture - placeholder for now */}
      {team.sport === 'nfl' && (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ marginBottom: '16px', fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--sm-text)' }}>
            Playoff Picture
          </h2>
          <div className="glass-card" style={{ padding: '24px' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--sm-text-muted)' }}>
              Playoff scenarios and wild card standings will be displayed here as the season progresses.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
