import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getTeamBySlug } from '@/lib/teams';
import { getTeamSchedule } from '@/lib/sportsApi';
import { ScheduleTable, SeasonSelector } from '@/components/teams';

interface SchedulePageProps {
  params: Promise<{ team: string }>;
  searchParams: Promise<{ season?: string; filter?: string }>;
}

export async function generateMetadata({ params }: SchedulePageProps): Promise<Metadata> {
  const { team: teamSlug } = await params;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    return { title: 'Team Not Found' };
  }

  return {
    title: `${team.name} Schedule | Sports Mockery`,
    description: `${team.name} full season schedule with dates, times, opponents, and results.`,
  };
}

export default async function SchedulePage({ params, searchParams }: SchedulePageProps) {
  const { team: teamSlug } = await params;
  const { season, filter } = await searchParams;
  const team = getTeamBySlug(teamSlug);

  if (!team) {
    notFound();
  }

  const schedule = await getTeamSchedule(teamSlug, season);

  // Filter games if filter param exists
  const filteredSchedule = filter
    ? schedule.filter((game) => {
        if (filter === 'home') return game.isHome;
        if (filter === 'away') return !game.isHome;
        if (filter === 'division') {
          // Would need division info on opponent
          return true;
        }
        return true;
      })
    : schedule;

  // Calculate record
  const wins = schedule.filter(g => g.result === 'W').length;
  const losses = schedule.filter(g => g.result === 'L').length;
  const ties = schedule.filter(g => g.result === 'T').length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {team.shortName} Schedule
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            {wins}-{losses}{ties > 0 ? `-${ties}` : ''} • {schedule.filter(g => g.status === 'final').length} games played
          </p>
        </div>

        <div className="flex items-center gap-4">
          <SeasonSelector team={team} currentSeason={season} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800 w-fit">
        {[
          { label: 'All Games', value: '' },
          { label: 'Home', value: 'home' },
          { label: 'Away', value: 'away' },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.value ? `?filter=${tab.value}` : '?'}
            className={`
              rounded-md px-3 py-1.5 text-sm font-medium transition-colors
              ${(filter || '') === tab.value
                ? 'bg-white text-zinc-900 shadow dark:bg-zinc-700 dark:text-white'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }
            `}
          >
            {tab.label}
          </a>
        ))}
      </div>

      {/* Schedule Table */}
      <ScheduleTable
        games={filteredSchedule}
        team={team}
        showWeek={team.sport === 'nfl'}
      />
    </main>
  );
}
