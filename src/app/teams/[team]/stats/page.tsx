import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getTeamStats, getTeamRoster, getPlayerStats } from '@/lib/sportsApi';
import { TeamStatsDisplay, SeasonSelector } from '@/components/teams';
import Link from 'next/link';
import Image from 'next/image';

interface StatsPageProps {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ season?: string }>;
}

export async function generateMetadata({ params }: StatsPageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.name} Stats | Sports Mockery`,
    description: `${team.name} team statistics, rankings, and stat leaders.`,
  };
}

export default async function StatsPage({ params, searchParams }: StatsPageProps) {
  const { team: teamSlug } = await params;
  const { season } = await searchParams;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  const [stats, roster] = await Promise.all([
    getTeamStats(teamSlug, season),
    getTeamRoster(teamSlug),
  ]);

  // Get stat leaders (would come from player stats in real implementation)
  const statLeaders = [
    { category: 'Passing Yards', player: roster.find(p => p.position === 'QB'), value: '2,567' },
    { category: 'Rushing Yards', player: roster.find(p => p.position === 'RB'), value: '654' },
    { category: 'Receiving Yards', player: roster.find(p => p.position === 'WR'), value: '789' },
    { category: 'Sacks', player: roster.find(p => p.position === 'DE'), value: '8.5' },
    { category: 'Tackles', player: roster.find(p => p.position === 'ILB'), value: '78' },
    { category: 'Interceptions', player: roster.find(p => p.position === 'CB'), value: '4' },
  ].filter(l => l.player);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {team.shortName} Stats
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {stats.season} Season Statistics
          </p>
        </div>

        <SeasonSelector team={team} currentSeason={season} />
      </div>

      {/* Team Stats Display */}
      <TeamStatsDisplay stats={stats} team={team} />

      {/* Stat Leaders */}
      {statLeaders.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
            Team Leaders
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statLeaders.map((leader) => (
              <Link
                key={leader.category}
                href={`/players/${leader.player?.slug}`}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  {leader.player && (
                    <Image
                      src={leader.player.headshot}
                      alt={leader.player.name}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    {leader.category}
                  </p>
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                    {leader.player?.name}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-zinc-900 dark:text-white">
                    {leader.value}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
