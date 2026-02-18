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
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
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
        <div className="rounded-xl p-8 text-center" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            Standings data is not available at this time.
          </p>
        </div>
      )}

      {/* Playoff Picture - placeholder for now */}
      {team.sport === 'nfl' && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
            Playoff Picture
          </h2>
          <div className="rounded-xl p-6" style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}>
            <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>
              Playoff scenarios and wild card standings will be displayed here as the season progresses.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
