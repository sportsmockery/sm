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
    <main style={{ maxWidth: 'var(--container-xl)', margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--sm-text)' }}>
            {team.shortName} Schedule
          </h1>
          <p style={{ color: 'var(--sm-text-muted)' }}>
            {wins}-{losses}{ties > 0 ? `-${ties}` : ''} &bull; {schedule.filter(g => g.status === 'final').length} games played
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SeasonSelector team={team} currentSeason={season} />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{
        marginBottom: '24px',
        display: 'flex',
        gap: '4px',
        borderRadius: 'var(--sm-radius-md)',
        padding: '4px',
        width: 'fit-content',
        background: 'var(--sm-surface)',
      }}>
        {[
          { label: 'All Games', value: '' },
          { label: 'Home', value: 'home' },
          { label: 'Away', value: 'away' },
        ].map((tab) => (
          <a
            key={tab.value}
            href={tab.value ? `?filter=${tab.value}` : '?'}
            style={{
              borderRadius: 'var(--sm-radius-sm)',
              padding: '6px 12px',
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              ...(filter || '') === tab.value
                ? { background: 'var(--sm-card)', color: 'var(--sm-text)', boxShadow: 'var(--shadow-sm)' }
                : { color: 'var(--sm-text-muted)' }
            }}
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
