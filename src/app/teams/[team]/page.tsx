import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getTeamSchedule, getTeamStats, getStandings, getTeamRoster, getInjuryReport } from '@/lib/sportsApi';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  UpcomingGamesWidget,
  RecentResultsWidget,
  TeamNewsWidget,
  StandingsTable,
  InjuryReport,
} from '@/components/teams';
import ARTourButton from '@/components/ar/ARTourButton';

interface TeamPageProps {
  params: Promise<{ team: string }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.name} - Schedule, Roster, Stats | Sports Mockery`,
    description: `Latest ${team.name} news, schedule, roster, stats, and standings. Your source for ${team.shortName} coverage.`,
    openGraph: {
      title: `${team.name} | Sports Mockery`,
      description: `${team.name} schedule, roster, stats, and standings.`,
      images: [team.logo],
    },
  };
}

export default async function TeamOverviewPage({ params }: TeamPageProps) {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  // Fetch all data in parallel
  const [schedule, stats, standings, roster, injuries] = await Promise.all([
    getTeamSchedule(teamSlug),
    getTeamStats(teamSlug),
    getStandings(teamSlug),
    getTeamRoster(teamSlug),
    getInjuryReport(teamSlug),
  ]);

  // Fetch recent articles about this team
  const { data: articles } = await supabaseAdmin
    .from('sm_posts')
    .select('id, title, slug, featured_image, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5);

  // Get key stats based on sport
  const getKeyStats = () => {
    const offense = stats.offense;
    const defense = stats.defense;

    if (team.sport === 'nfl') {
      return [
        { label: 'PPG', value: offense.pointsPerGame || '--' },
        { label: 'YPG', value: offense.yardsPerGame || '--' },
        { label: 'Opp PPG', value: defense.pointsAllowed || '--' },
        { label: 'Sacks', value: defense.sacks || '--' },
      ];
    }
    return [];
  };

  const keyStats = getKeyStats();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          {keyStats.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {keyStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4 text-center"
                  style={{ border: '1px solid var(--sm-border)', backgroundColor: 'var(--sm-card)' }}
                >
                  <p className="text-2xl font-bold" style={{ color: 'var(--sm-text)' }}>
                    {stat.value}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--sm-text-muted)' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Standings Preview */}
          {standings.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-bold" style={{ color: 'var(--sm-text)' }}>
                {team.division} Standings
              </h2>
              <StandingsTable standings={standings} currentTeam={team} />
            </section>
          )}

          {/* Recent Results */}
          <RecentResultsWidget games={schedule} team={team} limit={5} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Games */}
          <UpcomingGamesWidget games={schedule} team={team} limit={3} />

          {/* Injury Report */}
          {injuries.length > 0 && <InjuryReport injuries={injuries} team={team} />}

          {/* AR Stadium Tour */}
          <ARTourButton team={teamSlug} />

          {/* Latest News */}
          <TeamNewsWidget
            articles={articles || []}
            team={team}
            limit={5}
          />
        </div>
      </div>
    </main>
  );
}
